// Excerpt from the compliant style used to activate EBI slideToggle
activateSlideToggle = function() {
    try {
        jQuery(".slideToggle").unbind("click");
        jQuery('.slideToggle[data-icon="u"]').next().hide();
        jQuery('.slideToggle[data-icon="9"]').next().hide();
        jQuery('.slideToggle[data-icon="u"][data-slideabove="true"]').prev().hide();
        jQuery('.slideToggle[data-icon="9"][data-slideabove="true"]').prev().hide();

        jQuery(".slideToggle").click(function () {
            if (jQuery(this).attr("data-icon") === "u" || jQuery(this).attr("data-icon") === "w") {
                if (jQuery(this).attr("data-icon") === "u") {
                    jQuery(this).attr("data-icon", "w")
                } else {
                    jQuery(this).attr("data-icon", "u")
                }
            }
            if (jQuery(this).attr("data-icon") === "8" || jQuery(this).attr("data-icon") === "9") {
                if (jQuery(this).attr("data-icon") === "8") {
                    jQuery(this).attr("data-icon", "9")
                } else {
                    jQuery(this).attr("data-icon", "8")
                }
            }
            if (jQuery(this).attr("data-slideabove") === "false" || jQuery(this).attr("data-slideabove") === undefined) {
                var b = jQuery(this).parent();
                jQuery(this).next().slideToggle(200, function () {
                    if (jQuery(this).css("display") === "none") {
                        jQuery(this).siblings(".nano-pane").hide()
                    } else {
                        jQuery(this).siblings(".nano-pane").show()
                    }
                })
            } else {
                jQuery(this).prev().slideToggle(200)
            }
        })
    } catch (a) {
    }
}