
/**
 * Version Notes:
 * - Enables multiple Signin to ORCIDs links in the same page using thorApplicationNamespace.addSigninLink function
 * - Adds thorAlwaysShow: An element with this class is never automatically hidden.
 * - thorOrcIdSpan: Allows custom text inside the <Span> for the link to ORCID.
 * - AUTOCOMPLETE and BASIC ORCID id searches removed because ORCID does not recommend 
 * the search by keywords. 
 * - Code refactory.
 * 
 * @author Guilherme Formaggio
 */
var thorApplicationNamespace = {};

//Array to store references to the textfields that will be populated with the values
//from the user ORCID profile after authentication
thorApplicationNamespace.thorArrayTextFields = [];

//Define the Server endpoints for Thor Services to consume. 
thorApplicationNamespace.thorServer = "//www.ebi.ac.uk";
thorApplicationNamespace.thorServerContext = "/europepmc/thor";
thorApplicationNamespace.thorForceLogoutUrl = "//orcid.org/userStatus.json?logUserOut=true"; //"http://sandbox.orcid.org/userStatus.json?logUserOut=true";
	
// EBI-THOR Project WebService Endpoint
thorApplicationNamespace.thorUrl = thorApplicationNamespace.thorServer
		+ thorApplicationNamespace.thorServerContext + "/api/orcid/find/";

// EBI-THOR Project WebService to get the login url
thorApplicationNamespace.thorUrlLogin = thorApplicationNamespace.thorServer
		+ thorApplicationNamespace.thorServerContext
		+ "/api/dataclaiming/loginUrl/";

// EBI-THOR Project WebService to get the login url
thorApplicationNamespace.thorOrcIdBio = thorApplicationNamespace.thorServer
		+ thorApplicationNamespace.thorServerContext
		+ "/api/dataclaiming/orcIdBio/";

/**
 * Identify the integration type and start it by enabling
 * the signin links and controlling with elements must be
 * hidden or displayed.
 */
$(document).ready(function() {
	//Load from thor server the endpoint for login popup
	thorApplicationNamespace.loadLoginUrl();
	
	if (thorApplicationNamespace.isUniqueIntegration()) {
		thorApplicationNamespace.runUniqueIntegration();
	} 
});

/**
 * Check if the integration set is for only one link for ORCID signin
 * or multiple links the same page.
 */
thorApplicationNamespace.isUniqueIntegration = function() {
	var uniqueSpan = $('.thorOrcIdSpan');
	if (uniqueSpan.length != 0) {
		return true;
	} 
	return false;
}

/**
 * There is only one signin link on the page.
 */
thorApplicationNamespace.runUniqueIntegration = function() {
	// Integration with unique login thru OrcId website
	thorApplicationNamespace.thorIntegrationType = "LOGINORCID";

	//Span where the signin text will be created
	var tmpSpan = $('.thorOrcIdSpan');
	//Textfield to hold the ORCID value returned after user authentication
	var tmpOrcIdTxtField = $('.thorOrcIdIdentifier');

	//Register the page elements that will be populated with values after ORCID authentication
	var registerIndex = thorApplicationNamespace.registerElements(
								tmpSpan,
								tmpOrcIdTxtField,
								$('.thorGivenNameTxt'),
								$('.thorFamilyNameTxt'),
								$('.thorCompleteNameTxt'),
								$('.thorEmailTxt'),
								$('.thorCountryTxt'));
	
	//creates the signin link in the span text
	thorApplicationNamespace.generateSpanContent(tmpSpan, tmpOrcIdTxtField, registerIndex);
}

/**
 * Stores the current elements that will receive the 
 * values after the orcid login authentication.
 * Returns the index of the array thorApplicationNamespace.thorArrayTextFields where the
 * reference to the elements is stored.
 */
thorApplicationNamespace.registerElements = function(thorOrcIdSpan, thorOrcIdIdentifier, 
												thorGivenNameTxt, thorFamilyNameTxt, 
												thorCompleteNameTxt, thorEmailTxt, thorCountryTxt) {
	var tmpRegistration = {};
	
	tmpRegistration.thorOrcIdSpan = thorOrcIdSpan;
	// Text fields to autopopulate afer the search of user details at orcide
	tmpRegistration.thorGivenNameTxt = thorGivenNameTxt;
	tmpRegistration.thorFamilyNameTxt = thorFamilyNameTxt;
	tmpRegistration.thorCompleteNameTxt = thorCompleteNameTxt;
	tmpRegistration.thorEmailTxt = thorEmailTxt;
	tmpRegistration.thorCountryTxt = thorCountryTxt;
	tmpRegistration.thorOrcIdIdentifier = thorOrcIdIdentifier;
	thorApplicationNamespace.thorArrayTextFields.push(tmpRegistration);

	//Return index of array where elements reference is hold
	return thorApplicationNamespace.thorArrayTextFields.length-1;
}

/**
 * Function to be invoked by the page integrator in the case of multiple ORCID links to be 
 * displayed in the same page.
 * This function will associate the span id where the link text is created with the fields
 * that will be populated after the results from the ORCID authentication by the user.
 * #THIS FUNCTION MUST ONLY BE INVOKED ONLY AFTER ALL HTML ELEMENTS NAMES PASSED AS PARAMETERS
 * #HAVE ALREADY BEEN RENDERIZED IN THE HTML PAGE.
 * Parameters: String representing the HTML elements ID
 */
thorApplicationNamespace.addSigninLink = function(spanId, txtFieldOrcId,
											thorGivenNameTxt, thorFamilyNameTxt, 
											thorCompleteNameTxt, thorEmailTxt, thorCountryTxt) {
	var spanElement = $( "#" + spanId );
	var orcIdElement = $( "#" + txtFieldOrcId );
	
	//Register the page elements that will be populated with values after ORCID authentication
	var registerIndex = thorApplicationNamespace.registerElements(
								spanElement,
								orcIdElement,
								$( "#" + thorGivenNameTxt),
								$( "#" + thorFamilyNameTxt),
								$( "#" + thorCompleteNameTxt),
								$( "#" + thorEmailTxt),
								$( "#" + thorCountryTxt));
	
	thorApplicationNamespace.generateSpanContent(spanElement, orcIdElement, registerIndex);
}

/**
 * Generates an unique id
 */
thorApplicationNamespace.gUid = function () {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
}

/**
 * Generate the content for the thorOrcIdSpan to display the link to login using
 * orc id.
 */
thorApplicationNamespace.generateSpanContent = function(elemSpan, elemOrcId, index) {
	
	//Text to be placed in the signin link.
	var txtOrcIDLink = thorApplicationNamespace.getSigninText(elemSpan);
	
	//Generates an Id or the a link
	var aId = thorApplicationNamespace.gUid();

	//Fills the span with orcid text, link and image
	elemSpan.html('<label><a href="#" id="' + aId + '">' + txtOrcIDLink + '</a> <a href="http://orcid.org/faq-page" target="_blank" ><img src="'
			+ thorApplicationNamespace.thorServer
			+ thorApplicationNamespace.thorServerContext
			+ '/resources/orcid-id.png" value="What is ORCID?" width="15" height="15" /></a></label>');
	
	//Create an onClick link for the ORCID authentication text
	//thorApplicationNamespace.loadLoginUrl($('#' + aId), index);
	var paramLink = $('#' + aId);
    paramLink.unbind("click");
    paramLink.click(function(e) {
		e.preventDefault(); // this will prevent the browser to
							// redirect to the href
		thorApplicationNamespace.openOrcidPopup(index);
	});
	
	//Display the signin link or ORCID id textfield
	thorApplicationNamespace.displaySigninElements(elemSpan, elemOrcId);
}

/**
 * Control if the signin link will be displayed or the textfield filled with ORCID id value.
 * If there is already an ORCID id in the textfield, then it should be displayed and
 * the signin link is hidden.
 */
thorApplicationNamespace.displaySigninElements = function(elemSpan, elemOrcId) {
	//If the orcid value already exists, then it is an update form
	if ($.trim(elemOrcId.val()) != '') {
		//Is update ORCID value
		thorApplicationNamespace.thorElementHide(elemSpan); //hide link for authentication
		elemOrcId.show(); //display the ORCID id textfield
	}
	else {
		//Is new ORCID value
		// Hide textbox for ORCID id while it is empty
		thorApplicationNamespace.thorElementHide(elemOrcId); //hide the ORCID id textfield
		elemSpan.show();  //display link for authentication
	}
}

/**
 * Returns the text to be placed in the signin link.
 */
thorApplicationNamespace.getSigninText = function(elemSpan) {
	//Default text for the ORCID link displayed on screen
	var txtOrcIDLink = 'Create/link an Open Researcher Contributor ID(ORCID)';
	 
	//Check if there is custom text from user for the ORCID link
	if ($.trim(elemSpan.text())) {
		txtOrcIDLink = $.trim(elemSpan.text());
	}
	
	return txtOrcIDLink;
}

/**
 * Check if the current form is to update or find a new orcid value.
 */
thorApplicationNamespace.isUpdateForm = function() {
	var orcIdNumber = $.trim(thorApplicationNamespace.thorOrcIdIdentifier.val())
	//If the orcid value already exists, then it is an update form
	if (orcIdNumber != '') {
		return true;
	}
	return false;
}

thorApplicationNamespace.getServerNamePort = function() {
	var url = window.location.href
	var arr = url.split("/");
	var result = arr[0] + "//" + arr[2]
	return result;
}

thorApplicationNamespace.buildUrl = function(base, key, value) {
	if (thorApplicationNamespace.validURL(base)) {
		var sep = (base.indexOf('?') > -1) ? '&' : '?';
		return base + sep + key + '=' + value;
	}
	return '';
}

/**
 * Basic Integration: Defines the event to be called when click the search
 * button for objects marked as class 'thorSearchButton'
 */
thorApplicationNamespace.setBasicSearchClick = function setBasicSearchClick() {
	$('.thorSearchButton').on('click',
			thorApplicationNamespace.fnBasicSearchClick);
}

/**
 * Function to call a Rest Web Service at the endpoint and invoke the callback
 * function to process the results passing the json string returned from WS as
 * function parameter.
 */
thorApplicationNamespace.callWS = function(endpoint, onSuccess, onComplete,
		myData, sendType) {
	var serviceUrl = endpoint;
	$.ajax({
		url : serviceUrl,
		crossDomain : true,
		xhrFields : {
			withCredentials : true
		},
		type : sendType,
		data : JSON.stringify(myData),
		dataType : 'json',
		success : function(data) {
			if (onSuccess != null) {
				onSuccess(data);
			}
		},
		complete : function(data) {
			if (onComplete != null) {
				onComplete(data);
			}
		}
	});
}

/**
 * Function to call a Rest Web Service with jsonp at the endpoint and invoke 
 * the callback function to process the results .
 */
thorApplicationNamespace.callWSJsonP= function(endpoint, onSuccess, onError) {
	var serviceUrl = endpoint;
	$.ajax({
	    url: serviceUrl,
	    dataType: 'jsonp',
	    success : function(result,status,xhr) {
			if (onSuccess != null) {
				onSuccess(result,status,xhr);
			}
		},
	    error: function (xhr, status, error) {
	    	if (onError != null) {
	    		onError(xhr, status, error);
			}
	    }
	});	
}

/**
 * Prepare the fields that will receive the values from ORCID 
 * after user authentication, and open a popup for user to authenticate
 */
thorApplicationNamespace.openOrcidPopup = function(index) {
	
	//Prepare the fields to receive the ORCID values results after authentication
	thorApplicationNamespace.setCurrentFields(index);
	
	if (thorApplicationNamespace.thorLoginUrl != "") {
		var windowName = $(this).attr('id');
		window.open(thorApplicationNamespace.thorLoginUrl, windowName, "height=900,width=800");
	}
}

/**
 * Points the thorApplicationNamespace variables to the fields that must be populated with
 * the current result from ORCID authentication
 */
thorApplicationNamespace.setCurrentFields = function(index) {
	thorApplicationNamespace.thorOrcIdSpan = thorApplicationNamespace.thorArrayTextFields[index].thorOrcIdSpan;
	thorApplicationNamespace.thorGivenNameTxt = thorApplicationNamespace.thorArrayTextFields[index].thorGivenNameTxt;
	thorApplicationNamespace.thorFamilyNameTxt = thorApplicationNamespace.thorArrayTextFields[index].thorFamilyNameTxt;
	thorApplicationNamespace.thorCompleteNameTxt = thorApplicationNamespace.thorArrayTextFields[index].thorCompleteNameTxt;
	thorApplicationNamespace.thorEmailTxt = thorApplicationNamespace.thorArrayTextFields[index].thorEmailTxt;
	thorApplicationNamespace.thorCountryTxt = thorApplicationNamespace.thorArrayTextFields[index].thorCountryTxt;
	thorApplicationNamespace.thorOrcIdIdentifier = thorApplicationNamespace.thorArrayTextFields[index].thorOrcIdIdentifier;
}

thorApplicationNamespace.loadLoginUrl = function() {
	thorApplicationNamespace.callWS(thorApplicationNamespace.thorUrlLogin,
			null, function(data) {
				var url = data.responseText;
				//Add client server name + port to login URL so the javascript from server can communicate via postMessage 
		        //with the javascript from client.
		        if (url!="") {
		        	thorApplicationNamespace.thorLoginUrl = thorApplicationNamespace.buildUrl(url, "clientAddress", thorApplicationNamespace.getServerNamePort())
		        }				
			}, '', 'GET');
}

/**
 * Validates if str is a valid URL
 */
thorApplicationNamespace.validURL = function(str) {
		  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
		  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		  return pattern.test(str);
}

/**
 * 
 */
thorApplicationNamespace.searchOrcIdBio = function(callback) {
	thorApplicationNamespace.callWS(thorApplicationNamespace.thorOrcIdBio,
			function(data) {
				// If callback function is informed, then invoke it
				if (callback != null) {
					callback(JSON.stringify(data))
				} else {
					// if no callback function is passed,
					// we will automatically populate the
					// returned values to the fields.
					thorApplicationNamespace.populateOrcIdBiofields(JSON
							.stringify(data));
				}
				
				//Sign out the user from OrcId website authentication
				thorApplicationNamespace.callWSJsonP(thorApplicationNamespace.thorForceLogoutUrl, null, null)
			}, null, '', 'GET');
}

/**
 * Populate the form's fields with values returned from ORCID profile
 */
thorApplicationNamespace.populateOrcIdBiofields = function(dataStr) {
	var data = jQuery.parseJSON(dataStr);

	if (thorApplicationNamespace.thorGivenNameTxt != null) {
		try {
			thorApplicationNamespace.thorGivenNameTxt
					.val(data['orcid-profile']['orcid-bio']['personal-details']['given-names']['value'])
		} catch (err) {
		}
	}
	if (thorApplicationNamespace.thorFamilyNameTxt != null) {
		try {
			thorApplicationNamespace.thorFamilyNameTxt
					.val(data['orcid-profile']['orcid-bio']['personal-details']['family-name']['value'])
		} catch (err) {
		}
	}
	if (thorApplicationNamespace.thorCompleteNameTxt != null) {
		try {
			var fistName = data['orcid-profile']['orcid-bio']['personal-details']['given-names']['value'];
			var lastName = data['orcid-profile']['orcid-bio']['personal-details']['family-name']['value']
			thorApplicationNamespace.thorCompleteNameTxt.val(fistName + " "
					+ lastName);
		} catch (err) {
		}
	}
	if (thorApplicationNamespace.thorOrcIdSpan != null) {
		try {
			thorApplicationNamespace.thorOrcIdIdentifier
					.val(data['orcid-profile']['orcid-identifier']['path'])
			thorApplicationNamespace.thorOrcIdIdentifier.show();
			thorApplicationNamespace.thorElementHide(thorApplicationNamespace.thorOrcIdSpan);
		} catch (err) {
		}
	}
	if (thorApplicationNamespace.thorEmailTxt != null) {
		try {
			thorApplicationNamespace.thorEmailTxt
					.val(data['orcid-profile']['orcid-bio']['contact-details']['email'][0]['value'])
		} catch (err) {
		}
	}
	if (thorApplicationNamespace.thorCountryTxt != null) {
		try {
			thorApplicationNamespace.thorCountryTxt
					.val(data['orcid-profile']['orcid-bio']['contact-details']['address']['country']['value'])
		} catch (err) {
		}
	}
}

/** 
 * Thor listener for javascript integration
 */
function thorListener(event) {
	thorApplicationNamespace.searchOrcIdBio();
}

if (window.addEventListener) {
	addEventListener("message", thorListener, false)
} else {
	attachEvent("onmessage", thorListener)
}

thorApplicationNamespace.thorElementHide = function(element) {
	if (!element.hasClass("thorAlwaysShow")) {
		element.hide();		
	}
}
