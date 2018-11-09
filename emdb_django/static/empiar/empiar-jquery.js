// empiar-jquery.js
//
// Authors:
//		Ardan Patwardhan
//		Andrii Iudin
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
// 1.0, 2017/01/08: Re-factored Aspera handling
// 0.2, 2014/05/24: Added support for upload button. 
//                  General code clean-up and added documentation.

jQuery.namespace( 'EMPIAR' );

// Global variables to keep track of Aspera plugin for pages with several jsTrees on them
var UploadStarted = false;

// Regex for the check of the filename that the user can assign to the zipped file. Only ascii characters are supported
var ascii = /^[ -~]+$/;

var CONNECT_MIN_VERSION = "3.6.0";
var CONNECT_AUTOINSTALL_LOCATION = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";


function isNullOrUndefinedOrEmpty(x) {
	return x === "" || x === null || typeof x === "undefined";
};


//Make the tooltip copy-able by the user
setupCopyableTooltip = function(){
	$( '.copyable_tooltip' ).tooltip({
        open: function(){
            // Make sure all other tooltips are closed when opening a new one
        $('.copyable_tooltip').not(this).tooltip('close');
        }
    });

    $(document).on('mouseenter', '.ui-tooltip', function(e){
        // Cancel tooltip closing on hover
        clearTimeout(mouseLeaveTimer);
    });

    $(document).on('mouseleave', '.ui-tooltip', function(){
        // Make sure tooltip is closed when the mouse is gone
        $('.copyable_tooltip').tooltip('close');
    });
}

//Make the tooltip copy-able as soon as the page has finished loading
$(document).ready(function () {
	setupCopyableTooltip();
});


// Check if the variable is a function
// @param functionToCheck: the variable that will be checked
function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}


//A function literal that is executed immediately. It is used for postponing the execution of the function until the specified element is inserted into the DOM 
//@property jQuery plugin which runs handler function once specified element is inserted into the DOM
(function ($) {
	// @function
	// @param handler: a function to execute at the time when the element is inserted
	// @param shouldRunHandlerOnce Optional: if true, handler is unbound after its first invocation
	// $(selector).waitUntilExists(function);
	$.fn.waitUntilExists    = function (handler, shouldRunHandlerOnce, isChild) {
	    var found       = 'found';
	    var $this       = $(this.selector);
	    var $elements   = $this.not(function () { return $(this).data(found); }).each(handler).data(found, true);

	    if (!isChild)
	    {
	        (window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] =
	            window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500);
	    }
	    else if (shouldRunHandlerOnce && $elements.length)
	    {
	        window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
	    }
	    return $this;
	}
}(jQuery));


var controls = {
	hide: function () {
		$('.asperaControlElement').hide();
		$('.noAsperaControlElement').show();
	},
	show: function () {
		$('.noAsperaControlElement').hide();
		$('.asperaControlElement').show();
	},
};


// Constructor for EMPIAR.FileControl
// See init() for definition of params
EMPIAR.FileControl = function (params) {
	this.init(params);
};


// Initialization function for EMPIAR.FileControl called by the constructor
// @param params: object with configuration info
// @param params.sessionId: ID to give Aspera session
// @param params.transferContainer: DIV or other HTML element in which to show transfer progress
// @param params.messageContainer: DIV or other HTML element in which to show error/warning messages etc.
EMPIAR.FileControl.prototype.init = function (params) {
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
	self.transferContainer = params.transferContainer;
	self.id = params.id;
	self.paramSessionId = params.sessionId;
	self.entryName = params.entryName;
	
	$('#' + params.transferContainer).css('display', 'none');
};


// Hide or show parts of the transfer panel, e.g., transferInfoDiv: 0/1 -> hide/show
// @param params: object containing switches to control visibility of different parts of the control panel
// @param params.transferInfoDiv: transfer text message; 0/1 -> hide/show
// @param params.progressBar: progress bar graphic; 0/1 -> hide/show
// @param params.progressBarTextDiv: progress as percentage; 0/1 -> hide/show
// @param params.transferPauseButton: 0/1 -> hide/show
// @param params.transferResumeButton: 0/1 -> hide/show
// @param params.transferAbortButton: 0/1 -> hide/show
EMPIAR.FileControl.prototype.showHideTransferComponents = function (params) {
	if (params.transferInfoDiv) {
		$(this.transferDiv).css('display', 'block');
		$(this.transferInfoDiv).css('display', 'block');
	}
	else {
		$(this.transferInfoDiv).css('display', 'none');
	}
	if (params.progressBar) {
		$(this.transferDiv).css('display', 'block');
		$(this.progressBar).css('display', 'block');
	}
	else {
		$(this.progressBar).css('display', 'none');
	}	
	if (params.progressBarTextDiv) {
		$(this.transferDiv).css('display', 'block');
		$(this.progressBarTextDiv).css('display', 'block');
	}
	else {
		$(this.progressBarTextDiv).css('display', 'none');
	}	
	if (params.transferPauseButton) {
		$(this.transferDiv).css('display', 'block');
		$(this.transferPauseButton).css('display', 'inline-block');
	}
	else {
		$(this.transferPauseButton).css('display', 'none');
	}	
	if (params.transferResumeButton) {
		$(this.transferDiv).css('display', 'block');
		$(this.transferResumeButton).css('display', 'inline-block');
	}
	else {
		$(this.transferResumeButton).css('display', "none");
	}
	if (params.transferAbortButton) {
		$(this.transferDiv).css('display', 'block');
		$(this.transferAbortButton).css('display', 'inline-block');
	}
	else {
		$(this.transferAbortButton).css('display', 'none');
	}	
	// Do not show the transferDiv if none of the children are to be shown
	if (!params.transferInfoDiv && !params.progressBar && !params.progressBarTextDiv && !params.transferPauseButton && !params.transferResumeButton && !params.transferAbortButton) {
		$(this.transferDiv).css('display', 'none');
	}
}


// Event handler for Aspera transfer events 
// @param event: event triggering handler - not currently used
// @param obj: object with information about the transfer
// @param divId: DIV ID for panel used to display transfer info
//EMPIAR.FileControl.prototype.handleTransferEvents = function (event, obj, divId, entryName) {
EMPIAR.FileControl.prototype.handleTransferEvents = function (event, allTransfers, divId, entryName) {
	var self = this,
		transferDiv,
		transferPauseId,
		transferResumeId,
		progressPercent,
		infoText = '';
	// Get the latest initiated transfer
	var obj = allTransfers.transfers[allTransfers.transfers.length - 1];

	if (obj) {
		if (obj.error_code === -1) {
			// Handle case when unable to contact Connect
			alert(obj.error_desc);
		}

		self.transferId = obj.uuid;
		//self.requestId = obj.aspera_connect_settings.request_id;
		self.transferStatus = obj.status;

		// Get transfer div if null
		if(!this.transferDiv) {
			this.transferDiv = $('#'+divId);
		}

		// Create transfer info div if it does not exist
		if(!this.transferInfoDiv) {
			this.transferInfoDiv = document.createElement('div');	
			$(this.transferDiv).append(this.transferInfoDiv);	
		}

		// If filename exists and/or status - add to info text
		if(obj.current_file) {
			infoText += obj.current_file + ', ';
		}
		if(obj.status) {
			infoText += obj.status;
		}
		$(this.transferInfoDiv).html(infoText);

		// Create progress bar if it does not exist
		if(!this.progressBar) {
			this.progressBar = document.createElement('div');
			
			$(this.progressBar).progressbar({
				 value: 0
				 });
			$(this.progressBar).height("10px");
			$(this.progressBar).width("200px");
			
			$(this.transferDiv).append(this.progressBar);	
		}

		// Create progress bar text div if it does not exist
		if(!this.progressBarTextDiv) {
			this.progressBarTextDiv = document.createElement('div');
			$(this.transferDiv).append(this.progressBarTextDiv);
		}

		if (obj.percentage) {
			progressPercent = obj.percentage * 100;
			$(this.progressBar).progressbar('value', progressPercent);
			$(this.progressBarTextDiv).html(progressPercent.toFixed(1));
		}

		// Create pause button if it does not exist
		transferPauseId = divId + '_pause'
		if(!this.transferPauseButton) {
			this.transferPauseButton = $('<button/>',
				    {
						id: transferPauseId,
				        label: 'Pause',
				        text: 'Pause',
				        type: 'Button',
				    });
		    $(this.transferDiv).append(this.transferPauseButton);

			var transferPauseButtonClick = function (e, fcObj) {
				if (fcObj.transferId !== null && (fcObj.transferStatus === "initiating" || fcObj.transferStatus === "running")) {
					fcObj.requestId = fcObj.asperaWeb.stopTransfer(fcObj.transferId);
				}
			};

			this.transferPauseButton.on("click", function(e) { transferPauseButtonClick(e, self); });
		}

		// Create resume button if it does not exist
		transferResumeId = divId + '_resume'

		if(! this.transferResumeButton ) {
			this.transferResumeButton = $('<button/>',
				    {
						id: transferResumeId,
				        label: 'Resume',
				        text: 'Resume',
				        type: 'Button',
				    });
		    $(this.transferDiv).append(this.transferResumeButton);

			var transferResumeButtonClick = function (e, fcObj) {
				if (fcObj.transferId !== null && (fcObj.transferStatus !== "initiating" && fcObj.transferStatus !== "running")) {
					fcObj.requestId = fcObj.asperaWeb.resumeTransfer(fcObj.transferId);
				}
			};

			this.transferResumeButton.on("click", function(e) { transferResumeButtonClick(e, self); });
		}

		// Create abort button if it does not exist
		transferAbortId = divId + '_abort'
		if(!this.transferAbortButton) {
			this.transferAbortButton = $('<button/>',
				    {
						id: transferAbortId,
				        label: 'Abort',
				        text: 'Abort',
				        type: 'Button',
				    });
		    $(this.transferDiv).append(this.transferAbortButton);

			var transferAbortButtonClick = function (e, fcObj) {
				if (fcObj.transferId !== null) {
					fcObj.requestId = fcObj.asperaWeb.removeTransfer(fcObj.transferId);
					fcObj.transferId = null;
					
					fcObj.asperaWeb.stop();
					fcObj.showHideTransferComponents({ transferInfoDiv: 0, progressBar: 0, progressBarTextDiv: 0, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});
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
		} else {
			if (self.transferStatus === "cancelled") {
				this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 1, transferAbortButton: 1});	
			} else {
				if (['completed', 'removed'].indexOf(self.transferStatus) >= 0) {
                    this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});
                } else if (['failed'].indexOf(self.transferStatus) >= 0) {
                    this.showHideTransferComponents({ transferInfoDiv: 1, progressBar: 1, progressBarTextDiv: 1, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});
                } else {
                    this.showHideTransferComponents({ transferInfoDiv: 0, progressBar: 0, progressBarTextDiv: 0, transferPauseButton: 0, transferResumeButton: 0, transferAbortButton: 0});
                }

                this.asperaWeb.removeEventListener(AW4.Connect.EVENT.STATUS);

				if (this.transferId !== null) {
					this.requestId = this.asperaWeb.removeTransfer(this.transferId);
					this.transferId = null;

					this.asperaWeb.stop();
				}
				this.asperaWeb.removeEventListener('transfer');
            }
		}
	}
};


// File download callback handler triggered from EMPIAR.FileControl.prototype.addDownloadButtonTree
// @param source: directory path on Aspera server that is to be downloaded
// @param path: directory path on client where download is to take place
// @param fcObj: EMPIAR.FileControl object
EMPIAR.FileControl.prototype.download = function (source, path, asperaTokenUrl, csrfToken) {
	var self=this,
	params,
	transferSettings = { 	allow_dialogs: false,
							use_absolute_destination_path: true},
	requestId;
	if (path != null && path.length > 0) {
		var pathsArray = new Array();
		if (jQuery.type(source) === 'array') {
			for (i=0; i<source.length; ++i) {
				pathsArray[i] = {"source" : source[i]};
			}
		} else {
			pathsArray[0] = {"source" : source};
		}

		if ( null !== asperaTokenUrl && 'undefined' !== typeof asperaTokenUrl ) {
            $.post(asperaTokenUrl, {"paths": JSON.stringify(pathsArray), "csrfmiddlewaretoken": csrfToken})
                .done(function (token) {
                    var transferSpecs = [];
                    transferSpecs.push({
                        "aspera_connect_settings": {
                            // allow_dialogs is true by default.
                            // Added for clarity.
                            "allow_dialogs": false,
                            "back_link": location.href,
                            "use_absolute_destination_path": true
                        },
                        "transfer_spec": {
                            "authentication": conf.download_authentication,
                            "create_dir": true,
                            "token": token,
                            "destination_root": path,
                            "direction": "receive",
                            "http_fallback": true,
                            "paths": pathsArray,
                            "rate_policy": conf.rate_policy,
                            "remote_host": conf.remote_download_host,
                            "remote_user": conf.remote_download_user,
                            "resume": 'sparse_checksum', // "none","attributes","sparse_checksum","full_checksum"
                            "ssh_port": 33001,
                            "target_rate_kbps": conf.target_rate_kbps,
                        }
                    });

                    requestId = self.asperaWeb.startTransfers({'transfer_specs': transferSpecs}, {"error": self.handleStartResponse});
                });
        } else {
			var transferSpecs = [];
			transferSpecs.push({
				  "aspera_connect_settings": {
					  // allow_dialogs is true by default.
					  // Added for clarity.
					  "allow_dialogs": false,
					  "back_link": location.href,
					  "use_absolute_destination_path" : true
				  },
				  "transfer_spec": {
					  // "authentication": conf.download_authentication,
					  "cipher": conf.cipher,
					  "create_dir": true,
					  "destination_root": path,
					  "direction": "receive",
					  "http_fallback": true,
					  "paths": pathsArray,
					  "rate_policy": conf.rate_policy,
					  "remote_host": conf.remote_upload_host,
					  "remote_user": conf.remote_upload_user,
					  "resume": 'sparse_checksum', // "none","attributes","sparse_checksum","full_checksum"
					  "ssh_port": 33001,
					  "target_rate_kbps": conf.target_rate_kbps,
					  "remote_password": conf.remote_upload_password
				  }
			});

			requestId = self.asperaWeb.startTransfers({'transfer_specs': transferSpecs}, {"error": self.handleStartResponse});
		}
	}
};


// Set up listeners for Aspera for showing top screen bar with the status of Aspera installation and 
// for handling the transfer visual elements (progress bar, pause/resume/abort buttons)
EMPIAR.FileControl.prototype.setupAsperaListeners = function () {
	var self = this;

	self.asperaWeb = new AW4.Connect({
		containerId: 'pluginContainer' + self.id,
		id: "aspera_connect_object_container" + self.id,
		minVersion: CONNECT_MIN_VERSION,
		sdkLocation: CONNECT_AUTOINSTALL_LOCATION
	});
	self.connectInstaller = new AW4.ConnectInstaller({sdkLocation : CONNECT_AUTOINSTALL_LOCATION});
	var statusEventListener = function (eventType, data) {
		if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.RUNNING) {
			self.connectInstaller.connected();
		    // Enable controls that require Connect.
			if ($('.jstree').length > 0 && $('.jstree-checked').length < 1) {
				$(".jstree").on("ready.jstree", function(e, data) {
					$('.jstree').jstree("check_all");
				});
				$('.jstree').jstree("check_all");
			}
	    } else {
	    	if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.INITIALIZING) {
				self.connectInstaller.showLaunching();
			} else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.FAILED) {
				self.connectInstaller.showDownload();
				window.scrollTo(0, 0);
			} else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.OUTDATED) {
				self.connectInstaller.showUpdate();
				window.scrollTo(0, 0);
			} else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.RUNNING) {
				self.connectInstaller.connected();
	      }
	    	
	    }
	};
	self.asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, statusEventListener);

	self.sessionId = self.asperaWeb.initSession(self.paramSessionId);
	$(self.transferContainer).show();
	self.asperaWeb.addEventListener('transfer', function(event, obj) { self.handleTransferEvents(event, obj, self.transferContainer, self.entryName); });
}


// Add upload button to page and setup event handlers
// @param params: object with settings on how the button should be setup
// @param params.buttonId: HTML ID to give button element
// @param params.buttonLabel: Button label
// @param params.buttonText: Text element of button
// @param params.uploadTokenCodeInputId: Name of input box where the upload token code is specified. This is the name of the destination directory.
// @param params.uploadContainer: DIV or HTML element in which to put the upload button
EMPIAR.FileControl.prototype.addUploadButton = function (params) {
	var self = this;

	$('#'+params.uploadContainer).append('<div id="' + params.buttonId + "Aspera" + 'Div"></div>');

	var uploadButton = $('<button/>', {
			id: params.buttonId + "Aspera",
	        label: params.buttonLabel + "Aspera",
	        text: params.buttonText + ' files',
	});
	uploadButton.addClass("empiarDownloadButton asperaControlElement icon icon-functional");
	uploadButton.attr("data-icon", "_");
    $('#'+params.buttonId+"Aspera"+'Div').append(uploadButton);
	var uploadButtonClick = function (e) {
		self.setupAsperaListeners();
		self.asperaWeb.showSelectFileDialog({
			success: function(dataTransferObj) {
				if (dataTransferObj.dataTransfer.files[0]) {
					self.upload(dataTransferObj.dataTransfer.files, params.destination, self);
				}
			}
		});
	};
	uploadButton.on("click", uploadButtonClick);

	var uploadButtonDir = $('<button/>', {
			id: params.buttonId + "DirAspera",
	        label: params.buttonLabel + "DirAspera",
	        text: params.buttonText + ' directories',
	});
	uploadButtonDir.addClass("empiarDownloadButton asperaControlElement icon icon-functional");
	uploadButtonDir.attr("data-icon", "_");
	$('#'+params.buttonId+"Aspera"+'Div').append(uploadButtonDir);
	var uploadButtonDirClick = function (e) {
		self.setupAsperaListeners();
		self.asperaWeb.showSelectFolderDialog({
			success: function(dataTransferObj) {
				if (dataTransferObj.dataTransfer.files[0]) {
					self.upload(dataTransferObj.dataTransfer.files, params.destination, self);
				}
			}
		});
	};
	uploadButtonDir.on("click", uploadButtonDirClick);
};


// File upload callback handler triggered from EMPIAR.FileControl.prototype.addUploadButton
// @param path: array of source file paths
// @param destination: upload token code that forms the last part of the destination directory path
// @param fcObj: EMPIAR.FileControl object
EMPIAR.FileControl.prototype.upload = function (paths, destination, fcObj) {
	var params,
		transferSettings = { 	allow_dialogs: false,
								use_absolute_destination_path: false},
		requestId,
		pathsArray = [],
		nPaths,
		i;

	if (paths != null && paths.length > 0) {
		nPaths = paths.length;
		for(i=0; i<nPaths; i++) {
			pathsArray.push({source:paths[i].name, destination:""});
		}

		var transferSpecs = [];
		transferSpecs.push({
		      "aspera_connect_settings": {
		          // allow_dialogs is true by default.
		          // Added for clarity.
		          "allow_dialogs": false,
		          "back_link": location.href,
		          "use_absolute_destination_path" : true
		      },
	          "transfer_spec": {
				  "cipher": conf.cipher,
				  "create_dir": false,
				  "destination_root": destination,
			    	  "direction": "send",
			    	  "http_fallback": true,
			    	  "paths": pathsArray,
			    	  "rate_policy": conf.rate_policy,
			    	  "remote_host": conf.remote_upload_host,
			    	  "remote_user": conf.remote_upload_user,
			    	  "remote_password": conf.remote_upload_password,
			    	  "resume": 'sparse_checksum', // "none","attributes","sparse_checksum","full_checksum"
			    	  "ssh_port": 33001,
			    	  "target_rate_kbps": conf.target_rate_kbps
		      }
	    });

	    requestId = fcObj.asperaWeb.startTransfers({'transfer_specs': transferSpecs}, {"error": fcObj.handleStartResponse});
	}
};


// Error callback function for asperaWeb.startTransfer
// @param responseData: object contains information about the error condition
// @param responseData.error.code: error code
// @param responseData.error.user_message: error message
EMPIAR.FileControl.prototype.handleStartResponse = function(responseData) {
	var code,
		userMessage;

	code = responseData.error.code;
	userMessage = responseData.error.user_message;
	switch(code) {
		case 401: 
			break;
		case 900:
			// Content protection not accepted by the destination
			break;
		default: 
	}
};


// Make jsTree that represents a directory on a local machine with checkboxes and a Download button.
// @param dirStruct: display file contents ('full') or only directories ('dirs')
// @param asperaOnly: display only Aspera download button and not the HTTP stream. Default - true
// @param entryName: name of the EMPIAR entry that will be processed
// @param treeDiv: DIV element of the page that will represent jstree
// @param buttonId: ID of the download button for this particular tree
// @param sourcePath: ID of the source path for this particular tree
// @param treeFileController: FileControl element that connects with a Download button. Submit -1 to make a jsTree for image set association, without a download button
// @param entryUrl: the address to the EMPIAR entry that determines whether the jsTree json should be obtained for the deposition, for the release process or for the EMPIAR entry page
// @param imageSetId: ID of the Image set to be processed. Defaults to -1 for the main directory tree
// @param noCheckbox: do not display the checkbox
// @param csrfToken: CSRF token as provided by Django
// @param asperaTokenUrl: URL for obtaining the Aspera token - necessary for Aspera authentication for transfers
// @param jsTreeLoadCb: The callback function that will be run after jsTree has finished loading and all the nodes are ready
// @param jsTreeCbArgs: Arguments for the callback
// @example: browserTree ('ftp.ebi.ac.uk', '/pub/databases/emtest/empiar/directoryStructures', 10014, '#jstree_json10014', btnid10014, 'archive/', trfc, entryUrl);
browserTree = function (params) {
	if (isNullOrUndefinedOrEmpty(params.dirStruct))
		params.dirStruct = 'full';

	if (isNullOrUndefinedOrEmpty(params.asperaOnly))
		params.asperaOnly = true;


	$(function () {
		var jsTreeCore = {
				'data' : {
			        "url" : function (node) {
								if (isNullOrUndefinedOrEmpty(params.imageSetId))
									params.imageSetId = '-1';
								return node.id === '#' ? params.entryUrl + '/dirStruct=' + params.dirStruct + '&list=' + 1 + '/' + params.imageSetId : params.entryUrl + '/dirStruct=' + params.dirStruct + '&list=' + (parseInt(node.id) + parseInt(1)).toString() + '/' + params.imageSetId ;
			         		},
			        "data" : function (node) {
			         			return { "id" : node.id };
			         		},
	         		"error": function (jqXHR, textStatus, errorThrown) { $(params.treeDiv).html("There was an error " +
						"while loading data for this tree") }
				},
		}
		var jsTreePlugins = ["json_data", "types"];
		var jsTreeCheckbox = false;
		var conditionalSelect = false;

		if (typeof params.noCheckbox == 'undefined' || params.noCheckbox === null) {
			jsTreePlugins.push("checkbox")
			if (params.treeFileController == -1) {
				jsTreeCore['multiple'] = false;
				jsTreeCheckbox = {
					"three_state" : false
				};
				jsTreePlugins.push("conditionalselect")
				conditionalSelect = function (node) {
					return node.state.selected ? false : true;
			    }
			}
			else
				jsTreeCheckbox = {
					"whole_node" : false,
					"tie_selection" : false,
				};
		}

		$(params.treeDiv).on('loaded.jstree', function (e, data) {
                    if (isFunction(params.jsTreeLoadCb)) {
                        params.jsTreeLoadCb(params.jsTreeCbArgs);
                    }
			})
			.jstree({
			'core': jsTreeCore,
			"checkbox" : jsTreeCheckbox,
			"conditionalselect" : conditionalSelect,
			"types" : {
					    "default" : {
					    	"valid_children" : ["default","file"]
						},
						"file" : {
								"icon" : "jstree-file",
								"valid_children" : []
						}
			},
			"plugins" : jsTreePlugins,
		});

	});

	if (params.treeFileController != -1) {
		// A general download button that shows Aspera and HTTP stream buttons in a shadowbox
	    $('#'+params.buttonId).append('<div id="' + params.buttonId + 'AspHttpDiv"></div>');

		// If the listing is of a full directory, then the displayed page is the one in the deposition system and only Aspera download should be available
		if (params.asperaOnly === true) {
			params.treeFileController.addDownloadButtonTree( { buttonId: params.buttonId,
				buttonLabel: 'Download',
				downloadContainer: params.buttonId+'AspHttpDiv',
				source: params.sourcePath,
				text: "Aspera download",
				treeId: params.treeDiv } );
		} else {
			if (null !== params.asperaTokenUrl && "undefined" !== typeof params.asperaTokenUrl && "" !== params.asperaTokenUrl) {
                var downloadButtonAspHttp = $('<button/>',
                        {
                            type: "button",
                            id: params.buttonId + 'AspHttp',
                            label: 'Download',
                            text: 'Download',
                        });
                downloadButtonAspHttp.addClass("empiarDownloadButton icon icon-functional");
                downloadButtonAspHttp.attr("data-icon", "=");
                downloadButtonAspHttp.attr("type", "button");
                $('#'+params.buttonId+'AspHttpDiv').append(downloadButtonAspHttp);
                downloadButtonAspHttp.on("click",  function(){
                    var arr = new Array();
                    arr = $(params.treeDiv).jstree('get_top_checked');
                    if (arr.length < 1) {
                        alert("Please select files and/or folders which you would like to download.");
                        return;
                    }

                    params.treeFileController.addDownloadButtonTree( { buttonId: params.buttonId,
                        buttonLabel: 'Download',
                        downloadContainer: 'empiarChooseDlInner',
                        source: params.sourcePath,
                        text: "Aspera (recommended)",
                        treeId: params.treeDiv,
                        asperaTokenUrl: params.asperaTokenUrl,
                        csrfToken: params.csrfToken} );

                    params.treeFileController.addHttpStreamButtonTree( { buttonId: params.buttonId,
                        buttonLabel: 'Download',
                        downloadContainer: 'empiarChooseDlInner',
                        source: params.sourcePath,
                        treeId: params.treeDiv,
                        csrfToken: params.csrfToken} );
                    $('#empiarChooseDl').show();
                });
            } else {
				params.treeFileController.addHttpStreamButtonTree( { buttonId: params.buttonId,
		    		buttonLabel: 'Download',
		    		downloadContainer: params.buttonId+'AspHttpDiv',
		    		source: params.sourcePath,
		    		treeId: params.treeDiv,
		    		csrfToken: params.csrfToken} );
			}
		}
	}
};


// Add Aspera download button for jsTree to page and setup event handlers. Used on EMPIAR entry pages for 
// adding buttons that allow downloading separate files of EMPIAR entries as selected in jsTree directory
// representation
// @param params: object with settings on how the button should be setup
// @param params.buttonId: HTML ID to give button element
// @param params.buttonLabel: Label to show on button
// @param params.downloadContainer: DIV or HTML element in which to put the download button
// @param params.source: Array of names of files or directories to download, e.g. ['archive/10014/DeltProTM', 'archive/10014/10014.xml']
// @param params.treeId: ID of the jsTree that is being associated with the downlaod button
EMPIAR.FileControl.prototype.addDownloadButtonTree = function (params) {
	var self = this;
	var downloadButton = $('<button/>',
		    {
				type: "button",
				id: params.buttonId + "Aspera",
		        label: params.buttonLabel + "Aspera",
		        text: params.text,
		    });
	downloadButton.addClass("empiarDownloadButton asperaControlElement icon icon-functional");
	downloadButton.attr("data-icon", "=");
	downloadButton.attr("type", "button");
	$('#'+params.downloadContainer).append('<div id="' + params.buttonId + "Aspera" + 'Div"></div>');
    $('#'+params.buttonId+"Aspera"+'Div').append(downloadButton);

    // If Aspera plugin is installed, then get an array of checked tree nodes and provide it to Aspera
	var downloadButtonClick = function (e) {
		// Get the checked jsTree nodes
		var arr = new Array();
		arr = $(params.treeId).jstree('get_top_checked');
		if (arr.length > 0) {
			var arrayLength = arr.length;

			// Make an array of system paths to the checked jsTree nodes
			var parents = new Array();
			for (var i = 0; i < arrayLength; ++i) {
				parents.push(params.source + $(params.treeId).jstree("get_path", arr[i], "/"));
			};

			self.setupAsperaListeners();
			self.asperaWeb.showSelectFolderDialog( { 
				success: function(obj) {
					if (obj.dataTransfer.files[0]) {
						self.download(parents, obj.dataTransfer.files[0].name, params.asperaTokenUrl, params.csrfToken);
					}
				} 
			});
		}
		else
			alert("Please select files and/or folders which you would like to download.");
	};
	downloadButton.unbind('click').bind('click', downloadButtonClick);
};


//Display the loading wheel depending on the browser
showLoader = function(){
	var divBrowserVersion = document.createElement("div");
	divBrowserVersion.innerHTML = "<!--[if lt IE 10]><i></i><![endif]-->";
	var isIeLessThan10 = (divBrowserVersion.getElementsByTagName("i").length == 1);

	// If the browser is IE<10, then show the GIF loading wheel
	if (isIeLessThan10) {
		$('#empiarLoaderGif').show();
	}
	// Else show the CSS loading wheel
	else {
		$('#empiarLoader').show();
	}
}


//Hide the loading wheel depending on the browser
hideLoader = function(){
	var divBrowserVersion = document.createElement("div");
	divBrowserVersion.innerHTML = "<!--[if lt IE 10]><i></i><![endif]-->";
	var isIeLessThan10 = (divBrowserVersion.getElementsByTagName("i").length == 1);

	// If the browser is IE<10, then hide the GIF loading wheel
	if (isIeLessThan10) {
		$('#empiarLoaderGif').hide();
	}
	// Else hide the CSS loading wheel
	else {
		$('#empiarLoader').hide();
	}
}


// Stream the uncompressed ZIP archive of selected folders/files
// @param params: object with parts of the link that is used in the AJAX call
// @param params.name: the name under which the ZIP archive will be stored by the user
// @param params.parents: list of files/folders that are to be streamed
// @example: getZipFile("archive.zip", ["/archive/10030/10030.xml"])
getZipFile = function(params) {
	var form = $('<form id="get_zip" method="POST" action="get_zip/">' + params.csrfToken);
    $.each(params, function(k, v) {
    	form.append($('<input type="hidden" name="csrfmiddlewaretoken" value="' + params.csrfToken + '" />'));
        form.append($('<input type="hidden" name="' + k +
                '" value="' + v + '">'));
    });
    $('body').append(form);
    form.submit();
    hideLoader();
    $('#get_zip').remove();
}


// Add HTTP stream button for jsTree to page and setup event handlers
// @param params: object with settings on how the button should be setup
// @param params.buttonId: HTML ID to give button element
// @param params.buttonLabel: Label to show on button
// @param params.source: Array of names of files or directories to download, e.g. ['archive/10014/DeltProTM', 'archive/10014/10014.xml']
// @param params.downloadContainer: DIV or HTML element in which to put the download button
// @param params.treeId: ID of the jsTree that is being associated with the downlaod button
EMPIAR.FileControl.prototype.addHttpStreamButtonTree = function (params) {
	var self = this;

	var HttpStreamButton = $('<button/>',
		    {
				type: "button",
				id: params.buttonId + "Http",
		        label: params.buttonLabel + "Http",
		        text: "Uncompressed ZIP archive streamed via HTTP",
		    });
	HttpStreamButton.addClass("empiarDownloadButton icon icon-functional");
	HttpStreamButton.attr("data-icon", "=");
	HttpStreamButton.attr("type", "button");
	$('#'+params.downloadContainer).append('<div id="' + params.buttonId + "Http" + 'Div"></div>');
    $('#'+params.buttonId+"Http"+'Div').append(HttpStreamButton);

    // Get an array of checked tree nodes and stream them via Http
	var HttpStreamButtonClick = function (e) {

		// Get the checked jsTree nodes
		var arr = new Array();
		arr = $(params.treeId).jstree('get_top_checked');
		if (arr.length > 0) {
			var arrayLength = arr.length;

			// Make an array of system paths to the checked jsTree nodes
			var parents = new Array();
			for (var i = 0; i < arrayLength; ++i) {
				// Calculate the size of the checked nodes
				parents.push("/archive/" + $(params.treeId).jstree("get_path", arr[i], '/'));
			};

			if ( parents.join("|").indexOf('The file with the list of directories does not exist') >= 0 )
				alert('Please select a valid file.');
			else {
			    var name=prompt("Please enter the filename under which you would like to save the ZIP archive. Only Latin characters are allowed.","archive.zip");
			    if (name!=null && ascii.test(name)){
			    	showLoader();
			    	// Start the streaming of checked files
			    	getZipFile({
			    		name: name,
			    		parents: parents,
			    		csrfToken: params.csrfToken
			    	});
			    } else if (name!=null) {
			    	alert("Please enter a valid name. Name should contain only ASCII characters");
			    }
			}
		}
		else
			alert("Please select files and/or folders which you would like to download.");
	};

	HttpStreamButton.on("click", HttpStreamButtonClick);
};
