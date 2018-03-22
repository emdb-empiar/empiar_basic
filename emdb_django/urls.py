"""
urls.py

URL dispatcher - connects url requests to views

Copyright [2012-15] EMBL - European Bioinformatics Institute
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
"""

__author__ = 'Ardan Patwardhan'
__email__ = 'ardan@ebi.ac.uk'
__date__ = '2012-10-30'

# Handle different versions of django. IL 10/Oct/2013
try:
  from django.conf.urls import patterns, include, url
except ImportError:
  try: 
    from django.conf.urls.defaults import patterns, include, url
  except ImportError:
    print "Can not import django.conf items patterns include and url "    
from settings import EMDBGlobal
from core.views.views import show_page

urlpatterns = []


# EMPIAR views that do not depend on EBI infrastructure
import empiar.views
if EMDBGlobal.emdb_env != 'empiar_deposition_prod':
    urlpatterns += [
        url(r'^empiar/get_aspera_token/$', empiar.views.empiar_get_aspera_token),

        url(r'^empiar/$', show_page, {'template_name': 'empiar.html'}),
        url(r'^empiar/faq$', show_page, {'template_name': 'empiar_faq.html'}),
        url(r'^empiar/about$', show_page, {'template_name': 'empiar_about.html'}),

        url(r'^empiar_json/$', empiar.views.empiar_json),
        url(r'^empiar/entry/(?P<entry_name>\w+)/$', empiar.views.empiar_entry),

        url(r'^empiar/entry/(?P<entry_name>[^=]+)/ftpServer=(?P<ftp_server>[^=]+)&dirStruct=(?P<dir_struct>[^=]+)&list=(?P<node_id>\w+)/(?P<image_set_id>-?\d+)/$', empiar.views.list_entry_dir),

        url(r'^empiar/entry/\w+/get_zip/$', empiar.views.get_zip_file),
        url(r'^empiar/entry_legacy/\w+/get_zip/$', empiar.views.get_zip_file),

        url(r'^empiar/entry/(?P<entry_id>\w+)/entry_thumbnail/$', empiar.views.empiar_entry_thumbnail),
        url(r'^empiar/render_thumbnail/(?P<entry_path>.+)/$', empiar.views.empiar_render_thumbnail),
    ]
