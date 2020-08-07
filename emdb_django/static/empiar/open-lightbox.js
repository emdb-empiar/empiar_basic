const shareButtons = [
    {id: 'facebook', label: 'Share on Facebook', url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
    {id: 'twitter', label: 'Tweet', url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
    {
        id: 'pinterest', label: 'Pin it', url: 'http://www.pinterest.com/pin/create/button/' +
            '?url={{url}}&media={{image_url}}&description={{text}}'
    },
    {id: 'download', label: 'Download image', url: '{{raw_image_url}}', download: true}
];


// Open previous thumbnail with left arrow key. Used separately to allow unbind
// @param e: event that contains the key that has been pressed and the data with openLightbox arguments (see below)
function keyLeft(e) {
    if (e.which == 37) {
        openLightbox(e.data.treeDiv, e.data.prevNodeIndex, e.data.fileCheckUrl, e.data.fileOpenUrl,
            e.data.loadingAnimationUrl, e.data.pageDownUrl, e.data.pageUpUrl, e.data.csrfToken, e.data.omeroUrl,
            e.data.imagesetId);
    }
}


// Open next thumbnail with right arrow key. Used separately to allow unbind
// @param e: event that contains the key that has been pressed and the data with openLightbox arguments (see below)
function keyRight(e) {
    if (e.which == 39) {
        openLightbox(e.data.treeDiv, e.data.nextNodeIndex, e.data.fileCheckUrl, e.data.fileOpenUrl,
            e.data.loadingAnimationUrl, e.data.pageDownUrl, e.data.pageUpUrl, e.data.csrfToken, e.data.omeroUrl,
            e.data.imagesetId);
    }
}


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
function openLightbox(treeDiv, currentNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId) {
    // Clicked node extracted from the tree and path to the file it represents
    let $clickedNode = $(treeDiv).jstree(true).get_node(currentNodeIndex);
    let $filepathCurrentNode = $(treeDiv).jstree("get_path", $clickedNode, '/');

    // Check if the thumbnail file exists
    $.ajax({
        type: "post",
        cache: false,
        url: fileCheckUrl,
        data: {'path': $filepathCurrentNode, 'node_id': $clickedNode.id, 'csrfmiddlewaretoken': csrfToken},
        dataType: 'json',
        success: function (dataPy) {
            if (dataPy.cur_node) {
                let nextNodeIndex = dataPy.next_node_id;
                let prevNodeIndex = dataPy.prev_node_id;

                let elementToChange = document.getElementsByClassName('jstree-anchor')[0];
                elementToChange.setAttribute("href", fileOpenUrl + $filepathCurrentNode);

                let $empthumb = $('.empthumb');
                $empthumb.unbind("click").bind("click", function (e) {
                    $empthumb.hide();
                });

                let $bg = $('.empthumb__bg');
                let $caption = $('.empthumb__caption');
                let $captionText = $('.empthumb__caption__center');
                let $empthumbItem = $('.empthumb__item');
                let $shareBtn = $('.empthumb__button--share');

                let imageUrl = fileOpenUrl + $filepathCurrentNode;
                let pageUrl = window.location.href;
                let shareText = $filepathCurrentNode;

                $empthumb.show();
                $empthumb.css('position', 'fixed');
                $bg.show();
                $bg.css('opacity', 0.5);
                $captionText.html($filepathCurrentNode);

                $empthumbItem.html('<img class="empthumb__img" src="' + fileOpenUrl + $filepathCurrentNode + '"/>');

                let $nextBtn = $('.empthumb__button--arrow--right');
                let $prevBtn = $('.empthumb__button--arrow--left');
                $nextBtn.css('display', 'none');
                $prevBtn.css('display', 'none');

                $shareBtn.unbind("click").bind("click", function (e) {
                    e.stopPropagation();
                    let $shareModal = $('.empthumb__share-modal--hidden');
                    $shareModal.show();

                    for (let i = 0; i < shareButtons.length; i++) {
                        let $shareBtn, shareButtonData, shareURL;
                        shareButtonData = shareButtons[i];

                        shareURL = shareButtonData.url.replace('{{url}}', encodeURIComponent(pageUrl))
                            .replace('{{image_url}}', encodeURIComponent(imageUrl))
                            .replace('{{raw_image_url}}', imageUrl)
                            .replace('{{text}}', encodeURIComponent(shareText));

                        $shareBtn = $('.empthumb__share--' + shareButtonData.id);
                        $shareBtn.attr('href', shareURL);
                        $shareBtn.unbind("click").bind("click", function (e) {
                            e = e || window.event;
                            let target = e.target || e.srcElement;

                            if (!target.href) {
                                return false;
                            }

                            if (target.hasAttribute('download')) {
                                return true;
                            }

                            window.open(target.href, 'empthumb_share', 'scrollbars=yes,resizable=yes,toolbar=no,' +
                                'location=yes,width=550,height=420,top=100,left=' +
                                (window.screen ? Math.round(screen.width / 2 - 275) : 100));
                            let $shareModal = $('.empthumb__share-modal--hidden');
                            $shareModal.hide();

                            return false;
                        });
                    }

                    $empthumb.unbind("click").bind("click", function (e) {
                        if ($('.empthumb__share-tooltip').filter(':visible').length > 0) {
                            e.stopPropagation();
                            $shareModal.hide();
                            $empthumb.unbind("click").bind("click", function (e) {
                                $empthumb.unbind("keydown");
                                $empthumb.hide();
                            });
                        } else {
                            $empthumb.unbind("keydown");
                            $empthumb.hide();
                        }
                    });
                });

                if (nextNodeIndex !== null) {
                    $nextBtn.css('display', 'block');
                    let goRight = function (e) {
                        e.stopPropagation();
                        // Destroy is necessary so that there is no thumbnail is left on page when the viewer is closed
                        openLightbox(treeDiv, nextNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
                    };

                    $empthumb.unbind("keydown", keyRight).bind(
                        "keydown", {
                            treeDiv: treeDiv,
                            nextNodeIndex: nextNodeIndex,
                            fileCheckUrl: fileCheckUrl,
                            fileOpenUrl: fileOpenUrl,
                            loadingAnimationUrl: loadingAnimationUrl,
                            pageDownUrl: pageDownUrl,
                            pageUpUrl: pageUpUrl,
                            csrfToken: csrfToken,
                            omeroUrl: omeroUrl,
                            imagesetId: imagesetId
                        }, keyRight);
                    $('.empthumb__button.empthumb__button--arrow--right').unbind("click").bind("click", goRight);
                }

                if (prevNodeIndex !== null) {
                    $prevBtn.css('display', 'block');
                    let goLeft = function (e) {
                        e.stopPropagation();
                        // Destroy is necessary so that there is no thumbnail is left on page when the viewer is closed
                        openLightbox(treeDiv, prevNodeIndex, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
                    };

                    $empthumb.unbind("keydown", keyLeft).bind(
                        "keydown", {
                            treeDiv: treeDiv,
                            prevNodeIndex: prevNodeIndex,
                            fileCheckUrl: fileCheckUrl,
                            fileOpenUrl: fileOpenUrl,
                            loadingAnimationUrl: loadingAnimationUrl,
                            pageDownUrl: pageDownUrl,
                            pageUpUrl: pageUpUrl,
                            csrfToken: csrfToken,
                            omeroUrl: omeroUrl,
                            imagesetId: imagesetId
                        }, keyLeft);
                    $('.empthumb__button.empthumb__button--arrow--left').unbind("click").bind("click", goLeft);
                }

                $empthumb.focus();
            }
        }
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
    $(treeDiv).on('select_node.jstree', function (e, data) {
        // Check that there is an event and the select has not been triggered by simple refresh of jsTree
        if (data.event) {
            // Clicked node and path to the file it represents
            let clickedNode = data.instance.get_node(data.selected[data.selected.length - 1]);
            let filepath = $(treeDiv).jstree("get_path", clickedNode, '/');

            if (($(clickedNode)[0].original.type == "file") && isReadableFile(filepath)) {
                let clickedNodeI = data.selected[data.selected.length - 1];
                openLightbox(treeDiv, clickedNodeI, fileCheckUrl, fileOpenUrl, loadingAnimationUrl, pageDownUrl, pageUpUrl, csrfToken, omeroUrl, imagesetId);
            }

        }
    });
}
