// A function literal that is executed immediately. It is used for postponing the execution of the function until the specified element is inserted into the DOM 
// @property jQuery plugin which runs handler function once specified element is inserted into the DOM
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
	            window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500)
	        ;
	    }
	    else if (shouldRunHandlerOnce && $elements.length)
	    {
	        window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
	    }
	    return $this;
	}
}(jQuery));
