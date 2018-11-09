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
import logging
import os
import urllib
from operator import itemgetter

import requests
from builtins import IOError, range, any as b_any
from django.http import Http404, StreamingHttpResponse
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.cache import never_cache
from past.builtins import cmp
from ratelimit.decorators import ratelimit
from settings import RATE_LIMIT, BURST_RATE_LIMIT, EMDBGlobal, LOCAL_HOSTS
from zipstreamE import ZipStream

from .util import entry_dir_listing, android_safe_names, reverse_sizeof_fmt, get_resolution

logging.basicConfig()
logger = logging.getLogger(__name__)


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
def empiar_json(request):
    """
    Return JSON structure that will allow the EMPIAR data table with all the entries (pdbe.org/empiar) to be constructed

    @param request: request object
    @return if a callback function was specified then return JSONP otherwise return JSON
    """
    if any(s in EMDBGlobal.project_root for s in LOCAL_HOSTS):
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


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
def main_table(request):
    """
    Produce the JSON for jQuery UI datatable for the main EMPIAR page

    @param request: request object
    @return return the JSON with the information about EMPIAR entries
    """
    draw = request.GET.get('draw')
    columns = [dict() for i in range(6)]
    for i in range(6):
        columns[i]["data"] = request.GET.get('columns[' + str(i) + '][data]')
        columns[i]["name"] = request.GET.get('columns[' + str(i) + '][name]')
        columns[i]["searchable"] = request.GET.get('columns[' + str(i) + '][searchable]')
        columns[i]["orderable"] = request.GET.get('columns[' + str(i) + '][orderable]')
        columns[i]["search"] = {'value': request.GET.get('columns[' + str(i) + '][search][value]'),
                                'regex': request.GET.get('columns[' + str(i) + '][search][regex]')}

        if columns[i]["data"] is None or columns[i]["data"] is None or columns[i]["searchable"] is None or \
                columns[i]["orderable"] is None or columns[i]["search"] is None:
            raise Http404

    column = request.GET.get('order[0][column]')
    directory = request.GET.get('order[0][dir]')

    if column is None or directory is None:
        raise Http404

    order = [{"column": int(column), "dir": directory}]
    reverse_sort_order = False
    if order[0]["dir"] == "desc":
        reverse_sort_order = True

    start = int(request.GET.get('start'))
    length = int(request.GET.get('length'))
    search = {'value': request.GET.get('search[value]'), 'regex': request.GET.get('search[regex]')}

    response_dict = {"draw": draw}
    if any(s in EMDBGlobal.project_root for s in LOCAL_HOSTS):
        # From local deposition system
        try:
            f = open(EMDBGlobal.empiar_json_path_dep, "rb")
            empiar_json_txt = f.read()
            f.close()
        except IOError as e:
            logger.error(e)
            return HttpResponse("Error")
    else:
        try:
            f = open(EMDBGlobal.empiar_json_path, "rb")
            empiar_json_txt = f.read()
            f.close()
        except IOError as e:
            logger.error(e)
            return HttpResponse("Error")

    if empiar_json_txt:
        empiar_json_obj = json.loads(empiar_json_txt)
        empiar_entries = empiar_json_obj["data"]

        filtered_entries = [entryInfo for entryInfo in empiar_entries if
                            b_any(search["value"].lower() in cell.lower() for cell in entryInfo)]

        if order[0]["column"] == 4:
            sorted_filtered_entries = sorted(filtered_entries, key=itemgetter(4),
                                             cmp=lambda x, y: cmp(reverse_sizeof_fmt(x, 'B'),
                                                                  reverse_sizeof_fmt(y, 'B')),
                                             reverse=reverse_sort_order)
        elif order[0]["column"] == 5:
            sorted_filtered_entries = sorted(filtered_entries, key=itemgetter(8),
                                             cmp=lambda x, y: cmp(get_resolution(x), get_resolution(y)),
                                             reverse=reverse_sort_order)
        else:
            sorted_filtered_entries = sorted(filtered_entries, key=itemgetter(order[0]["column"]),
                                             reverse=reverse_sort_order)

        response_dict["recordsTotal"] = empiar_json_obj["recordsTotal"]
        response_dict["data"] = sorted_filtered_entries[start:length + start]
        response_dict["recordsFiltered"] = len(sorted_filtered_entries)

    return HttpResponse(json.dumps(response_dict), content_type="application/json")


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
def empiar_entry(request, entry_name):
    """
    Return the information about the EMPIAR entry (empiar.org/EMPIAR-#####) that is used to
    fill the entry summary table

    @param request: request object
    @param entry_name: name of the entry in archive
    @return return entry information for templates to handle
    """
    entry_dict = {
        'entryName': entry_name,
        'emdb_global': EMDBGlobal
    }

    return render(request, 'empiar_entry.html', entry_dict)


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


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
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
            if "msie 7.0" in user_agent or "msie 8.0" in user_agent or "mspie 7.0" in user_agent or \
                    "mspie 8.0" in user_agent:
                response['Content-Disposition'] = "attachment; filename=" + urllib.quote(store_as)
            # Android built-in download manager (all browsers on android):
            elif "android" in user_agent:
                response['Content-Disposition'] = "attachment; filename=\"" + android_safe_names(store_as) + "\""
            else:
                response[
                    'Content-Disposition'] = "attachment; filename=\"" + store_as + "\"; filename*=UTF-8''" + \
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


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
@never_cache
def empiar_entry_thumbnail(request, entry_id):
    """
    Check whether a thumbnail for a file exists or not. Also gets IDs of the previous and the
    next files in jsTree node structure, if they are available.

    @param request: request object
    @param entry_id: the ID of the entry
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
                js_node_response = list_entry_dir(request, entry_id, node_id, '-1')
                cur_nodes = json.loads(js_node_response.content)
                for tmp_id in range(len(cur_nodes)):
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
                                    (prev_file_path_wo_ext, prev_file_ext) = os.path.join(
                                        EMDBGlobal.empiar_thumbnails_path, prev_file_path).rsplit('.', 1)
                                    prev_image_file_path = prev_file_path_wo_ext + image_file_extension
                                    if is_readable_file(cur_nodes[tmp_prev_node_id]['type'], '.' + prev_file_ext,
                                                        prev_image_file_path):
                                        prev_node_id = cur_nodes[tmp_prev_node_id]['id']
                                    tmp_prev_node_id -= 1

                            if tmp_id < len(cur_nodes) - 1:
                                tmp_next_node_id = tmp_id + 1
                                while not next_node_id and tmp_next_node_id < len(cur_nodes):
                                    next_file_path = os.path.join(dir_path, cur_nodes[tmp_next_node_id]['name'])
                                    (next_file_path_wo_ext, next_file_ext) = os.path.join(
                                        EMDBGlobal.empiar_thumbnails_path, next_file_path).rsplit('.', 1)
                                    next_image_file_path = next_file_path_wo_ext + image_file_extension
                                    if is_readable_file(cur_nodes[tmp_next_node_id]['type'], '.' + next_file_ext,
                                                        next_image_file_path):
                                        next_node_id = cur_nodes[tmp_next_node_id]['id']
                                    tmp_next_node_id += 1

                            # Get OMERO id
                            try:
                                conn = psycopg2.connect(EMDBGlobal.omero_database_string)
                                cur = conn.cursor()
                                try:
                                    cur.execute("SELECT id from image WHERE image.name = '" + entry_path + "'")
                                    try:
                                        rows = cur.fetchall()
                                        omero_id = rows[0][0]
                                    except Exception as e:
                                        logger.error('Unable to fetch SQL query results')
                                        logger.error(e)
                                except Exception as e:
                                    logger.error('Unable to select id for an image name = ' + entry_path)
                                    logger.error(e)
                                try:
                                    conn.close()
                                except Exception as e:
                                    logger.error('Unable to close Postgres connection for image ' + entry_path)
                                    logger.error(e)
                            except Exception as e:
                                logger.error('Unable to connect to the OMERO database:')
                                logger.error(e)
    except Exception as e:
        logger.error(e)
    result = {'cur_node': cur_node_is_readable, 'prev_node_id': prev_node_id, 'next_node_id': next_node_id,
              'omero_id': omero_id}
    return HttpResponse(json.dumps(result))


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
@never_cache
def empiar_render_thumbnail(request, entry_path):
    """
    Check whether a thumbnail for a file exists or not

    @param request: request object
    @param entry_path: full path to the entry in archive
    @return render the image
    """
    try:
        (file_path_wo_ext, file_ext) = os.path.join(EMDBGlobal.empiar_thumbnails_path, entry_path).rsplit('.', 1)
        file_path = file_path_wo_ext + '.png'
        if os.path.isfile(file_path):
            with open(file_path, "rb") as f:
                return HttpResponse(f.read(), content_type="image/jpeg")
    except Exception as e:
        logger.error('Error rendering a thumbnail:')
        logger.error(e)
    raise Http404


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
def list_entry_dir(request, entry_name, node_id, imageset_id):
    """
    Return JSON structure that will allow the EMPIAR entry tree to be constructed using the lazy loading technique

    @param request: request object
    @param entry_name: name of the entry in archive
    @param node_id: ID number of the node to be searched in the JSON structure
    @param imageset_id: ID number of the Image set that will have its directory structure extracted from
    the main JSON structure
    @return return JSON
    """
    return entry_dir_listing(entry_name, node_id, imageset_id)


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
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
                logger.error('Error while trying to get Aspera token:')
                logger.error(e)
                raise
            response_json = r.json()
            r.close()
            if 'transfer_specs' in response_json and len(response_json['transfer_specs']) and 'transfer_spec' in \
                    response_json['transfer_specs'][0] and \
                    'token' in response_json['transfer_specs'][0]['transfer_spec']:
                token = response_json['transfer_specs'][0]['transfer_spec']['token']

    return HttpResponse(token)


def empiar_scipion_workflow(request, entry_name, filepath):
    """
    Display the SCIPION workflow file

    @param request: request object
    @param entry_name: name of the entry in archive
    @return return entry information for templates to handle
    """
    entry_dict = {
        'entryName': entry_name,
        'filepath': filepath,
        'emdb_global': EMDBGlobal
    }

    return render(request, 'empiar_scipion_workflow.html', entry_dict)


def scipion_workflow_json(request, entry_name, filepath):
    """
    Return JSON with Scipion workflow

    @param request: request object
    @return if a callback function was specified then return JSONP otherwise return JSON
    """
    try:
        full_filepath = os.path.join(EMDBGlobal.ftp_empiar_public_path, 'archive', entry_name, filepath)
        f = open(full_filepath, "rb")
        response = f.read()
        f.close()
    except IOError as e:
        logger.error(e)
        return HttpResponse("Error")
    return HttpResponse(response, content_type="application/json")
