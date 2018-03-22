"""
views.py

views specific for empiar without dependency on EBI infrastructure

Copyright [2018] EMBL - European Bioinformatics Institute
Licensed under the Apache License, Version 2.0 (the
"License"); you may not use this file except in
compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on
an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied. See the License for the
specific language governing permissions and limitations
under the License.

Version history
0.1, 2014/07/24: Andrii Iudin
                initial version
"""

__author__ = 'Ardan Patwardhan, Andrii Iudin'
__email__ = 'ardan@ebi.ac.uk, andrii@ebi.ac.uk'
__date__ = '2014-07-24'

import json
import os
import psycopg2

import requests
import urllib
import logging
import traceback

from zipstreamE import ZipStream

from django.http import Http404, StreamingHttpResponse

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from settings import EMDBGlobal

from django.views.decorators.cache import never_cache

from .util import entry_dir_listing, android_safe_names


logger = logging.getLogger(__name__)


def empiar_json(request):
    """
    Return JSON structure that will allow the EMPIAR data table with all the entries (pdbe.org/empiar) to be constructed

    @param request: request object
    @return if a callback function was specified then return JSONP otherwise return JSON
    """
    response = ""

    if EMDBGlobal.project_root == '//127.0.0.1:8000' or EMDBGlobal.project_root == '//10.0.2.2:8000':
        # From local deposition system
        try:
            f = open(EMDBGlobal.empiar_json_path_dep, "rb")
            response = f.read()
            f.close()
        except IOError as e:
            logger.error(e)
            return HttpResponse("Error")
    else:
        try:
            f = open(EMDBGlobal.empiar_json_path, "rb")
            response = f.read()
            f.close()
        except IOError as e:
            logger.error(e)
            return HttpResponse("Error")
    return HttpResponse(response, content_type="application/json")


def empiar_entry(request, entry_name):
    """
    Return the information about the EMPIAR entry (pdbe.org/empiar/entry/entry_name/#####) that is used to
    fill the entry summary table

    @param request: request object
    @param entry_name: name of the entry in archive
    @return return entry information for templates to handle
    """
    entry_dict = dict()
    entry_dict['entryName'] = entry_name
    entry_dict['emdb_global'] = EMDBGlobal

    return render_to_response('empiar_entry.html', entry_dict, context_instance=RequestContext(request))


def add_elements_to_zip(stream, fpath_to_store):
    """
    Add files and/or folders to the stream object

    @param stream: stream object
    @param fpath_to_store: the path to a file or folder that will be stored. This is a path in the archive directory,
    so that it is necessary to join it with the path to the archive itself.
    """
    fpath_to_read = os.path.join(EMDBGlobal.ftp_empiar_public_path, fpath_to_store.strip(os.sep))
    try:
        if os.path.isfile(fpath_to_read):
            stream.add_file(fpath_to_read, fpath_to_store)
        elif os.path.isdir(fpath_to_read):
            list_of_elements = os.listdir(fpath_to_read)
            for element in list_of_elements:
                add_elements_to_zip(stream, os.path.join(fpath_to_store, element))
    except IOError:
        raise Http404


@never_cache
def get_zip_file(request):
    """
    Stream an uncompressed ZIP archive of all the selected files

    @param request: request object. Contains store_as - the name of the ZIP file that will be saved on the user's system
    and file_list - a comma-separated string of file paths to the selected for download files. This is a path in the
    archive directory, so that it is necessary to join it with the path to the archive itself, which is done in
    add_elements_to_zip().
    @return: the streaming response that will serve parts of the ZIP file iteratively
    """
    if request.method == 'POST':
        store_as = request.POST.get('name', 'archive.zip')
        file_list = request.POST.get('parents', '')

        if file_list:
            # Create ZipStream instance, with chunksize set to 32kb
            stream = ZipStream(chunksize=32768)

            # Add files to the stream
            for fpath_to_store in file_list.split(','):
                add_elements_to_zip(stream, fpath_to_store)

            # Prepare the proper response with content type set to Zip file.
            # ZipStream's generator is the data source
            response = StreamingHttpResponse(
                stream.stream(),
                content_type="application/zip")

            # Correct content-disposition for different browsers
            user_agent = request.META['HTTP_USER_AGENT'].lower()
            if ("msie 7.0" in user_agent or "msie 8.0" in user_agent or "mspie 7.0" in user_agent or "mspie 8.0" in
                    user_agent):
                response['Content-Disposition'] = "attachment; filename=" + urllib.quote(store_as)
            # Android built-in download manager (all browsers on android):
            elif "android" in user_agent:
                response['Content-Disposition'] = "attachment; filename=\"" + android_safe_names(store_as) + "\""
            else:
                response['Content-Disposition'] = "attachment; filename=\"" + store_as + "\"; filename*=UTF-8''" + \
                                                  urllib.quote(store_as)

            # Return the response object. Streaming process will be performed by Django, not by this view.
            # We only pass the generator to Django.
            return response
        else:
            raise Http404
    else:
        raise Http404


def is_readable_file(node_type, file_ext, image_file_path):
    """
    Check whether the jsTree node object for thumbnail is a file, belongs to a supported format
    and the thumbnail file exists

    @param node_type: type of the node to check for
    @param file_ext: the extension of the file
    @param image_file_path: full path to the file in upload directory
    @return True if all requirements are satisfied, False otherwise
    """
    file_node_type = (node_type == "file")
    file_is_image = file_ext in [".mrc", ".mrcs", ".dm4", ".tif", ".hed", ".img", ".tbz", ".dat", ".st", ".raw"]
    file_exits = os.path.isfile(image_file_path)

    return file_node_type and file_is_image and file_exits


@never_cache
def empiar_entry_thumbnail(request, entry_id):
    """
    Check whether a thumbnail for a file exists or not. Also gets IDs of the previous and the
    next files in jsTree node structure, if they are available.

    @param request: request object
    @param entry_id: EMPIAR accession code of the entry
    @return JSON that contains information whether the current node is readable and whether there
    are previous and next readable nodes in the jsTree structure
    """
    cur_node_is_readable = False
    prev_node_id = None
    next_node_id = None
    omero_id = None
    image_file_extension = '.png'

    try:
        if request.method == 'POST':
            entry_path = request.POST.get('path', '')
            node_id = request.POST.get('node_id', '')

            if entry_path and node_id:
                # Get the list of nodes available on the current level
                js_node_response = list_entry_dir(request, 'ftp.ebi.ac.uk', EMDBGlobal.empiar_json_dirstruct_dir,
                                                  entry_id, node_id, '-1')
                cur_nodes = json.loads(js_node_response.content)
                for tmp_id in xrange(0, len(cur_nodes)):
                    if int(cur_nodes[tmp_id]['id']) == int(node_id):
                        (file_path_wo_ext, file_ext) = os.path.join(EMDBGlobal.empiar_thumbnails_path,
                                                                    entry_path).rsplit('.', 1)
                        image_file_path = file_path_wo_ext + image_file_extension

                        if is_readable_file(cur_nodes[tmp_id]['type'], '.' + file_ext, image_file_path):
                            cur_node_is_readable = True

                            dir_path = file_path_wo_ext.rsplit('/', 1)[0]

                            if tmp_id > 0:
                                tmp_prev_node_id = tmp_id - 1
                                while not prev_node_id and tmp_prev_node_id > -1:
                                    prev_file_path = os.path.join(dir_path, cur_nodes[tmp_prev_node_id]['name'])
                                    (prev_file_path_wo_ext, prev_file_ext) = \
                                        os.path.join(EMDBGlobal.empiar_thumbnails_path, prev_file_path).rsplit('.', 1)
                                    prev_image_file_path = prev_file_path_wo_ext + image_file_extension
                                    if is_readable_file(cur_nodes[tmp_prev_node_id]['type'],
                                                        '.' + prev_file_ext, prev_image_file_path):
                                        prev_node_id = cur_nodes[tmp_prev_node_id]['id']
                                    tmp_prev_node_id -= 1

                            if tmp_id < len(cur_nodes) - 1:
                                tmp_next_node_id = tmp_id + 1
                                while not next_node_id and tmp_next_node_id < len(cur_nodes):
                                    next_file_path = os.path.join(dir_path, cur_nodes[tmp_next_node_id]['name'])
                                    (next_file_path_wo_ext, next_file_ext) = \
                                        os.path.join(EMDBGlobal.empiar_thumbnails_path, next_file_path).rsplit('.', 1)
                                    next_image_file_path = next_file_path_wo_ext + image_file_extension
                                    if is_readable_file(cur_nodes[tmp_next_node_id]['type'],
                                                        '.' + next_file_ext, next_image_file_path):
                                        next_node_id = cur_nodes[tmp_next_node_id]['id']
                                    tmp_next_node_id += 1

                            try:
                                conn = psycopg2.connect(EMDBGlobal.omero_database_string)
                                cur = conn.cursor()
                            except Exception:
                                logger.error("Unable to connect to the OMERO database:\n" + traceback.format_exc())

                            try:
                                cur.execute("""SELECT id from image WHERE image.name = '""" + entry_path + """'""")
                            except Exception:
                                logger.error("Unable to select id for an image name = " + entry_path)

                            try:
                                rows = cur.fetchall()
                                omero_id = rows[0][0]
                            except Exception:
                                logger.error("Unable to fetch SQL query results")

    except Exception:
        pass

    result = {'cur_node': cur_node_is_readable, 'prev_node_id': prev_node_id,
              'next_node_id': next_node_id, 'omero_id': omero_id}
    return HttpResponse(json.dumps(result))


@never_cache
def empiar_render_thumbnail(request, entry_path):
    """
    Check whether a thumbnail for a file exists or not

    @param request: request object
    @param entry_path: full path to the entry in archive
    @return render the image
    """
    (file_path_wo_ext, file_ext) = os.path.join(EMDBGlobal.empiar_thumbnails_path, entry_path).rsplit('.', 1)
    file_path = file_path_wo_ext + '.png'
    if os.path.isfile(file_path):
        with open(file_path, "rb") as f:
            return HttpResponse(f.read(), content_type="image/jpeg")

    raise Http404


def list_entry_dir(request, ftp_server, dir_struct, entry_name, node_id, image_set_id):
    """
    Return JSON structure that will allow the EMPIAR entry tree to be constructed using the lazy loading technique

    @param request: request object
    @param ftp_server: address of the FTP server
    @param dir_struct: directory that contains JSONs with entry directory structures
    @param entry_name: name of the entry in archive
    @param node_id: ID number of the node to be searched in the JSON structure
    @param image_set_id: ID number of the Image set that will have its directory structure extracted from
    the main JSON structure
    @return return JSON
    """
    return entry_dir_listing(ftp_server, dir_struct, entry_name, node_id, image_set_id)


@never_cache
def empiar_get_aspera_token(request):
    """
    Return to user a token that allows Aspera download

    @param request: request object
    @return: returns the Aspera token
    """

    token = ''
    if request.method == 'POST':
        paths = request.POST.get('paths', '')

        if paths:
            payload = '{"transfer_requests" : [{"transfer_request" : {"paths" : ' + paths + \
                      ',"destination_root" : "/"}}]}'
            try:
                r = requests.post(EMDBGlobal.aspera_token_url, data=payload, verify=False,
                                  auth=(EMDBGlobal.aspera_token_username, EMDBGlobal.aspera_token_password))
            except Exception as e:
                print e
                print traceback.format_exc()
                raise
            response_json = r.json()
            r.close()
            if 'transfer_specs' in response_json and len(response_json['transfer_specs']) and \
                    'transfer_spec' in response_json['transfer_specs'][0] and 'token' in \
                    response_json['transfer_specs'][0]['transfer_spec']:
                token = response_json['transfer_specs'][0]['transfer_spec']['token']

    return HttpResponse(token)
