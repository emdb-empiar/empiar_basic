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
	var filepath_current_node = $(treeDiv).jstree("get_path", clickedNode, '/');
	var pswp;

	// Check if the thumbnail file exists
	$.ajax({
			type: "post",
	        cache: false,
	        url: fileCheckUrl,
	        data: { 'path': filepath_current_node, 'node_id': clickedNode.id, 'csrfmiddlewaretoken': csrfToken },
	        dataType : 'json',
	        success: function(dataPy){
				if ( dataPy.cur_node ) {
					var nextNodeIndex = dataPy.next_node_id;
					var prevNodeIndex = dataPy.prev_node_id;
					var omeroIndex = dataPy.omero_id;
					var image_width = 315;
					var image_height = 315;

					var elementToChange = document.getElementsByClassName('jstree-anchor')[0];
					elementToChange.setAttribute("href", fileOpenUrl + filepath_current_node);

					var pswpElement = document.querySelectorAll('.pswp')[0];

                    var items = new Array();
                    // Insert three items since PhotoSwipe requires at least three elements
					items.push(
					    {
                            src: fileOpenUrl + filepath_current_node,
                            w: image_width,
                            h: image_height,
                            title: filepath_current_node
                        }
                    );

                    var options = {
                        // optionName: 'option value'
                        // for example:
                        loop: false,
                        allowPanToNext: false,
                        index: 0, // start at first slide
                        bgOpacity: 0.5,
                        arrowKeys: false,
                        counterEl: false,
                    };
                    pswp = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

                    pswp.nextNodeIndex = nextNodeIndex;
                    pswp.prevNodeIndex = prevNodeIndex;

                    pswp.init();

                    $nextBtn = $('.pswp__button--arrow--right', pswp.template);
                    $prevBtn = $('.pswp__button--arrow--left', pswp.template);
                    $nextBtn.toggle(pswp.options.loop || (pswp.nextNodeIndex !== null));
                    $prevBtn.toggle(pswp.options.loop || (pswp.prevNodeIndex !== null));

                    if (nextNodeIndex !== null) {
                        $('.pswp__button.pswp__button--arrow--right').unbind("click").bind("click", function () {
                            pswp.destroy();
                            openLightbox(treeDiv, nextNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
                        });
                    }

                    if (prevNodeIndex !== null) {
                        $('.pswp__button.pswp__button--arrow--left').unbind("click").bind("click", function () {
                            pswp.destroy();
                            openLightbox(treeDiv, prevNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
                        });
                    }
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
