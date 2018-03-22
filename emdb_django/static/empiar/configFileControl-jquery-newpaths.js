// configFileControl.js
//
// Authors:
//		Ardan Patwardhan
//
// Description:
// 		Configuration in JSON format for FileControl.js
//
// Date:
//		20130722
//
// Copyright [2013-14] EMBL - European Bioinformatics Institute
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
// Version History
// 0.2, 2014/5/24: Added support for file upload

jQuery.namespace( 'EMPIAR' );

EMPIAR.ConfigFileControl = {
	remote_upload_host: '',
	remote_upload_user: '',
	remote_upload_password: '',
	remote_download_host: '',
	remote_download_user: '',
	download_token: '',
	download_authentication:'token', 
	target_rate_kbps: 200000,
	rate_policy: 'fair',
	cipher: 'none',
	asperaDownloadConnectPath: 'http://downloads.asperasoft.com/download_connect/',
	uploadDirectoryPrefix: ''

};

