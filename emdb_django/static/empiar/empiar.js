// empiar.js
//
// Authors:
//		Ardan Patwardhan
//
// Description:
// 		File controls for downloading empiar files
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
// Version history
// 0.2, 2014/05/24: Added support for upload button. 
//                  General code clean-up and added documentation.

YAHOO.namespace('EMPIAR');

var conf = YAHOO.EMPIAR.ConfigFileControl,
	dom = YAHOO.util.Dom;

// Constructor for YAHOO.EMPIAR.FileControl
// See init() for definition of params
YAHOO.EMPIAR.FileControl = function (params) {
	this.init(params);

};

// Initialization function for YAHOO.EMPIAR.FileControl called by the constructor
// @param params: object with configuration info
// @param params.sessionId: ID to give Aspera session
// @param params.transferContainer: DIV or other HTML element in which to show transfer progress
// @param params.messageContainer: DIV or other HTML element in which to show error/warning messages etc.
YAHOO.EMPIAR.FileControl.prototype.init = function (params) {
	var self = this;
	
	self.transferDiv = null;
	self.transferInfoDiv = null;
	self.progressBar = null;
	self.progressBarTextDiv = null;
	self.transferPauseButton = null;
	self.transferResumeButton = null;
	self.transferAbortButton = null;
	self.requestId = null;
	self.transferId = null;
	self.transferStatus = null;
	self.asperaWeb = new AW.Connect();
	self.pluginInstalled = self.checkAsperaVersion({messageContainer: params.messageContainer});
	if (self.pluginInstalled) {
		self.sessionId = self.asperaWeb.initSession(params.sessionId);
		self.asperaWeb.addEventListener('transfer', function(event, obj) { self.handleTransferEvents(event, obj, params.transferContainer); });
	}
	dom.setStyle(params.transferContainer, 'display', 'none');
};

// Check Aspera version and warn user appropriately
// @param params: object with configuration info
// @param params.messageContainer: DIV to display messages about whether Aspera components are installed
// @return: true/false depending on whether Aspera plugin is correctly installed
YAHOO.EMPIAR.FileControl.prototype.checkAsperaVersion = function (params) {
	var self = this,
		msg ='',
		mDiv, 
		installed = false;
	
	var ver = self.asperaWeb.version();
	
	if (!ver.connect.installed) {
		msg = '<p>To get started, please install <a target="_blank" href="' + conf.asperaDownloadConnectPath + '">Aspera Connect</a> and reload this page. This software makes it easier to handle very large files and is required for up/download of EMPIAR data.</p>';
	} else if (AW.utils.versionLessThan(ver.connect.version, '2.8')) {
		msg = '<p>Installed Aspera Connect is version: ' + ver.connect.version + '. Please install a newer version of <a target="_blank" href="' + conf.asperaDownloadConnectPath + '">Aspera Connect</a> and reload this page.</p>';
	} else if (!ver.plugin.installed) {
		msg = '<p>The browser plugin for Aspera is not installed! Please <a target="_blank" href="' + conf.asperaDownloadConnectPath + '">download</a> and install it and then reload this page.</p>';
	} else if (AW.utils.versionLessThan(ver.plugin.version, '2.8')) {
		msg = '<p>Installed browser plugin is version: ' + ver.plugin.version + '. Please <a target="_blank" href="' + conf.asperaDownloadConnectPath + '">download</a> and install a newer version and reload this page.</p>';
	} else {
		installed = true;
	}
	mDiv = YAHOO.util.Dom.get(params.messageContainer);
	if (msg) {		
		mDiv.innerHTML = msg;
		YAHOO.util.Dom.setStyle(mDiv, 'display', 'block');
	}
	else {
		YAHOO.util.Dom.setStyle(mDiv, 'display', 'none');
	}
	return installed;
};

// Hide or show parts of the transfer panel, e.g., transferInfoDiv: 0/1 -> hide/show
// @param params: object containing switches to control visibility of different parts of the control panel
// @param params.transferInfoDiv: transfer text message; 0/1 -> hide/show
// @param params.progressBar: progress bar graphic; 0/1 -> hide/show
// @param params.progressBarTextDiv: progress as percentage; 0/1 -> hide/show
// @param params.transferPauseButton: 0/1 -> hide/show
// @param params.transferResumeButton: 0/1 -> hide/show
// @param params.transferAbortButton: 0/1 -> hide/show
YAHOO.EMPIAR.FileControl.prototype.showHideTransferComponents = function (params) {
	if (params.transferInfoDiv) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.transferInfoDiv, 'display', 'block');
	}
	else {
		dom.setStyle(this.transferInfoDiv, 'display', 'none');
	}
	if (params.progressBar) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.progressBar, 'display', 'block');
	}
	else {
		dom.setStyle(this.progressBar, 'display', 'none');
	}	
	if (params.progressBarTextDiv) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.progressBarTextDiv, 'display', 'block');
	}
	else {
		dom.setStyle(this.progressBarTextDiv, 'display', 'none');
	}	
	if (params.transferPauseButton) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.transferPauseButton, 'display', 'inline-block');
	}
	else {
		dom.setStyle(this.transferPauseButton, 'display', 'none');
	}	
	if (params.transferResumeButton) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.transferResumeButton, 'display', 'inline-block');
	}
	else {
		dom.setStyle(this.transferResumeButton, 'display', 'none');
	}
	if (params.transferAbortButton) {
		dom.setStyle(this.transferDiv, 'display', 'block');
		dom.setStyle(this.transferAbortButton, 'display', 'inline-block');
	}
	else {
		dom.setStyle(this.transferAbortButton, 'display', 'none');
	}	
	// Do not show the transferDiv if none of the children are to be shown
	if (!params.transferInfoDiv && !params.progressBar && !params.progressBarTextDiv && !params.transferPauseButton && !params.transferResumeButton && !params.transferAbortButton) {
		dom.setStyle(this.transferDiv, 'display', 'none');
	}
}

// Event handler for Aspera transfer events 
// @param event: event triggering handler - not currently used
// @param obj: object with information about the transfer
// @param divId: DIV ID for panel used to display transfer info
YAHOO.EMPIAR.FileControl.prototype.handleTransferEvents = function (event, obj, divId) {
	var self = this,
		transferDiv,
		transferPauseId,
		transferResumeId,
		progressPercent,
		infoText = '';

	if (obj.error_code === -1) {
		// Handle case when unable to contact Connect
		alert(obj.error_desc);
	}
	
	self.transferId = obj.uuid;
	self.requestId = obj.aspera_connect_settings.request_id;
	self.transferStatus = obj.status;
	
	// Get transfer div if null
	if(!this.transferDiv) {
		this.transferDiv = YAHOO.util.Dom.get(divId);
	}
	
	// Create transfer info div if it does not exist
	if(!this.transferInfoDiv) {
		this.transferInfoDiv = document.createElement('div');
		this.transferDiv.appendChild(this.transferInfoDiv);		
	}
	
	// If filename exists and/or status - add to info text
	if(obj.current_file) {
		infoText += obj.current_file + ', ';
	}
	if(obj.status) {
		infoText += obj.status;
	}
	this.transferInfoDiv.innerHTML = infoText;
	
	// Create progress bar if it does not exist
	if(!this.progressBar) {
		this.progressBar = new YAHOO.widget.ProgressBar({
		    direction: "ltr",
		    height: "10px",
		    width: "200px"
		}).render(this.transferDiv);
	}
	
	// Create progress bar text div if it does not exist
	if(!this.progressBarTextDiv) {
		this.progressBarTextDiv = document.createElement('div');
		this.transferDiv.appendChild(this.progressBarTextDiv);
	}
	
	if (obj.percentage) {
		progressPercent = obj.percentage * 100;
		this.progressBar.set('value', progressPercent);
		this.progressBarTextDiv.innerHTML = progressPercent.toFixed(1);
	}
	
	
	
	// Create pause button if it does not exist
	transferPauseId = divId + '_pause'
	if(!this.transferPauseButton) {
		this.transferPauseButton = new YAHOO.widget.Button({
		    id: transferPauseId, 
		    type: "button", 
		    label: "Pause", 
		    container: this.transferDiv 
		});		
		
		var transferPauseButtonClick = function (e, fcObj) {
			if (fcObj.transferId !== null && (fcObj.transferStatus === "initiating" || fcObj.transferStatus === "running")) {
				fcObj.requestId = fcObj.asperaWeb.stopTransfer(fcObj.transferId);
			}
		};
		 
		this.transferPauseButton.on("click", function(e) { transferPauseButtonClick(e, self); });
	}


	
	// Create resume button if it does not exist
	transferResumeId = divId + '_resume'
	if(!this.transferResumeButton) {
		this.transferResumeButton = new YAHOO.widget.Button({
		    id: transferResumeId, 
		    type: "button", 
		    label: "Resume", 
		    container: this.transferDiv 
		});	
		
		var transferResumeButtonClick = function (e, fcObj) {
			if (fcObj.transferId !== null && (fcObj.transferStatus !== "initiating" && fcObj.transferStatus !== "running")) {
				fcObj.requestId = fcObj.asperaWeb.resumeTransfer(fcObj.transferId);
			}
		};
		 
		this.transferResumeButton.on("click", function(e) { transferResumeButtonClick(e, self); });
	}

	// Create resume button if it does not exist
	transferAbortId = divId + '_abort'
	if(!this.transferAbortButton) {
		this.transferAbortButton = new YAHOO.widget.Button({
		    id: transferAbortId, 
		    type: "button", 
		    label: "Abort", 
		    container: this.transferDiv 
		});	
		
		var transferAbortButtonClick = function (e, fcObj) {
			if (fcObj.transferId !== null) {
				fcObj.requestId = fcObj.asperaWeb.removeTransfer(fcObj.transferId);
				fcObj.transferId = null;
			}
		};
		 
		this.transferAbortButton.on("click", function(e) { transferAbortButtonClick(e, self); });
	}	
	
	// Hide and show components depending on current status
	if (['running', 'queued', 'willretry'].indexOf(self.transferStatus) >= 0) {
		this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 1, transferResumeButton: 0, transferAbortButton: 1});
	}
	else if (self.transferStatus === "initiating") {
		this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 0, progressBarTextDiv: 0, transferPauseButton: 1, transferResumeButton: 0, transferAbortButton: 1});
	}
	else if (self.transferStatus === "cancelled") {
		this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 1, transferAbortButton: 1});	
	}
	else if (['completed', 'removed'].indexOf(self.transferStatus) >= 0) {
		this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});		
		setTimeout(function () { 
			dom.setStyle(self.transferDiv, 'display', 'none');
			/*dom.setStyle(self.transferInfoDiv, 'display', 'none');
			dom.setStyle(self.progressBar, 'display', 'none');
			dom.setStyle(self.progressBarTextDiv, 'display', 'none');*/
		}, 2000);
	}
	else if (['failed'].indexOf(self.transferStatus) >= 0) {
		this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});	
	}
	else {
		this.showHideTransferComponents({ transferInfoDiv: 0, progressBar: 0, progressBarTextDiv: 0, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});
	}
	//progressDiv.innerHTML = (obj.percentage * 100).toFixed(1) + '% complete';
};

// Add download button to page and setup event handlers
// @param params: object with settings on how the button should be setup
// @param params.buttonId: HTML ID to give button element
// @param params.buttonLabel: Label to show on button
// @param params.source: Name of file or directory to download, e.g. archive/junk/
// @param params.downloadContainer: DIV or HTML element in which to put the download button
YAHOO.EMPIAR.FileControl.prototype.addDownloadButton = function (params) {
	var self = this;
	
	var downloadButton = new YAHOO.widget.Button({
	    id: params.buttonId, 
	    type: "button", 
	    label: params.buttonLabel, 
	    container: params.downloadContainer
	});

	if (self.pluginInstalled) {
		var downloadButtonClick = function (e) {
		    self.asperaWeb.showSelectFolderDialog( { success: function(path) { self.download(params.source, path, self);} });
		};
	}
	else {
		var downloadButtonClick = function (e) {
		    alert("In order to download files please install Aspera Connect.");
		};
	}
	downloadButton.on("click", downloadButtonClick); 
	
};

// File download callback handler triggered from YAHOO.EMPIAR.FileControl.prototype.addDownloadButton
// @param source: directory path on Aspera server that is to be downloaded
// @param path: directory path on client where download is to take place
// @param fcObj: YAHOO.EMPIAR.FileControl object
YAHOO.EMPIAR.FileControl.prototype.download = function (source, path, fcObj) {
	var params,
		transferSettings = { 	allow_dialogs: false,
								use_absolute_destination_path: true},
		requestId;
	
	if (path != null && path.length > 0) {
		alert('Download directory: ' + path[0]);
		params = { 	remote_host: conf.remote_host,
					remote_user: conf.remote_user,
					remote_password: conf.remote_password,
					direction: 'receive',
					target_rate_kbps: conf.target_rate_kbps,
					rate_policy: conf.rate_policy,
					cipher: conf.cipher,
					create_dir: true,
					http_fallback: true,
					resume: 'sparse_checksum', // "none","attributes","sparse_checksum","full_checksum"
					destination_root: path[0],
					paths: [{source: source, destination: ''}]
					//paths: [{source: 'archive/junk/dummy', destination: path[0]}]
					};
		requestId = fcObj.asperaWeb.startTransfer(params, 
						transferSettings, 
						{ "error": fcObj.handleStartResponse});
			
	}
};

// Add upload button to page and setup event handlers
// @param params: object with settings on how the button should be setup
// @param params.buttonId: HTML ID to give button element
// @param params.buttonLabel: Label to show on button
// @param params.uploadTokenCodeInputId: Name of input box where the upload token code is specified. This is the name of the destination directory.
// @param params.uploadContainer: DIV or HTML element in which to put the upload button
YAHOO.EMPIAR.FileControl.prototype.addUploadButton = function (params) {
	var self = this;
	
	var uploadButton = new YAHOO.widget.Button({
	    id: params.buttonId, 
	    type: "button", 
	    label: params.buttonLabel, 
	    container: params.uploadContainer 
	});

	if (self.pluginInstalled) {
		var uploadButtonClick = function (e) {
			var tokenInput,
				tokenCode;
			tokenInput = YAHOO.util.Dom.get(params.uploadTokenCodeInputId);
			tokenCode = tokenInput.value;
			if(tokenCode) {
				self.asperaWeb.showSelectFileDialog( { success: function(path) { self.upload( path, tokenCode, self);} });
			}
			else {
				alert('Please enter the Upload token code!');
			}
				
		};
	}
	else {
		var uploadButtonClick = function (e) {
		    alert("In order to upload files please install Aspera Connect.");
		};
	}
	 
	uploadButton.on("click", uploadButtonClick);
};

// File upload callback handler triggered from YAHOO.EMPIAR.FileControl.prototype.addUploadButton
// @param path: array of source file paths
// @param destination: upload token code that forms the last part of the destination directory path
// @param fcObj: YAHOO.EMPIAR.FileControl object
YAHOO.EMPIAR.FileControl.prototype.upload = function (path, destination, fcObj) {
	var params,
		transferSettings = { 	allow_dialogs: false,
								use_absolute_destination_path: false},
		requestId,
		paths = [],
		nPaths,
		i;
	
	if (path != null && path.length > 0) {
		nPaths = path.length;
		for(i=0; i<nPaths; i++) {
			paths.push({source:path[i], destination:''});
		}
		alert('Upload directory: ' + path[0]);
		params = { 	remote_host: conf.remote_host,
					remote_user: conf.remote_user,
					remote_password: conf.remote_password,
					direction: 'send',
					target_rate_kbps: conf.target_rate_kbps,
					rate_policy: conf.rate_policy,
					cipher: conf.cipher,
					create_dir: false,
					http_fallback: true,
					resume: 'sparse_checksum', // "none","attributes","sparse_checksum","full_checksum"
					destination_root: conf.uploadDirectoryPrefix + '/' + destination + '/',
					paths: paths
					//paths: [{source: path[0], destination: ''}]
					//paths: [{source: path, destination: path}]	
					//paths: [{source: 'archive/junk/dummy', destination: path[0]}]
					};
		requestId = fcObj.asperaWeb.startTransfer(params, 
						transferSettings, 
						{ "error": fcObj.handleStartResponse});
			
	}
};

// Error callback function for asperaWeb.startTransfer
// @param responseData: object contains information about the error condition
// @param responseData.error.code: error code
// @param responseData.error.user_message: error message
YAHOO.EMPIAR.FileControl.prototype.handleStartResponse = function(responseData) {
	var code
	, userMessage;
	
	code = responseData.error.code;
	userMessage = responseData.error.user_message;
	alert(userMessage);
	switch(code) {
		case 401: 
			
			break;
		case 900:
			// Content protection not accepted by the destination
			
			break;
		default: 
			
	}
	
};