// Open lightbox
// @param treeDiv: id of the jsTree structure to elements of which the lightbox opening is assigned
// @param currentNodeIndex: index in jsTree JSON structure of the node that is being opened (this can differ from the array index)
// @param fileCheckUrl: URL used for the check of the existence of the file, returns whether the file is accessible or not
// @param fileOpenUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param loadingAnimationUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageDownUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageUpUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param csrfToken: CSRF token from Django necessary for the POST request
// @param imagesetId: ID of an imageset, if available, used to populate the corresponding image set field
function openLightbox (treeDiv, currentNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId) {
	// Clicked node extracted from the tree and path to the file it represents
	var clickedNode = $(treeDiv).jstree(true).get_node(currentNodeIndex);
	var filepath = $(treeDiv).jstree("get_path", clickedNode, '/');

	// Check if the thumbnail file exists
	$.ajax({
			type: "post",
	        cache: false,
	        url: fileCheckUrl,
	        data: { 'path': filepath, 'nodeId': clickedNode.id, 'csrfmiddlewaretoken': csrfToken },
	        dataType : 'json',
	        success: function(dataPy){
				if ( dataPy.cur_node ) {
					var nextNodeIndex = dataPy.next_node_id;
					var prevNodeIndex = dataPy.prev_node_id;
					var omeroIndex = dataPy.omero_id;

					// Add lightbox link to an element in jsTree, trigger opening of the lightbox
					// and unbind lightbox functionality
					var elementToChange = document.getElementsByClassName('jstree-anchor')[0];
					elementToChange.setAttribute("href", fileOpenUrl + filepath);
					$(elementToChange).jKit('lightbox', { 'group': 'myalbum' });
					$(elementToChange).trigger("click");
					elementToChange.setAttribute("href", "#");
					$(elementToChange).unbind("click");

					$('#jkit-lightbox-title').waitUntilExists(
						function() {
						// Add lightbox title if lightbox has opened.
						var $lightboxSubTitle = $('<div/>', {
							id: 'lightboxSubTitleInner',
						});
						$('#jkit-lightbox-title').append($lightboxSubTitle);
						var $lightboxSubTitleTextDiv = $('<div/>', {
							id: 'lightboxSubTitleText',
							text: clickedNode.original.name,
						});
						$('#lightboxSubTitleInner').append($lightboxSubTitleTextDiv);
						var $loadingDiv = $('<div/>', {
							id: 'loadingLightbox'
						}).prependTo($('#jkit-lightbox-bg'));
						var $loading = $('<img/>', {
							src: loadingAnimationUrl
						}).prependTo($('#loadingLightbox'));

						// Wait for the content to be obained from the sever before displaying lightbox elements 
						$('#jkit-lightbox-content').waitForImages(function() {
							$($loadingDiv).remove();

							$('#jkit-lightbox-title').show();
							$('span.jkit-lightbox-closer').attr("title","Close").show();

						    // Add next and previous buttons
							if (nextNodeIndex !== null) {
								var $nextButton = $('<a/>', {
									id: 'jkit-lightbox-nextButtonId',
							        label: '>',
							        title: 'Next',
									class: 'jkit-lightbox-nextButton'
								}).prependTo($('#jkit-lightbox-nav'));

								$nextButton.on( 'click', function(){
									$('.jkit-lightbox-el').fadeTo(0, 0, function(){
										$(this).remove();
									});
									openLightbox(treeDiv, nextNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
								});
								$nextButton.css('background-image', 'url('+pageDownUrl+')');
							}

							if (prevNodeIndex !== null) {
								var $prevButton = $('<a/>', {
									id: 'jkit-lightbox-prevButtonId',
							        label: '<',
							        title: 'Previous',
									class: 'jkit-lightbox-prevButton'
								}).prependTo($('#jkit-lightbox-nav'));

								$prevButton.on( 'click', function(){
									$('.jkit-lightbox-el').fadeTo(0, 0, function(){
										$(this).remove();
									});
									openLightbox(treeDiv, prevNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
								});
								$prevButton.css('background-image', 'url('+pageUpUrl+')');
							}

							if ( (typeof omeroIndex !== "undefined") && (omeroIndex !== null) ) {
								// Add OMERO viewer functionality
								var $ome = $('<a/>', {
									title: 'Open in OMERO viewer',
									class: 'jkit-lightbox-ome',
								}).prependTo($('#jkit-lightbox-nav'));

								var omeClick = function (e) {
									$('.jkit-lightbox-el').fadeTo(0, 0, function(){
										$(this).remove();
									});
									if ($('#omeroviewport').css('display') == 'none')
										$('#omeroviewport').css('display', 'block');
									$('html,body').animate({scrollTop: $("#omeroviewport").offset().top}, 'slow');
									$($('#omeroviewport').children()[0]).attr("src", omeroUrl + omeroIndex + "?username=root");
								};

								$('.jkit-lightbox-ome').on("click", omeClick);
							}

							// Add the button to populate the image set form
							if ( (typeof imagesetId !== "undefined") && (imagesetId !== null) && !isTextFile(filepath) ) {
								var $populateButton = $('<button/>', {
									id: 'populate-imageset-'+imagesetId,
									class: 'icon icon-functional jkit-lightbox-populateButton',
									'data-icon': "0",
							        label: 'Populate',
							        title: 'Populate the imageset form',
							        text: '',
							    }).prependTo($('#jkit-lightbox-nav'));

								$populateButton.on('click', function(){
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
								});
							}
						});
					});
				}
	    	},
	});
}


// Add on-select event to jsTree nodes' that will open lightbox
// @param treeDiv: id of the jsTree structure to elements of which the lightbox opening is assigned
// @param fileCheckUrl: URL used for the check of the existence of the file, returns whether the file is accessible or not
// @param fileOpenUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param loadingAnimationUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageDownUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param pageUpUrl: URL used for opening the file, returns the content that will be displayed in lightbox
// @param csrfToken: CSRF token from Django necessary for the POST request
// @param omeroUrl: URL to the OMERO web client
// @param imagesetId: ID of an imageset, if available, used to populate the corresponding image set field
function handleNodeClick(treeDiv, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId) {
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
				openLightbox(treeDiv, clickedNodeI, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
			}

		}
	});
}
