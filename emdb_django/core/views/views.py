"""
views.py

Some general views 

Copyright [2012-2018] EMBL - European Bioinformatics Institute
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
0.11, 2018/3/19: Andrii Iudin
                clean-up to leave just basics
0.1, 2014/7/17: Ardan Patwardhan
                emdb_sitemap: generate a sitemap for site
                robots: return robots.txt for web crawlers
"""

__author__ = 'Ardan Patwardhan, Andrii Iudin'
__email__ = 'ardan@ebi.ac.uk'
__date__ = '2012-10-30'

from django.shortcuts import render
from settings import EMDBGlobal, RATE_LIMIT, BURST_RATE_LIMIT
from ratelimit.decorators import ratelimit


@ratelimit(key='ip', rate=RATE_LIMIT, block=True)
@ratelimit(key='ip', rate=BURST_RATE_LIMIT, block=True)
def show_page(request, template_name):
    """
    Render page given by template_name
    @param request: http request object
    @param template_name: dynamic html file to render
    """
    return render(request, template_name, {'emdb_global': EMDBGlobal})
