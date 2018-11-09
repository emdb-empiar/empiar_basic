// openPopup.js
//
// Authors:
//		Andrii Iudin
//
// Description:
// 		Create the pop-up that will be automatically closed and redirect the main window to the "next" URL
//
// Date:
//		20160229
//
// Copyright [2013-18] EMBL - European Bioinformatics Institute
// Licensed under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in
// compliance with the License. You may obtain a copy of
// the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied. See the License for the
// specific language governing permissions and limitations
// under the License.
//

// Initialization function for EMPIAR.FileControl called by the constructor
// @param url: the URL that will be opened in pop-up - should contain '?next' parameter to open the next page. 
// Otherwise the default deposition page is opened
function openPopup(url) {
    var w = 800;
    var h = 500;
    var left = 100;
    var top = 100;

    var settings = 'height=' + h + ',width=' + w + ',';
    var isFirefox = typeof InstallTrigger !== 'undefined';
    if (!(isFirefox))
    	settings += 'left=' + left + ',top=' + top;

    settings += ',resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes,directories=no,status=yes';

    window.open(url, "", settings);
}
