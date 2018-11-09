/*
* Aspera Web JavaScript API
* Revision: 2011-10-17
*
* http://www.asperasoft.com/
* 
* $Id: asperaweb.js 48569 2012-01-03 01:47:05Z marco $
*/

"use strict";

if (typeof AW === "undefined") var AW = {};


/*//////////////////////////////////////////////////////////////////////////
	AW.utils
*/

AW.utils = {
	////////////////////////////////////////////////////////////////////////////////////////
	// Logging
	isLogging : (function() {
		var console = window.console || '';
		// Block FF3.x
		if ('MozAppearance' in document.documentElement.style && /Firefox\/3./.test(navigator.userAgent)) return false;
		if (console.log || !window.attachEvent) {
			return true;
		} else {
			return  false;
		};
	}()),

	logger : function(msg) {
		if ( this.isLogging ) {
			console.log(msg);
		} else {
			//alert(msg);
		}
	},  
	
	////////////////////////////////////////////////////////////////////////////////////////
	// Version helpers
	// Returns true if version string 'a' is less than version string 'b'
	//     "1.2.1" < "1.11.3" 
	//     "1.1"   < "2.1"
	//     "1"     = "1"
	//     "1.2"   < "2"
	// Note the following behavior:
	//     "1"     = "1.2"
	//     "1.2"   = "1"
	//   This helps with upgrade checks.  If at least version "4" is required, and 
	//   "4.4.2" is installed, versionLessThan("4.4.2","4") will return false.
	versionLessThan : function( a, b ) {
	    var versionToArray = function( version ) {
			    var splits = version.split(".");
			    var versionArray = new Array();
			    for (var i = 0; i < splits.length; i++) {
					if (isNaN(parseInt(splits[i]))) {
						AW.utils.logger('Warning: Version contains non-numbers');
					}
			        versionArray.push(parseInt(splits[i],10));
			    }
			    return versionArray;
			};
			var a_arr = versionToArray(a);
	    var b_arr = versionToArray(b);
	    var i;
	    for ( i = 0; i < Math.min(a_arr.length, b_arr.length); i++ ) {
	        // if i=2, a=[0,0,1,0] and b=[0,0,2,0]
	        if( a_arr[i] < b_arr[i] ) {
	            return true;
	        } 
	        // if i=2, a=[0,0,2,0] and b=[0,0,1,0]
	        if( a_arr[i] > b_arr[i] ) {
	            return false;
	        } 
	        // a[i] and b[i] exist and are equal:
	        // move on to the next version number
	    }
	    // all numbers equal (or all are equal and we reached the end of a or b)
	    return false;
	},
	
	////////////////////////////////////////////////////////////////////////////////////////
	// String helpers
	randomString : function () {
	  var text = ""
	  , possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	  for( var i=0; i < 5; i++ ) {
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	  }
		return text;
	},
	
	localize : function(id) {
		// TODO: Need to dynamically load the correct language.
		// Hard code en-US for now.
		var lang, ret;
		lang = "en-US";
        if (typeof(AW.localize) === 'undefined') 
            return id;
        
        ret = AW.localize[id];
        if (typeof(ret) === 'undefined')
            return id;
        return ret;
	},

	////////////////////////////////////////////////////////////////////////////////////////
	// Browser helpers
	browser : {
		is : {
	    ff: !!window.globalStorage,
	    ie: Boolean(document.all && !window.opera),
	    //ie6: (!window.XMLHttpRequest && !!ActiveXObject),
	    //ie7: document.all && window.XMLHttpRequest && !XDomainRequest && !window.opera,
	    //ie8: document.documentMode==8,
	    opera: Boolean(window.opera),
	    chrome: Boolean(window.chrome),
	    safari: window.getComputedStyle && !window.globalStorage && !window.opera
		},
		name : function() {
	    for ( var name in this.is ) {
	        if ( this.is[name] ) {
	            return name;
	        }
	    }
		}
	},

	pluginSupportsMimeType : function(plugin, mimeType) {
	    for (var i = 0; i < plugin.length; i++) {
	        var mime = plugin[i];
	        if (mime.type == mimeType)
	            return true;
	    }
	    return false;
	},

	hasPluginByMimeType : function(mimeType) {
	    for (var i = 0; i < navigator.plugins.length; i++) {
	        if (this.pluginSupportsMimeType(navigator.plugins[i], mimeType))
	            return true;
	    }
	    return false;
	},

	reloadPlugins : function() {
	    if (/msie/i.test(navigator.userAgent)) {
	        throw("Plugin reload is not yet supported in IE");
	    } else {
	        navigator.plugins.refresh();
	    }
	},

	loadFile : function(filename, filetype){
	    if (filetype=="js"){ //if filename is a external JavaScript file
	        var fileref=document.createElement('script');
	        fileref.setAttribute("type","text/javascript");
	        fileref.setAttribute("src", filename);
	    }
	    else if (filetype=="css"){ //if filename is an external CSS file
	        var fileref=document.createElement("link");
	        fileref.setAttribute("rel", "stylesheet");
	        fileref.setAttribute("type", "text/css");
	        fileref.setAttribute("href", filename);
	    }
	    if (typeof fileref!="undefined")
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	},
	
	parseSearchString : function(key) {
		return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
	},
	
	// vX: URL, Callback, Async, Params
	awAjax : function(u,f,a,d,x) { x=this.ActiveXObject;x=new(x?x:XMLHttpRequest)('Microsoft.XMLHTTP');x.open(d?'POST':'GET',u,a);x.setRequestHeader('Content-type','application/x-www-form-urlencoded');x.onreadystatechange=function(){x.readyState>3&&f?f(x.responseText,x):0};x.send(d)
	},

	// vX: Json en/decode. data, [decode=true]
	awStringify : function(j,d,t) {
	    if(d) return eval('('+j+')');   
	    if(!j) return j+'';
	    t = [];
	    if(j.pop) {
	        for(x in j) t.push(_.S(j[x]));
	            j = '['+t.join(',')+']';
	    }else if(typeof j=='object') {
	        for(x in j) t.push(x+':'+_.S(j[x]));
	            j = '{'+t.join(',')+'}';
	    }else if(j.split) j = "'"+j.replace(/\'/g,"\\'")+"'";
	    return j;
	},
	JSON: (function(){
		// Add JSON support to IE 6 and 7 if needed. Adapted from json2.js to modify the window object
		// because of the nested nature of AW.utils. https://github.com/douglascrockford/JSON-js
        var JSON;if(!window.JSON){window.JSON={};}(function(){function f(n){return n<10?"0"+n:n;}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key);}if(typeof rep==="function"){value=rep.call(holder,key,value);}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null";}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null";}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v;}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v;}}if(typeof window.JSON.stringify!=="function"){window.JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" ";}}else{if(typeof space==="string"){indent=space;}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify");}return str("",{"":value});};}if(typeof window.JSON.parse!=="function"){window.JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j;}throw new SyntaxError("JSON.parse");};}}());
    }())
};
/*jslint browser: true, plusplus: true, white: true */

/*******************************************************************************
 * AW.Connect
 * 
 * Construct the AW.Connect object and insert the plug-in object into the HTML
 * document.
 * 
 * @param options
 *            (optional)
 * @param options.connectLaunchWaitTimeoutMs
 *            Time to wait for Aspera Connect to launch. Default: 20000.
 * @param options.containerId
 *            DOM id of an existing element to insert the plug-in element into
 *            (replacing its contents). If not specified, the plug-in is
 *            appended to the document body. Note that the plug-in must not be
 *            hidden in order to be loaded.
 * @param options.dropAllowDirectories
 *            Allow drop-and-drop of directories or not. Default: true.
 * @param options.dropAllowMultiple
 *            Allow drag-and-drop of multiple files or not. Default: true.
 * @param options.dropMode
 *            Indicates the operation to take when files are dropped onto the
 *            plug-in. If "disabled", drag-and-drop is disabled and will have no
 *            effect. If "upload", the files dragged onto the plug-in will be
 *            uploaded to the server. If "callback", a JavaScript method will be
 *            executed allowing a script to perform the desired actions.
 *            Default: "disabled".
 * @param options.dropUploadUrl
 *            The URL of the server that will receive upload of dropped files,
 *            when dropMode is "upload".
 * @param options.height
 *            The height in pixels of the plug-in element. This should match the
 *            height of the specified image parameter. Default: 1.
 * @param options.id
 *            DOM id of the plug-in element to be inserted. Default:
 *            "aspera-web".
 * @param options.image
 *            URL of an image to render in the space occupied by the plug-in.
 * @param options.imageCover
 *            On IE, the user must mouse-over the plug-in before drag-and-drop
 *            is enabled. This "imageCover" will appear over the plug-in; it
 *            disappears if the user clicks on it. This image should be the same
 *            size as the plug-in image, and tell the user to first click on
 *            this image before using drag-and-drop.
 * @param options.linkCapacityKbps
 *            This is used as a hint to indicate the server's link capacity. It
 *            is useful in scenarios when the user may be connected at a higher
 *            speed that the server. Parameters that are affected by network
 *            capacity will use the minimum of this value and the user's link
 *            capacity as found in system preferences. If this value is set to
 *            0, it will be ignored. Default: 0.
 * @param options.width
 *            The width in pixels of the plug-in element. This should match the
 *            width of the specified image parameter. Default: 1.
 ******************************************************************************/
AW.Connect = function(options) {
    "use strict";

    var API_VERSION, DROP_MODE, EVENT, HTTP_METHOD, STATUS, URI_VERSION_PREFIX, appId, hostname, id, isEventSupported, listeners, that, supportsNativeDragAndDrop;

    /***************************************************************************
     * Public constants
     **************************************************************************/
    this.EVENT = {
        ALL : "all",
        DROP : "drop",
        TRANSFER : "transfer"
    };
    this.TRANSFER_STATUS = {
        CANCELLED : "cancelled",
        COMPLETED : "completed",
        FAILED : "failed",
        INITIATING : "initiating",
        QUEUED : "queued",
        REMOVED : "removed",
        RUNNING : "running",
        WILLRETRY : "willretry"
    };
    this.DROP_MODE = {
        CALLBACK : "callback",
        DISABLED : "disabled",
        UPLOAD : "upload"
    };

    /***************************************************************************
     * Private constants
     **************************************************************************/
    API_VERSION = 4;
    DROP_MODE = this.DROP_MODE;
    EVENT = this.EVENT;
    HTTP_METHOD = {
        GET : "GET",
        POST : "POST"
    };
    STATUS = this.TRANSFER_STATUS;
    URI_VERSION_PREFIX = "/v" + API_VERSION;

    /***************************************************************************
     * Private members
     **************************************************************************/
    that = this;

    hostname = window.location.hostname;
    if (hostname === "") {
        hostname = "localhost";
    }
    // Default appId. Caret prefix differentiates it from a user-specified id.
    appId = "^" + hostname;
    listeners = [];

    /***************************************************************************
     * Helper Functions
     **************************************************************************/

    /**
     * @param obj
     * @param msg
     */
    function attachError(obj, msg) {
        obj.error = {
            code : -1,
            user_message : msg
        };
    }

    /**
     * @param obj
     * @param jsError
     * @param msg
     */
    function attachJsError(obj, jsError, msg) {
        attachError(obj, arguments.length < 3 ? jsError.message : msg);
        obj.error.internal_info = jsError;
    }

    /**
     * @param argName
     * @returns {Error}
     */
    function createArgumentRequiredError(argName) {
        return new Error('"' + argName + '" is required.');
    }

    /**
     * PT - I'm not sure if this is as good as a generator that has system
     * access, but the generated IDs should be unique enough.
     * 
     * @returns ID string
     */
    function generateUuid() {
        var date = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function(c) {
                var r = ((date + 16) * Math.random()).toFixed() % 16;
                if (c !== 'x') {
                    /*jslint bitwise: true */
                    r = r & 0x3 | 0x8;
                    /*jslint bitwise: false */
                }
                return r.toString(16);
            });
    }

    /**
     * @param x
     * @returns {Boolean}
     */
    function isDefined(x) {
        return typeof x !== "undefined";
    }

    /**
     * @param obj
     * @returns {Boolean}
     */
    function isEmptyObject(obj) {
        var name = null;
        for (name in obj) {
            /* "if" statement makes jslint happy */
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Copied from Modernizr
     * 
     * isEventSupported determines if a given element supports the given event
     * function from yura.thinkweb2.com/isEventSupported/
     */
    isEventSupported = (function() {
        var TAGNAMES = {
            'select' : 'input',
            'change' : 'input',
            'submit' : 'form',
            'reset' : 'form',
            'error' : 'img',
            'load' : 'img',
            'abort' : 'img'
        };

        function isEventSupportedFn(eventName, element) {
            element = element
                || document.createElement(TAGNAMES[eventName] || 'div');
            eventName = 'on' + eventName;
            // When using `setAttribute`, IE skips "unload", WebKit skips
            // "unload" and "resize", whereas `in` "catches" those
            var isSupported = typeof element.eventName !== "undefined";
            if (!isSupported) {
                // If it has no `setAttribute` (i.e. doesn't implement Node
                // interface), try generic element
                if (!element.setAttribute) {
                    element = document.createElement('div');
                }
                if (element.setAttribute && element.removeAttribute) {
                    element.setAttribute(eventName, '');
                    isSupported = typeof element[eventName] === 'function';
                    // If property was created, "remove it" (by setting value to
                    // `undefined`)
                    if (typeof element[eventName] !== 'undefined') {
                        element[eventName] = undefined;
                    }
                    element.removeAttribute(eventName);
                }
            }
            element = null;
            return isSupported;
        }

        return isEventSupportedFn;
    }());

    /**
     * @param x
     * @returns {Boolean}
     */
    function isObject(x) {
        return typeof x === "object";
    }

    /**
     * @param x
     * @returns {Boolean}
     */
    function isObjectAndNotNull(x) {
        return x !== null && typeof x === "object";
    }

    /**
     * @param n
     * @returns {Boolean}
     */
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * @param x
     * @returns {Boolean}
     */
    function isNullOrUndefined(x) {
        return x === null || typeof x === "undefined";
    }

    /**
     * @param x
     * @returns {Boolean}
     */
    function isNullOrUndefinedOrEmpty(x) {
        return x === "" || isNullOrUndefined(x);
    }

    /**
     * @param x
     * @returns {Boolean}
     */
    function isUndefined(x) {
        return typeof x === "undefined";
    }

    /**
     * Get an id string that is not associated with any elements in the document
     * 
     * @param baseId
     *            name to use as the id
     * @param suffix
     *            should not be specified
     * @returns unused id string
     */
    function getUniqueDomId(baseId, suffix) {
        var element, id;
        id = isDefined(suffix) ? baseId + suffix : baseId;
        element = document.getElementById(id);
        if (element !== null) {
            id = getUniqueDomId(baseId, isDefined(suffix) ? suffix + 1 : 2);
        }
        return id;
    }

    /**
     * @param str
     * @returns {Object}
     */
    function parseJson(str) {
        var obj;

        if (typeof str === "string" && str.length === 0) {
            return null;
        }

        try {
            obj = JSON.parse(str);
        } catch (e) {
            obj = {};
            attachJsError(obj, e, "Failed to parse \"" + str + "\"");
        }
        return obj;
    }

    /**
     * Convert string arguments to objects before calling back
     * 
     * @param callback
     * @returns {Function}
     */
    function wrapCallback(callback) {
        return function() {
            var args, i;
            // can't use map function - no IE support
            args = Array.prototype.slice.call(arguments);
            for (i = 0; i < args.length; i++) {
                args[i] = parseJson(args[i]);
            }
            callback.apply(null, args);
        };
    }

    /**
     * Convert string arguments to objects before calling back
     * 
     * @param callbacks
     * @returns {Function}
     */
    function wrapCallbacks(callbacks) {
        return wrapCallback(function() {
            var args, i;

            if (isNullOrUndefined(callbacks)) {
                return;
            }

            args = Array.prototype.slice.call(arguments);
            for (i = 0; i < args.length; i++) {
                if (isObjectAndNotNull(args[i]) && isDefined(args[i].error)) {
                    // error found
                    if (isDefined(callbacks.error)) {
                        callbacks.error.apply(null, args);
                    }
                    return;
                }
            }

            // success
            if (isDefined(callbacks.success)) {
                callbacks.success.apply(null, args);
            }
        });
    }

    /***************************************************************************
     * Initialization
     **************************************************************************/

    supportsNativeDragAndDrop = (function() {
        return (/Mac/).test(navigator.platform)
            && !(/Mac OS X 10[._]4/).test(navigator.userAgent)
            && !(/PPC/).test(navigator.platform)
            && !(/Linux/).test(navigator.platform)
            && isEventSupported('dragstart')
            && isEventSupported('drop');
    }());

    // set default options
    if (isUndefined(options)) {
        options = {};
    }
    if (isUndefined(options.authorizationKey)) {
        options.authorizationKey = "";
    }
    if (isUndefined(options.connectLaunchWaitTimeoutMs)) {
        options.connectLaunchWaitTimeoutMs = 20000;
    }
    if (isUndefined(options.containerId)) {
        options.containerId = getUniqueDomId("aspera_connect_object_container");
    }
    if (isUndefined(options.dropAllowDirectories)) {
        options.dropAllowDirectories = true;
    }
    if (isUndefined(options.dropAllowMultiple)) {
        options.dropAllowMultiple = true;
    }
    if (isUndefined(options.dropMode)) {
        options.dropMode = DROP_MODE.DISABLED;
    }
    if (isUndefined(options.dropUploadUrl)) {
        options.dropUploadUrl = "";
    }
    if (isUndefined(options.height)) {
        options.height = 1;
    }
    if (isUndefined(options.id)) {
        options.id = "aspera-web";
    }
    if (isUndefined(options.image)) {
        options.image = "";
    }
    if (isUndefined(options.imageCover)) {
        options.imageCover = "";
    }
    if (isUndefined(options.linkCapacityKbps)) {
        options.linkCapacityKbps = 0;
    }
    if (isUndefined(options.width)) {
        options.width = 1;
    }

    if (!isNumber(options.connectLaunchWaitTimeoutMs)) {
        throw new Error('"connectLaunchWaitTimeoutMs" must be a number.');
    }
    if (options.dropMode === DROP_MODE.UPLOAD && options.dropUploadUrl === "") {
        throw new Error('"dropUploadUrl" is required if "dropMode" is "'
            + DROP_MODE.UPLOAD
            + '".');
    }
    if (!isNumber(options.height)) {
        throw new Error('"height" must be a number.');
    }
    if (!isNumber(options.linkCapacityKbps)) {
        throw new Error('"linkCapacityKbps" must be a number.');
    }
    if (!isNumber(options.width)) {
        throw new Error('"width" must be a number.');
    }

    id = options.id;

    /***************************************************************************
     * Private methods
     **************************************************************************/

    /**
     * Get plug-in object
     * 
     * @returns {Object}
     */
    function plugin() {
        return document.getElementById(id);
    }

    function setupNativeDragDrop(options) {
        var p, parent;

        p = plugin();
        parent = p.parentNode;

        parent.style.width = options.width + "px";
        parent.style.height = options.height + "px";
        if (options.image.length !== 0) {
            parent.style.background = "transparent url("
                + options.image
                + ") 0 0 no-repeat";
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        }
        parent.addEventListener("dragover", handleDragOver, false);

        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            p.handleDrop();
            return false;
        }
        parent.addEventListener("drop", handleDrop, false);
    }

    function addStandardConnectSettings(data) {
        if (isUndefined(data.aspera_connect_settings)) {
            data.aspera_connect_settings = {};
        }
        data.aspera_connect_settings.app_id = appId;
    }

    function connectHttpRequest(method, path, data, callbacks) {
        var dataStr, response;

        if (isNullOrUndefined(data)) {
            data = {};
        }
        if (!isObjectAndNotNull(data)) {
            throw new Error(
                'connectHttpRequestHelper() - "data" must be an object.');
        }

        // prepare data
        addStandardConnectSettings(data);
        if (options.authorizationKey.length > 0) {
            data.authorization_key = options.authorizationKey;
        }
        dataStr = JSON.stringify(data);

        if (isDefined(callbacks)) {
            response = plugin().connectHttpRequestAsync(
                method,
                path,
                dataStr,
                wrapCallbacks(callbacks));
        } else {
            response = plugin().connectHttpRequest(method, path, dataStr);
        }

        return parseJson(response);
    }

    function connectHttpRequestAsync(method, path, data, callbacks) {
        return connectHttpRequest(method, path, data, callbacks);
    }

    /**
     * Add the plugin object to the specified DOM element. If it is not
     * specified, the plugin is appended to the document body.
     * 
     * @param options
     */
    function insertPluginObject(options) {
        var container, content, coverId, doNativeDragAndDrop, height, image, width, wrapper;

        if (document.getElementById(options.id) !== null) {
            return;
        }

        width = options.width;
        height = options.height;
        image = options.image;
        doNativeDragAndDrop = supportsNativeDragAndDrop
            && options.dropMode !== DROP_MODE.DISABLED;
        if (doNativeDragAndDrop) {
            width = 0;
            height = 0;
            image = "";
        }

        wrapper = document.createElement("div");
        wrapper.style.position = "relative";

        container = document.getElementById(options.containerId);
        if (container === null) {
            document.body.appendChild(wrapper);
        } else {
            container.appendChild(wrapper);
        }

        content = "\n";
        content += '<object id="'
            + options.id
            + '" type="application/x-aspera-web" width="'
            + width
            + '" height="'
            + height
            + '" style="position:absolute;">';
        // Insert Params
        content += '<param name="connect-launch-wait-timeout-ms" value="'
            + options.connectLaunchWaitTimeoutMs
            + '">';
        content += '<param name="image" value="' + image + '">';
        content += '<param name="link-capacity" value="'
            + options.linkCapacityKbps
            + '">';
        content += '<param name="drop-mode" value="' + options.dropMode + '">';
        if (options.dropMode === DROP_MODE.UPLOAD) {
            content += '<param name="drop-upload-url" value="'
                + options.dropUploadUrl
                + '">';
        }
        if (options.dropMode !== DROP_MODE.DISABLED) {
            content += '<param name="drop-allow-directories" value="'
                + options.dropAllowDirectories
                + '">';
            content += '<param name="drop-allow-multiple" value="'
                + options.dropAllowMultiple
                + '">';
        }
        content += '</object>\n';

        if (options.imageCover.length !== 0
            && navigator.userAgent.indexOf('MSIE') !== -1)
        {
            // on IE, user must mouse-over the ActiveX control before
            // drag-and-drop will work
            coverId = options.id + "-cover";
            content += '<img id="'
                + coverId
                + '" src="'
                + options.imageCover
                + '" style="position:absolute;"'
                + ' onClick="document.getElementById(\''
                + coverId
                + '\').style.display=\'none\';"/>\n';
        }

        wrapper.innerHTML = content;

        if (doNativeDragAndDrop) {
            setupNativeDragDrop(options);
        }
    }

    function notifyListeners(eventType, data) {
        var callback, i, type;
        for (i = 0; i < listeners.length; i++) {
            type = listeners[i][0];
            callback = listeners[i][1];

            // call listener if event type matches
            if (type === eventType || type === EVENT.ALL) {
                callback(eventType, data);
            }
        }
    }

    /**
     * Handle plug-in events - either "transfer" or "drop".
     * 
     * @param eventType
     * @param data
     */
    function onEvent(eventType, data) {
        var dataObj, i, transfers;

        dataObj = parseJson(data);

        if (eventType !== EVENT.TRANSFER) {
            // normal case
            notifyListeners(eventType, dataObj);
            return;
        }

        transfers = dataObj.transfers;
        for (i = 0; i < transfers.length; i++) {
            notifyListeners(EVENT.TRANSFER, transfers[i]);
        }
    }

    /***************************************************************************
     * API Functions
     **************************************************************************/

    /**
     * Subscribe for Aspera Web events.
     * 
     * @param type
     *            The type of event to receive callbacks for. Values: "all",
     *            "drop", "transfer" (also defined in this.EVENT).
     * @param callback
     *            function (string type, object) - The event type and the
     *            associated data.
     */
    this.addEventListener = function(type, callback) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("type");
        } else if (arguments.length === 1) {
            throw createArgumentRequiredError("callback");
        }

        listeners.push([type, callback]);

        return null;
    };

    /**
     * [asynchronous] Test authentication credentials against a transfer server.
     * 
     * @param authSpec
     *            Authentication credentials.
     * @param callbacks
     * @returns null or Error.
     */
    this.authenticate = function(authSpec, callbacks) {
        if (isUndefined(authSpec)) {
            throw createArgumentRequiredError("authSpec");
        }
        if (isUndefined(callbacks)) {
            throw createArgumentRequiredError("callbacks");
        } else if (!isObject(callbacks)) {
            throw new Error('"callbacks" must be an object.');
        }

        return connectHttpRequestAsync(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/connect/authenticate", authSpec, callbacks);
    };

    /**
     * Get transfer info.
     * 
     * @param iterationToken
     *            (optional) The last time this method was called. Specify to
     *            return only new and updated transfers. Leave unspecified to
     *            return all transfers.
     * @returns TransferInfo or Error. TransferInfo contains the next iteration
     *          token.
     */
    this.getAllTransfers = function(iterationToken) {
        var data = {};
        if (arguments.length > 0) {
            data.iteration_token = iterationToken;
        }

        return connectHttpRequest(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/activity", data);
    };

    /**
     * Start a new session using this plug-in instance. Call immediately after
     * creating the AW.Connect object. Also call whenever the plugin's DOM
     * object is shown after being hidden.
     * 
     * @param applicationId
     *            (optional) An ID to associate with transfers initiated during
     *            this session. To continue a previous session, use the same ID
     *            as before. Use a unique ID in order to keep transfer
     *            information private from other websites. Automatically
     *            generated if not specified (default).
     * @returns {"app_id" : "^mydomain"} or Error.
     */
    this.initSession = function(applicationId) {
        var p, result;

        if (!isNullOrUndefinedOrEmpty(applicationId)) {
            appId = applicationId;
        }

        p = plugin();
        result = p.initSession(appId, hostname);

        /*
         * Additional plug-in initialization - Everything needed to reinitialize
         * the plug-in if the browser destroys/recreates the instance needs to
         * be here.
         */
        p.eventHandler = function(type, message) {
            onEvent(type, message);
        };

        return result;
    };

    /**
     * Control the rate of a running transfer.
     * 
     * @param transferId
     *            The ID of the transfer to modify.
     * @param options
     *            A subset of TransferStartSpec - rate_policy, target_rate_kbps,
     *            min_rate_kbps, target_rate_cap_kbps
     * @returns null or Error.
     */
    this.modifyTransfer = function(transferId, options) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/modify/"
            + transferId, options);
    };

    /**
     * Unsubscribe from Aspera Web events.
     * 
     * @param type
     *            The type of event to remove the callback for. If the type is
     *            null, removes all instances of the callback. Values: "all",
     *            "drop", "transfer" (also defined in this.EVENT).
     * @param callback
     *            function (string type, object) - The function used to
     *            subscribe in addEventListener()
     */
    this.removeEventListener = function(type, callback) {
        var i, lCallback, lType;

        if (arguments.length < 2) {
            throw createArgumentRequiredError("callback");
        }

        for (i = 0; i < listeners.length; i++) {
            lType = listeners[i][0];
            lCallback = listeners[i][1];

            if (lCallback === callback && (type === null || lType === type)) {
                listeners.splice(i, 1);
            }
        }
        return null;
    };

    /**
     * Remove the transfer, terminating it if necessary, from Connect.
     * 
     * @param transferId
     *            The ID of the transfer to delete.
     * @returns null or Error.
     */
    this.removeTransfer = function(transferId) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/remove/"
            + transferId);
    };

    /**
     * Resume a transfer that ended.
     * 
     * @param transferId
     *            The ID of the transfer to resume.
     * @param options
     *            (optional) { password: "qwerty", user: "luke" }
     * @returns null or Error.
     */
    this.resumeTransfer = function(transferId, options) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/resume/"
            + transferId, options);
    };

    /**
     * Show the Aspera Connect About window.
     * 
     * @returns null or Error.
     */
    this.showAbout = function() {
        return connectHttpRequest(HTTP_METHOD.GET, URI_VERSION_PREFIX
            + "/windows/about");
    };

    /**
     * Open the destination directory of the transfer, using the system file
     * browser.
     * 
     * @param transferId
     *            The ID of the transfer to show files for.
     * @returns null, or Error if not found.
     */
    this.showDirectory = function(transferId) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.GET, URI_VERSION_PREFIX
            + "/windows/finder/"
            + transferId);
    };

    /**
     * Show the Aspera Connect Preferences window.
     * 
     * @returns null or Error.
     */
    this.showPreferences = function() {
        return connectHttpRequest(HTTP_METHOD.GET, URI_VERSION_PREFIX
            + "/windows/preferences");
    };

    /**
     * [asynchronous] Show a file browser dialog for the user to pick a path to
     * save to.
     * 
     * @param callbacks
     *            On success, returns the selected file path. Returns null if
     *            the user cancels the dialog.
     * @param options
     *            (optional)
     * @param options.allowedFileTypes
     *            Filter the files displayed to the user by file extension.
     * @param options.suggestedName
     *            The file name to pre-fill the dialog with.
     * @param options.title
     *            The name of the dialog window.
     * @returns null or Error.
     */
    this.showSaveFileDialog = function(callbacks, options) {
        var result;

        if (isUndefined(options)) {
            options = {};
        }
        if (isUndefined(options.title)) {
            options.title = "";
        }
        if (isUndefined(options.suggestedName)) {
            options.suggestedName = "";
        }
        if (isUndefined(options.allowedFileTypes)) {
            options.allowedFileTypes = "";
        } else {
            options.allowedFileTypes = JSON.stringify(options.allowedFileTypes);
        }

        result = plugin().runSaveFileDialogAsync(
            options.title,
            options.suggestedName,
            options.allowedFileTypes,
            wrapCallbacks(callbacks));
        return isNullOrUndefinedOrEmpty(result) ? null : result;
    };

    /**
     * [asynchronous] Show a file browser dialog for the user to select files.
     * 
     * @param callbacks
     *            On success, returns an array of file paths. Returns an empty
     *            array if the user cancels the dialog.
     * @param options
     *            (optional)
     * @param options.allowMultipleSelection
     *            Allow the selection of multiple files. Default: true.
     * @param options.allowedFileTypes
     *            Filter the files displayed to the user by file extension.
     * @param options.title
     *            The name of the dialog window.
     * @returns null or Error.
     */
    this.showSelectFileDialog = function(callbacks, options) {
        var result;

        if (isUndefined(options)) {
            options = {};
        }
        if (isUndefined(options.title)) {
            options.title = "";
        }
        if (isUndefined(options.allowMultipleSelection)) {
            options.allowMultipleSelection = true;
        }
        if (isUndefined(options.allowedFileTypes)) {
            options.allowedFileTypes = "";
        } else {
            options.allowedFileTypes = JSON.stringify(options.allowedFileTypes);
        }

        result = plugin().runOpenFileDialogAsync(
            options.title,
            options.allowMultipleSelection,
            options.allowedFileTypes,
            wrapCallbacks(callbacks));
        return isNullOrUndefinedOrEmpty(result) ? null : result;
    };

    /**
     * [asynchronous] Show a file browser dialog for the user to select folders.
     * 
     * @param callbacks
     *            On success, returns an array of file paths. Returns an empty
     *            array if the user cancels the dialog.
     * @param options
     *            (optional)
     * @param options.allowMultipleSelection
     *            Allow the selection of multiple folders. Default: true.
     * @param options.title
     *            The name of the dialog window.
     * @returns null or Error.
     */
    this.showSelectFolderDialog = function(callbacks, options) {
        var result;

        if (isUndefined(options)) {
            options = {};
        }
        if (isUndefined(options.title)) {
            options.title = "";
        }
        if (isUndefined(options.allowMultipleSelection)) {
            options.allowMultipleSelection = true;
        }

        result = plugin().runOpenFolderDialogAsync(
            options.title,
            options.allowMultipleSelection,
            wrapCallbacks(callbacks));
        return isNullOrUndefinedOrEmpty(result) ? null : result;
    };

    /**
     * Show the Aspera Connect Transfer Manager.
     * 
     * @returns null or Error.
     */
    this.showTransferManager = function() {
        return connectHttpRequest(HTTP_METHOD.GET, URI_VERSION_PREFIX
            + "/windows/transfer-manager");
    };

    /**
     * Open the Aspera Connect Transfer Monitor for the transfer.
     * 
     * @param transferId
     *            The ID of the transfer to show.
     * @returns null or Error.
     */
    this.showTransferMonitor = function(transferId) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.GET, URI_VERSION_PREFIX
            + "/windows/transfer-monitor/"
            + transferId);
    };

    /**
     * [asynchronous] Test authentication credentials against a transfer server.
     * 
     * @param authSpec
     *            Authentication credentials.
     * @param callbacks
     * @returns null or Error.
     */
    this.authenticate = function(authSpec, callbacks) {
        if (isUndefined(authSpec)) {
            throw createArgumentRequiredError("authSpec");
        }
        if (isDefined(callbacks) && !isObject(callbacks)) {
            throw new Error('"callbacks" must be an object.');
        }

        return connectHttpRequestAsync(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/connect/authenticate", authSpec, callbacks);
    };

    /**
     * [asynchronous] Initiate a single transfer. Get transfer statistics by
     * calling getAllTransfers(), or by registering for events through
     * addEventListener().
     * 
     * @param transfer_spec
     *            See TRANSFER_SPEC definition.
     * @param aspera_connect_settings
     *            See CONNECT_SETTINGS definition.
     * @param callbacks
     *            (optional) See Callbacks definition. An error callback occurs
     *            if spec validation fails or the user denies authorization of
     *            the transfer. A success callback occurs if Connect is able to
     *            start the transfer and add it to the transfer list. Note that
     *            an error could still occur after the transfer starts, e.g. an
     *            authentication failure. Use addEventListener() to receive
     *            notification of these errors. Also note that the success
     *            callback contains the ID (uuid field) of the transfer.
     * @returns { "request_id": "bb1b2e2f-3002-4913-a7b3-f7aef4e79132" } or
     *          Error.
     */
    this.startTransfer = function(
        transfer_spec,
        aspera_connect_settings,
        callbacks)
    {
        var transferSpecs;

        // check arguments
        if (isDefined(transfer_spec)) {
            if (!isObject(transfer_spec)) {
                throw new Error('"transfer_spec" must be an object.');
            }
        } else {
            throw createArgumentRequiredError("transfer_spec");
        }
        if (isDefined(aspera_connect_settings)) {
            if (!isObject(aspera_connect_settings)) {
                throw new Error('"aspera_connect_settings" must be an object.');
            }
        } else {
            aspera_connect_settings = {};
        }
        if (isDefined(callbacks)) {
            if (!isObject(callbacks)) {
                throw new Error('"callbacks" must be an object.');
            }
        } else {
            callbacks = {};
        }

        transferSpecs = {
            transfer_specs : [{
                transfer_spec : transfer_spec,
                aspera_connect_settings : aspera_connect_settings
            }]
        };

        return this.startTransfers(transferSpecs, callbacks);
    };

    /**
     * [asynchronous] Initiate a new transfer using the full response from Node
     * API upload/download setup. Note that only the first transfer_spec will be
     * used as of 2.8.1. Get transfer statistics by calling getAllTransfers(),
     * or by registering for events through addEventListener().
     * 
     * @param transfer_specs
     *            See TRANSFER_SPECS definition.
     * @param callbacks
     *            (optional): See Callbacks definition. An error callback occurs
     *            if spec validation fails or the user denies authorization of
     *            the transfer. A success callback occurs if Connect is able to
     *            start the transfer and add it to the transfer list. Note that
     *            an error could still occur after the transfer starts, e.g. an
     *            authentication failure. Use addEventListener() to receive
     *            notification of these errors. Also note that the success
     *            callback contains the ID (uuid field) of the transfer.
     * @returns { “request_id” : “bb1b2e2f-3002-4913-a7b3-f7aef4e79132” } or
     *          Error
     */
    this.startTransfers = function(
        transfer_specs,
        callbacks)
    {
        var i, requestId, result, transferSpec;

        // check arguments
        if (isDefined(transfer_specs)) {
            if (!isObject(transfer_specs)) {
                throw new Error('"transfer_specs" must be an object.');
            }
        } else {
            throw createArgumentRequiredError("transfer_specs");
        }
        if (isDefined(callbacks)) {
            if (!isObject(callbacks)) {
                throw new Error('"callbacks" must be an object.');
            }
        } else {
            callbacks = {};
        }

        requestId = generateUuid();
        
        for (i = 0; i<transfer_specs.transfer_specs.length; i++) {
            transferSpec = transfer_specs.transfer_specs[i];
            addStandardConnectSettings(transferSpec);
            transferSpec.aspera_connect_settings.request_id = requestId;
            if (isUndefined(transferSpec.aspera_connect_settings.back_link)) {
                transferSpec.aspera_connect_settings.back_link = 
                    window.location.href;
            }
        }
        
        result = connectHttpRequestAsync(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/start", transfer_specs, callbacks);

        if (result === null) {
            // success
            result = {
                request_id : requestId
            };
        }

        return result;
    };

    /**
     * Terminate the transfer. Use resumeTransfer() to resume.
     * 
     * @param transferId
     *            The ID of the transfer to stop.
     * @return null or Error.
     */
    this.stopTransfer = function(transferId) {
        if (arguments.length === 0) {
            throw createArgumentRequiredError("transferId");
        }

        return connectHttpRequest(HTTP_METHOD.POST, URI_VERSION_PREFIX
            + "/transfers/stop/"
            + transferId);
    };

    /**
     * Get the AW.Connect API version and the Aspera Connect version. If the
     * version does not meet the minimum required version, ask the user to
     * update Aspera Connect. This function does not require session
     * initialization.
     * 
     * @returns Version or Error.
     */
    this.version = function() {
        var p, pluginV, connectV, connectVObj, res;

        res = {
            connect : {
                installed : false,
                version : "Not installed"
            },
            plugin : {
                installed : false,
                version : "Not installed"
            }
        };

        p = plugin();
        try {
            connectV = p.queryVersion();
        } catch (e) {
            attachJsError(res, e, "Plugin install required");
            return res;
        }
        try {
            pluginV = p.queryPluginVersion();
        } catch (e2) {
            // pre-2.8 plugin does not have this method
            res.connect.installed = true;
            res.connect.version = connectV;
            res.plugin.installed = true;
            res.plugin.version = connectV;
            attachJsError(res, e2, "Plugin update required");
            return res;
        }

        // 2.8 and after
        // Ardan otherwise it does not work with 3.0
        if (typeof connectV === 'string' && connectV.length > 0) {
        	res.connect.installed = true;
            res.connect.version = connectV;
        }
        else {
	        connectVObj = parseJson(connectV);
	        if (connectVObj.error) {
	            res.error = connectVObj.error;
	        } else {
	            res.connect.installed = true;
	            res.connect.version = connectVObj.release_version;
	        }
        }
        res.plugin.installed = true;
        res.plugin.version = pluginV;

        return res;
    };

    /***************************************************************************
     * Initialization
     **************************************************************************/

    insertPluginObject(options);

}; // AW.Connect

