"""
util.py

Utility functions for the EMPIAR pages

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
0.11, 2016/10/11: Andrii Iudin
                initial version
"""

__author__ = 'Andrii Iudin'
__email__ = 'andrii@ebi.ac.uk'
__date__ = '2016-10-11'

import json
import os
import empiar
import socket
import logging

from socket import error as socket_error
from ftplib import FTP
from django.http import HttpResponse
from settings import EMDBGlobal

logger = logging.getLogger(__name__)

socket.setdefaulttimeout(60)


class Reader:
    def __init__(self):
        self.data = ""

    def __call__(self, s):
        self.data += s


def xstr(s):
    """
    UTF-8 support for strings

    @param s: the input string
    @return utf-8 encoded string
    """
    if s is None:
        return ''
    return str(s.encode('utf-8'))


def android_safe_names(file_name):
    """
    Return file_name with characters made safe for Android devices

    @param file_name: input name of the file to be made safe for Android devices
    @return return file_name
    """
    android_allowed_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._-+,'=()[]{}0123456789"
    for i in xrange(0, len(file_name)):
        if not file_name[i] in android_allowed_chars:
            file_name[i] = '_'
    return file_name


def select_json_part(initial_struct, node_id, top_node, res):
    """
    Select part of the JSON directory structure that corresponds to the requested node ID. A recursive
    function called from the entry_dir_listing request-handling view below. Walks through the jsTree structure
    and selects the directory level with the specified ID. Used in lazy loading of jsTree

    @param initial_struct: initial JSON structure
    @param node_id: ID number of the node that will be searched in JSON structure
    @param top_node: stores the node one level above the node that is currently being searched. This is used to
    set 'children' attributes of all nodes on the level with the requested node_id to True so that jsTree can
    lazy load all those child nodes
    @param res: result, that stores the selected JSON structure which corresponds to tree level of the requested
    node ID
    @return the selected JSON structure res is updated
    """

    # If the initial structure is a dictionary, then it corresponds to a single jsTree node and is suitable for
    # the look-up of the ID. Else, it corresponds to the list of nodes, each of which has to be recursively
    # submitted to the function
    if isinstance(initial_struct, dict):
        # If the ID is found and the current node is the one that has been clicked upon
        if str(initial_struct['id']) == node_id:
            # Go through all elements above the currently clicked node and set their 'children' property
            # to True so that the only information transfered would be that they are a clickable object
            # and the list of the child nodes is not being transfered
            for i in xrange(0, len(top_node)):
                if "children" in top_node[i]:
                    if isinstance(top_node[i]['children'], list) and top_node[i]['children']:
                        top_node[i]['children'] = True
                res.append(top_node[i])
        # If the ID is not found and if there is a 'children' property in the current node
        elif "children" in initial_struct:
            # If the type of the 'children' node information is a list, then recursively
            # execute the function
            if isinstance(initial_struct['children'], list):
                top_node = initial_struct['children']
                initial_struct = initial_struct['children']
                select_json_part(initial_struct, node_id, top_node, res)
    elif isinstance(initial_struct, list):
        for item in initial_struct:
            select_json_part(item, node_id, top_node, res)
    return


def full_entry_dir_listing(ftp_server, dir_struct, entry_name, image_set_id):
    """
    Return Full JSON structure that will allow the EMPIAR entry tree to be constructed using the lazy loading technique
    Separated from the main view so as to be utilized in API for SBF-SEM data

    @param ftp_server: address of the FTP server
    @param dir_struct: directory that contains JSONs with entry directory structures
    @param entry_name: name of the entry in archive
    @param image_set_id: ID number of the Image set that will have its directory structure extracted from
    the main JSON structure
    @return return JSON
    """
    image_set_id = int(image_set_id)
    dir_result = {}
    if EMDBGlobal.project_root == '//C02NJ3LEG3QN.windows.ebi.ac.uk:8000' or \
            EMDBGlobal.project_root == '//127.0.0.1:8000' or EMDBGlobal.project_root == '//10.0.2.2:8000':
        # Make three attempts to connect to the FTP server
        for ftpTries in range(0, 3):
            # Catch AttributeError, if the number of FTP connection attempts is between one and three including,
            # then try to connect again
            try:
                if ftp_server.split('@')[0] != ftp_server:
                    [ftp_username_password, ftp_address] = ftp_server.split('@')
                    [ftp_username, ftp_password] = ftp_username_password.split(':')
                    ftp = FTP(ftp_address)
                    ftp.login(ftp_username, ftp_password)
                else:
                    ftp = FTP(ftp_server)
                    ftp.login()
                ftp.cwd(dir_struct)
                r = Reader()
                # Try to retrieve the JSON file that contains the complete structure of the directory of the EMPIAR 
                # entry
                try:
                    if entry_name + '.json' in ftp.nlst():
                        ftp.retrbinary('RETR ' + entry_name + '.json', r)
                    else:
                        return HttpResponse(
                            '[{"name": "The file with the list of directories does not exist", "text": "The file with '
                            'the list of directories does not exist", "children": false, "state": {"selected": "false"}'
                            ', "type": "file", "id": 1, "size": 0}]',
                            content_type="application/json")
                except Exception as e:
                    logger.error(e)
                    return HttpResponse(
                        '[{"name": "Cannot establish the connection to the server.", "text": "Cannot establish the '
                        'connection to the server.", "children": false, "state": {"selected": "false"}, "type": "file",'
                        ' "id": 1, "size": 0}]',
                        content_type="application/json")
                json_struct = r.data

                # If the requested node is the root directory
                if image_set_id == -1:
                    dir_result = json.loads(json_struct)
                else:
                    # Else extract information about image sets and find the one that corresponds to the requested node
                    ftp.cwd(EMDBGlobal.empiar_headers_dir)
                    r_xml_info = Reader()
                    # Try to retrieve from the FTP server the XML header file that contains information
                    # about the entry
                    try:
                        # Retrieve the complete structure of the directory of the EMPIAR entry
                        ftp.retrbinary('RETR ' + entry_name + '.xml', r_xml_info)
                    except Exception as e:
                        logger.error(e)
                        return HttpResponse(
                            '[{"name": "Cannot establish the connection to the server.", "text": "Cannot establish the '
                            'connection to the server.", "children": false, "state": {"selected": "false"}, "type": '
                            '"file", "id": 1, "size": 0}]',
                            content_type="application/json")
                    entry_info = r_xml_info.data

                    # Parse the entry XML file using EMPIAR module generated with generateDS from the EMPIAR schema
                    x = empiar.parseString(entry_info, silence=True)
                    image_sets = x.get_imageSet()
                    dir_result = {}

                    # Get the path to the image set from XML file that will have its directory structure extracted
                    # from JSON and returned to template and split it for the search that would associate this
                    # path with a JSON structure
                    split_dir_list = image_sets[image_set_id].get_directory().split(os.sep)

                    # Complete JSON structure as a dictionary - top level of the entry directory
                    full_dir_list = json.loads(json_struct)[0]

                    # Contents of the entry directory as a list
                    dir_list = full_dir_list['children']

                    # Name of the top node of the JSON structure
                    top_dir_name = full_dir_list['name']

                    # Walk through the entry directory and associate the image set with
                    # its respective folder in JSON structure
                    for i in xrange(0, len(split_dir_list)):
                        for item in dir_list:
                            # If the directory name in the XML file is the same as in the JSON structure
                            # then move to the list of subdirectores (item['children'])
                            if item['name'] == split_dir_list[i]:
                                dir_list = item['children']
                                if i == len(split_dir_list) - 1:
                                    dir_result = item
                                    dir_result['name'] = os.path.join(top_dir_name,
                                                                      image_sets[image_set_id].get_directory().strip(
                                                                          "/"))
                    # If no image sets were associated, then use the full list of the entry structure as a
                    # starting point for lazy loading association in select_json_part
                    if dir_result == {}:
                        dir_result = full_dir_list

                    ftp.quit()
            except (AttributeError, socket.timeout, socket_error) as e:
                logger.error(e)
                # If an exception is caught and the number of tries to get and process the files from the FTP server
                # if between one and three including, then try again. Else - redirect to the FTP error page
                if ftpTries < 2:
                    continue
                else:
                    return HttpResponse(
                        '[{"name": "Cannot establish the connection to the server.", "text": "Cannot establish the '
                        'connection to the server.", "children": false, "state": {"selected": "false"}, "type": "file",'
                        ' "id": 1, "size": 0}]',
                        content_type="application/json")
            break

    else:
        # Try to retrieve the JSON file that contains the complete structure of the directory of the EMPIAR entry
        filepath = os.path.join(EMDBGlobal.empiar_json_dirstruct_path, entry_name + '.json')

        try:
            f = open(filepath, "rb")
        except IOError:
            return HttpResponse(
                '[{"name": "The file with the list of directories does not exist", "text": "The file with the list of '
                'directories does not exist", "children": false, "state": {"selected": "false"}, "type": "file", "id": '
                '1, "size": 0}]',
                content_type="application/json")
        json_struct = f.read()

        # dir_result has to be a list - as is provided by the output of the dir_struct_and_header_update.py script
        # If the requested node is the root directory
        if image_set_id == -1:
            dir_result = json.loads(json_struct)
        else:
            # Else extract information about image sets and find the one that corresponds to the requested node

            header_filepath = os.path.join(EMDBGlobal.empiar_headers_path, entry_name + '.xml')

            for n_tries in range(3):
                try:
                    f = open(header_filepath, "rb")
                    entry_info = f.read()

                    # Parse the entry XML file using EMPIAR module generated with generateDS from the EMPIAR schema
                    x = empiar.parseString(entry_info, silence=True)

                    image_sets = x.get_imageSet()

                    # Get the path to the image set from XML file that will have its directory structure extracted
                    # from JSON and returned to template and split it for the search that would associate this
                    # path with a JSON structure
                    split_dir_list = image_sets[image_set_id].get_directory().split(os.sep)

                    # Complete JSON structure as a dictionary - top level of the entry directory
                    full_dir_list = json.loads(json_struct)[0]

                    # Contents of the entry directory as a list
                    dir_list = full_dir_list['children']

                    # Name of the top node of the JSON structure
                    top_dir_name = full_dir_list['name']

                    # Walk through the entry directory and associate the image set with
                    # its respective folder in JSON structure
                    for i in xrange(0, len(split_dir_list)):
                        for item in dir_list:
                            # If the directory name in the XML file is the same as in the JSON structure
                            # then move to the list of subdirectores (item['children'])
                            if item['name'] == split_dir_list[i]:
                                dir_list = item['children']
                                if i == len(split_dir_list) - 1:
                                    dir_result = item
                                    dir_result['name'] = os.path.join(top_dir_name,
                                                                      image_sets[image_set_id].get_directory().strip(
                                                                          "/"))
                    # If no image sets were associated, then use the full list of the entry structure as a
                    # starting point for lazy loading association in select_json_part
                    if dir_result == {}:
                        dir_result = full_dir_list
                except IOError:
                    return HttpResponse(
                        '[{"name": "The file with the list of directories does not exist", "text": "The file with the '
                        'list of directories does not exist", "children": false, "state": {"selected": "false"}, "type"'
                        ': "file", "id": 1, "size": 0}]',
                        content_type="application/json")
                except AttributeError:
                    continue
                else:
                    break

    return dir_result


def entry_dir_listing(ftp_server, dir_struct, entry_name, node_id, image_set_id):
    """
    Return JSON structure that will allow the EMPIAR entry tree to be constructed using the lazy loading technique
    Separated from the main view so as to be utilized in API for SBF-SEM data

    @param ftp_server: address of the FTP server
    @param dir_struct: directory that contains JSONs with entry directory structures
    @param entry_name: name of the entry in archive
    @param node_id: ID number of the node to be searched in the JSON structure
    @param image_set_id: ID number of the Image set that will have its directory structure extracted from
    the main JSON structure
    @return return JSON
    """
    image_set_id_int = int(image_set_id)
    dir_result = full_entry_dir_listing(ftp_server, dir_struct, entry_name, image_set_id_int)
    if image_set_id_int != -1:
        if int(node_id) == 1:
            node_id = str(int(dir_result['id']) + int(node_id) - 1)
        dir_result = [dir_result]
    result = []
    top_node = dir_result
    dir_result[0]["state"] = {"selected": "true"}

    # Get the JSON structure in a suitable for jsTree lazy loading format
    select_json_part(dir_result, node_id, top_node, result)
    response = json.dumps(result)

    return HttpResponse(response, content_type="application/json")


def reverse_sizeof_fmt(num, prefix='G'):
    """
    Reverse of presentation of the size in a human-readable format with specification
    of the dimension. Converts it to the specified unit

    @param num: the number that is to be processed
    @param prefix: the unit of the desired result
    @return: the size in a human-readable format with specification of the dimension
    """
    units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']
    (value, dimension) = num.split(' ')

    if len(dimension) == 2:
        current_prefix = dimension[0]
    elif len(dimension) == 1:
        current_prefix = ''
    else:
        raise ValueError

    current_prefix_index = units.index(current_prefix)
    prefix_index = units.index(prefix)

    return round(float(value) * pow(1024, current_prefix_index - prefix_index), 2)
