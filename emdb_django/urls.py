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
    from django.conf.urls import include, url
except ImportError:
    print "Can not import django.conf items patterns include and url "    
from settings import EMDBGlobal
from core.views.views import show_page

urlpatterns = []


# EMPIAR views that do not depend on EBI infrastructure
import empiar.views
if EMDBGlobal.emdb_env != 'empiar_deposition_prod':
    urlpatterns += [
        url(r'^empiar/main_table/?draw=(?P<draw>[^=]+)&columns[0][data]=(?P<columns_0_data>[^=]+)&columns[0][name]='
            r'(?P<columns_0_name>[^=]+)&columns[0][searchable]=(?P<columns_0_searchable>[^=]+)&columns[0][orderable]='
            r'(?P<columns_0_orderable>[^=]+)&columns[0][search][value]=(?P<columns_0_search_value>[^=]+)&columns[0]'
            r'[search][regex]=(?P<columns_0_search_regex>[^=]+)&columns[1][data]=(?P<columns_1_data>[^=]+)&columns[1]'
            r'[name]=(?P<columns_1_name>[^=]+)&columns[1][searchable]=(?P<columns_1_searchable>[^=]+)&columns[1]'
            r'[orderable]=(?P<columns_1_orderable>[^=]+)&columns[1][search][value]=(?P<columns_1_search_value>[^=]+)&'
            r'columns[1][search][regex]=(?P<columns_1_search_regex>[^=]+)&columns[2][data]=(?P<columns_2_data>[^=]+)&'
            r'columns[2][name]=(?P<columns_2_name>[^=]+)&columns[2][searchable]=(?P<columns_2_searchable>[^=]+)&'
            r'columns[2][orderable]=(?P<columns_2_orderable>[^=]+)&columns[2][search][value]='
            r'(?P<columns_2_search_value>[^=]+)&columns[2][search][regex]=(?P<columns_2_search_regex>[^=]+)&'
            r'columns[3][data]=(?P<columns_3_data>[^=]+)&columns[3][name]=(?P<columns_3_name>[^=]+)&'
            r'columns[3][searchable]=(?P<columns_3_searchable>[^=]+)&columns[3][orderable]='
            r'(?P<columns_3_orderable>[^=]+)&columns[3][search][value]=(?P<columns_3_search_value>[^=]+)&'
            r'columns[3][search][regex]=(?P<columns_3_search_regex>[^=]+)&columns[4][data]='
            r'(?P<columns_4_data>[^=]+)&columns[4][name]=(?P<columns_4_name>[^=]+)&columns[4][searchable]='
            r'(?P<columns_4_searchable>[^=]+)&columns[4][orderable]=(?P<columns_4_orderable>[^=]+)&'
            r'columns[4][search][value]=(?P<columns_4_search_value>[^=]+)&columns[4][search][regex]='
            r'(?P<columns_4_search_regex>[^=]+)&columns[5][data]=(?P<columns_5_data>[^=]+)&columns[5][name]='
            r'(?P<columns_5_name>[^=]+)&columns[5][searchable]=(?P<columns_5_searchable>[^=]+)&columns[5][orderable]='
            r'(?P<columns_5_orderable>[^=]+)&columns[5][search][value]=(?P<columns_5_search_value>[^=]+)&'
            r'columns[5][search][regex]=(?P<columns_5_search_regex>[^=]+)&order[0][column]=(?P<order_0_column>[^=]+)&'
            r'order[0][dir]=(?P<order_0_dir>[^=]+)&start=(?P<start>[^=]+)&length=(?P<length>[^=]+)&'
            r'search[value]=(?P<search_value>[^=]+)&search[regex]=(?P<search_regex>[^=]+)',
            empiar.views.main_table),
        url(r'^empiar/main_table/', empiar.views.main_table),

        url(r'^empiar/get_aspera_token/$', empiar.views.empiar_get_aspera_token),

        url(r'^empiar/$', show_page, {'template_name': 'empiar.html'}),
        url(r'^empiar/faq$', show_page, {'template_name': 'empiar_faq.html'}),
        url(r'^empiar/about$', show_page, {'template_name': 'empiar_about.html'}),

        url(r'^empiar_json/$', empiar.views.empiar_json),
        url(r'^empiar/entry/(?P<entry_name>\w+)/$', empiar.views.empiar_entry),

        url(r'^empiar/entry/(?P<entry_name>[^=]+)/dirStruct=full&list=(?P<node_id>\w+)/(?P<imageset_id>-?\d+)/$',
            empiar.views.list_entry_dir),

        url(r'^empiar/entry/\w+/get_zip/$', empiar.views.get_zip_file),

        url(r'^empiar/entry/(?P<entry_id>\w+)/entry_thumbnail/$', empiar.views.empiar_entry_thumbnail),
        url(r'^empiar/render_thumbnail/(?P<entry_path>.+)/$', empiar.views.empiar_render_thumbnail),
    ]
