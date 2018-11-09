// Completely remove the dialog element from DOM
function dialog_destroy(){
	$("#dialog-header-view").html('');
	$("#dialog-header-view").dialog('destroy');
}

// Open dialog with the text content of the response
// @param treeDiv: id of the jsTree structure to elements of which the lightbox opening is assigned
// @param currentNodeIndex: index in nodeList array of the node that is being opened
// @param fileCheckUrl: URL used for the check of the existence of the file, returns whether the file is accessible or not
// @param fileOpenUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param loadingAnimationUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageDownUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageUpUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param imagesetId: ID of an imageset, if available, used to populate the corresponding image set field
function openDialog (treeDiv, currentNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, imagesetId) {
	// Clicked node extracted from the tree and path to the file it represents
	var clickedNode = $(treeDiv).jstree(true).get_node(currentNodeIndex)
	var filepath = $(treeDiv).jstree("get_path", clickedNode, '/');

	$.ajax({
		type: "post",
        cache: false,
        url: fileCheckUrl,
        data: { 'path': filepath, 'nodeId': clickedNode.id, 'csrfmiddlewaretoken': csrfToken },
        dataType : 'json',
        success: function(dataPy){
        	if ( dataPy.cur_node && dataPy.output_heading ) {
        		var nextNodeIndex = dataPy.next_node_id;
				var prevNodeIndex = dataPy.prev_node_id;

				$("#dialog-header-view").html(dataPy.output_heading);

				var existingDialog = $("div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.header-view.ui-dialog-buttons.ui-draggable.ui-resizable");
				var dialog_buttons = new Array();
				var next_splice_index = 0;

				var next_btn = {
					text: "Next",
					icons: {
						primary: "ui-icon-arrowthick-1-e"
					},
					click: function() {
						openDialog(treeDiv, nextNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, imagesetId);
					}
				}

				var previous_btn = {
					text: "Previous",
					icons: {
						primary: "ui-icon-arrowthick-1-w"
					},
					click: function() {
						openDialog(treeDiv, prevNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, imagesetId);
					}
				 }

				dialog_buttons.push({
                    text: "Populate Form",
                    icons: {
                     primary: "ui-icon-arrowthick-1-s"
                    },
                    click: function(){
                        if (filepath.endsWith(".mrc")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T1');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T1');
                        } else if (filepath.endsWith(".mrcs")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T2');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T2');
                        } else if (filepath.endsWith(".tif")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T3');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T3');
                        } else if (filepath.endsWith(".img") || filepath.endsWith(".hed")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T4');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T4');
                        } else if (filepath.endsWith(".dm4")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T6');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T6');
                        } else if (filepath.endsWith(".dat")) {
                            $('#id_empiar_image_set_formset-' + imagesetId + '-header_format_0').val('T7');
                            $('#id_empiar_image_set_formset-' + imagesetId + '-data_format_0').val('T7');
                        }

                        var bsoftDimensionsMatch = dataPy.output_heading.match(/Dimensions: *\d+ *\d+ *\d+/g);
                        if (bsoftDimensionsMatch != null) {
                            var bsoftDimensions = bsoftDimensionsMatch[0].match(/\d+/g);
                            var imageWidth = bsoftDimensions[0];
                            var imageHeight = bsoftDimensions[1];
                        } else {
                            var imodDimensionsMatch = dataPy.output_heading.match(/Number of columns, rows, sections[. ]*\d+ *\d+ *\d+\<br\/\> Map/g);
                            if (imodDimensionsMatch != null) {
                                var imodDimensions = imodDimensionsMatch[0].match(/\d+/g);
                                var imageWidth = imodDimensions[0];
                                var imageHeight = imodDimensions[1];
                                var numOfFrames = imodDimensions[2];
                            }
                        }

                        var bsoftNumOfFramesMatch = dataPy.output_heading.match(/Number of images: *\d+/g);
                        if (bsoftNumOfFramesMatch != null)
                            var numOfFrames = bsoftNumOfFramesMatch[0].match(/\d+/g)[0];

                        if (typeof imageWidth !== undefined && imageWidth != null)
                            $('#id_empiar_image_set_formset-' + imagesetId + '-image_width').val(imageWidth);
                        if (typeof imageHeight !== undefined && imageHeight != null)
                            $('#id_empiar_image_set_formset-' + imagesetId + '-image_height').val(imageHeight);
                        if (typeof numOfFrames !== undefined && numOfFrames != null)
                            $('#id_empiar_image_set_formset-' + imagesetId + '-frames_per_image').val(numOfFrames);

                        var bsoftVoxelTypeMatch = dataPy.output_heading.match(/Data type:[ \w]+\(size = \d+\)/g);
                        if (bsoftVoxelTypeMatch != null) {
                            var bsoftVoxelType = bsoftVoxelTypeMatch[0];
                            if (bsoftVoxelType.indexOf('unsigned char') > -1)
                                var voxelType = 'T1';
                            else if (bsoftVoxelType.indexOf('signed char') > -1)
                                var voxelType = 'T2';
                            else if (bsoftVoxelType.indexOf('unsigned short') > -1)
                                var voxelType = 'T3';
                            else if ((bsoftVoxelType.indexOf('signed short') > -1) || (bsoftVoxelType.indexOf('short (size = 2)') > -1))
                                var voxelType = 'T4';
                            else if (bsoftVoxelType.indexOf('int') > -1)
                                var voxelType = 'T6';
                            else if (bsoftVoxelType.indexOf('float') > -1)
                                var voxelType = 'T7';
                        } else {
                            var imodVoxelTypeMatch = dataPy.output_heading.match(/Map mode[. ]*\d+ *\([a-zA-Z 0-9\-]*\)/g);
                            if (imodVoxelTypeMatch != null) {
                                var imodVoxelType = imodVoxelTypeMatch[0];
                                if (imodVoxelType.match(/0 *\(byte\)/g) != null)
                                    var voxelType = 'T1';
                                else if (imodVoxelType.indexOf('unsigned 16-bit integer') > -1)
                                    var voxelType = 'T3';
                                else if (imodVoxelType.match(/1 *\(16-bit integer\)/g) != null)
                                    var voxelType = 'T4';
                                else if (imodVoxelType.match(/2 *\(32-bit real\)/g) != null)
                                    var voxelType = 'T7';
                            }
                        }

                        if (typeof voxelType !== undefined && voxelType != null)
                            $('#id_empiar_image_set_formset-' + imagesetId + '-voxel_type_0').val(voxelType);
                    }
                 });

				if ( existingDialog.length > 0 ) {

					if (prevNodeIndex !== null && prevNodeIndex !== currentNodeIndex) {
						dialog_buttons.splice(0, 0, previous_btn);
						next_splice_index = 1
					}

					if (nextNodeIndex !== null && nextNodeIndex !== currentNodeIndex) {
						dialog_buttons.splice(next_splice_index, 0, next_btn);
					}

					$( "#dialog-header-view" ).dialog( "option", "buttons", dialog_buttons );
				} else {
					if (prevNodeIndex !== null && prevNodeIndex != currentNodeIndex) {
						dialog_buttons.splice(0, 0, previous_btn);
						next_splice_index = 1;
					}

					if (nextNodeIndex !== null && nextNodeIndex != currentNodeIndex) {
						dialog_buttons.splice(next_splice_index, 0, next_btn);
					}

					$("#dialog-header-view").dialog({
					       resizable: true,
					       modal: false,
					       title: "",
					       height: 450,
					       width: 600,
					       position: {my: "left top", at: "left+0 top+350"},
					       dialogClass: "header-view",
					       close: dialog_destroy,
					       buttons: dialog_buttons
					});
					$('.ui-dialog :button').blur();
				}
        	}
		},
		error: function(response){
        },
	});
}


// Add on-select event to jsTree nodes' that will open lightbox
// @param treeDiv: id of the jsTree structure to elements of which the lightbox opening is assigned
// @param fileCheckUrl: URL used for the check of the existence of the file, returns whether the file is accessible or not
// @param fileCheckPositive: string that should be present in the response from the file check url
// @param fileOpenUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param loadingAnimationUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageDownUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageUpUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param imagesetId: ID of an imageset, if available, used to populate the corresponding image set field
//function jsTreeNodeClickAnnot(treeDiv, fileCheckUrl, fileCheckPositive, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, imagesetId) {
function jsTreeNodeClickAnnot(treeDiv, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, imagesetId) {
	// On click on a jsTree node, if the file represented by the node is present in OMERO
	// database, then open a lightbox with a thumbnail of this file
	$(treeDiv).on('select_node.jstree', function(e, data) {
		// Check that there is an event and the select has not been triggered by simple refresh of jsTree
		if(data.event) {
			// Clicked node and path to the file it represents
			var clickedNode = data.instance.get_node(data.selected[data.selected.length - 1]);
			var filepath = $(treeDiv).jstree("get_path", clickedNode, '/');

			if ( ($(clickedNode)[0].original.type == "file") && isReadableFile(filepath) ) {
				var clickedNodeI = data.selected[data.selected.length - 1];
				openDialog(treeDiv, clickedNodeI, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, imagesetId);
			}

		}
	});
}
