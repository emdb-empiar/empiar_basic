// empiar-jquery.js
//
// Authors:
//		Andrii Iudin
//
// Description:
// 		File with functions for form handling of EMPIAR 
//		deposition and annotation system
//
// Date:
//		20160606
//
// Copyright [2013-16] EMBL - European Bioinformatics Institute
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
// 0.1, 2016/06/06: Separated the code from the general empiar
//					javascript file.

// Parsley config to allow adding the errors before the fields
var parsleyConfig = {
	errorsContainer: function errorsContainer(Field) { return $('<div/>').prependTo(Field.$element.parent()); }
}
$(function() {
	var $parsley = $('#empiar_deposition_form').parsley(parsleyConfig);
})

// Re-activate Parsley client-side validation to exclude the removed form
reactivateParsley = function() {
	if ( ($('form[data-parsley-validate]').length > 0) && (typeof $('form[data-parsley-validate]').parsley == 'function') ) {
	    $('form[data-parsley-validate]').parsley().destroy();
	    $('form[data-parsley-validate]').parsley(parsleyConfig);
	}
}

// If only one form is being displayed, then remove from the page the "Remove" button that allows the removal of the form from the formset
// @param formsParent: parent of the form element
// @param displayedForms: number of displayed forms
// @param formsetId: the id of the Remove button formset that has to be removed
// @param removeButtonVal: the text that is displayed in the "Remove" button
// @example: recursiveGetChildren( $('div#empiar_image_set_formset-0-name-div.empiar_form_separation'), 1, 'empiar_image_set_formset', 'Remove image sets' );
recursiveGetChildren = function(formsParent, displayedForms, formsetId, removeButtonVal, displayRemoveAlways) {
	if (formsParent.children().length) {
		recursiveGetChildren(formsParent.children(), displayedForms, formsetId, removeButtonVal, displayRemoveAlways);
	}
	formsParent.each(function () {
		if (displayedForms == 1 && !displayRemoveAlways) {
			if (-1 != this.id.indexOf(formsetId)) {
				if (this.type == 'button' && this.value == removeButtonVal)
					this.remove();
			}
		}
    });
}

// Recursively set the DELETE form flag for all subforms in a form (for formsets in formsets)
// @param formsParent: parent of the form element
// @example: recursiveGetChildren( $('#remove_empiar_citation_formset-2-name') );
recursiveSetDelete = function(formsParent) {
	if (formsParent.children().length) {
		recursiveSetDelete(formsParent.children());
	}
	formsParent.each(function () {
		if ( this.id.indexOf('DELETE') >-1 ) {
			if (this.type == 'hidden' && this.tagName == 'INPUT')
				this.value = 1;
		}
	});
}


// Add the "Remove" button to the form
// @param newFormDivId: ID of the form to which the "Remove" button will be added
// @param formsetId: ID of the formset that contains the form
// @param RemoveFormBtnId: ID of the "Remove" button that will be added
// @param addToClass: Class of forms that are to be scanned for the existing Remove elements
// @param removeButtonVal: the text that is displayed in the "Remove" button
// @example: addRemoveButton('empiar_image_set_formset-0-name-div', 'empiar_image_set_formset', 'remove_empiar_image_set_formset-0-name', 'empiar_form_separation', 'Remove image sets');
// @example: addRemoveButton('empiar_cit_author_formset-0-name-div', 'empiar_cit_author_formset', 'remove_empiar_cit_author_formset-0-name', 'empiar_cit_author_formset_form-0');
addRemoveButton = function(newFormDivId, formsetId, RemoveFormBtnId, addToClass, removeButtonVal, displayRemoveAlways) {
	if ( (typeof displayRemoveAlways === 'undefined') || (displayRemoveAlways == null) )
		displayRemoveAlways = false;
	
	if ( ! $( "#" + RemoveFormBtnId ).length ) {
	    $('#' + newFormDivId).append('<input type="button" value="'+removeButtonVal+'" id="'+RemoveFormBtnId+'">');

	    $('#' + RemoveFormBtnId).click(function() {
	    	$(this.id.replace("-name", "-DELETE").replace("remove_","#id_"))[0].value=1;
	        $(this).parent().hide();
	        addToClass = $('#'+newFormDivId).attr("class");
	        recursiveSetDelete($(this).parent());

	        var displayedForms = $('input').filter("[id*='" + formsetId + "']").filter("[id*='DELETE']").filter(function() {
	        	// Verify that the delete buttons belong to the parent formset DIV that contains the pressed button
	    	    return -1 !== this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.indexOf( $('#'+newFormDivId).attr("class") );
	    	}).filter(function() {
	    	    return -1 === this.id.indexOf('__prefix__');
	    	}).filter(function() {
	    	    return 1 != this.value;
	    	});
	    	
	    	// Number of displayed forms minus the empty_form
		    var displayedFormsSize = $('.' + addToClass).filter(function() {
			    return "none" != this.style.display;
			}).size() - 1;

	        forms = $('.'+addToClass);

			i = 0;
			for (formCount = forms.length; i < formCount; i++) {
				recursiveGetChildren($(forms.get(i)), displayedFormsSize, formsetId, removeButtonVal, displayRemoveAlways);
	       	}

			// Trigger the change event on the element that contains the total number of forms. This is necessary to 
			// properly generate the list of citations for the copying of citation authors into the entry authors
			$('#id_' + formsetId + '-TOTAL_FORMS').trigger('change');

			reactivateParsley();
	    });
	}
}


// Helper function for activating and validating select + other field in case if the form that contains it has been
// added with "Add more" button
// @param text_fieldId: ID of the text field ("Other") that is paired with the the select field
activateParsleyOther = function(event) {
	var text_fieldId = event.data.text_fieldId;
	var attr = $(text_fieldId).attr('data-parsley-grpup');
	if (typeof attr === typeof undefined || attr === false)
		$(text_fieldId).attr('data-parsley-grpup', text_fieldId);
	$('form[data-parsley-validate]').parsley().validate(text_fieldId);
}

// Show or hide the "Other" text input field depending on which option is active in the "Select" field
// @param RemoveFormBtnId: ID of the "Select" field that will have the trigger to show/hide the "Other" field
// @example: showHideOtherField('#id_empiar_image_set_formset-0-header_format_0');
showHideOtherField = function(fieldId) {
	if ($('select'+fieldId+'_0').val() == 'OT')
	{
		$(fieldId+'_1').css('display', 'block');
		$(fieldId+'_1').on("focusout", {text_fieldId: fieldId+'_1'}, activateParsleyOther);
	}
	else if ( $('select'+fieldId+'_0').length )
	{
		$(fieldId+'_1').css('display', 'none');
	}
	$('select'+fieldId+'_0').change(function(){
		var text_fieldId = '#'+this.id.replace(new RegExp('_0' + '$'), '_1');
		if ($('#'+this.id).val() == 'OT')
		{
			$(text_fieldId).css('display', 'block');
			$(text_fieldId).on("focusout", {text_fieldId: fieldId+'_1'}, activateParsleyOther);
			activateParsleyOther({data: {text_fieldId: fieldId+'_1'}});
		}
		else
		{
		    $(text_fieldId).css('display', 'none');
		}
	});
}


// Activate the button of the selection of the form type for forms that have different fields for two kinds of data
// @param formsetId: ID of the formset that contains the form
// @param numOfFormsTotal: total number of forms of this formset that are present on the page
// @param choiceField: the name of the choice field that will have the on-click event added
// @param firstRowClass: class of a general field of the first kind of data that is stored in the form
// @param secondRowClass: class of a general field of the second kind of data that is stored in the form
// @param firstRequiredClass: class of a required field of the first kind of data that is stored in the form
// @param secondRequiredClass: class of a required field of the second kind of data that is stored in the form
// @param hiddenRowClass: the name of the class that is used to hide the field that belongs to the kind of data that is currently not selected
// @param empiarMandatoryField: the name of the class that is used to mark the field as mandatory
// @example: activateFormTypeChoice('empiar_citation_formset', 3, 'j_or_nj_citation', 'jRow', 'njRow', 'jRequired', 'njRequired', 'hiddenRow', 'empiarMandatoryField');
activateFormTypeChoice = function(formsetId, numOfFormsTotal, choiceField, firstRowClass, secondRowClass, firstRequiredClass, secondRequiredClass, hiddenRowClass, mandatoryFieldClass){
	var pathToClasses = '#' + formsetId + '-' + numOfFormsTotal + '-name-div>div>table>tbody>.'
	$('#id_' + formsetId + '-' + numOfFormsTotal + '-' + choiceField + '_0').unbind('click').bind('click', function() {
		$(pathToClasses + firstRowClass).each(function() {
			$(this).removeClass(hiddenRowClass);
		});
		
		$(pathToClasses + secondRowClass).each(function() {
			$(this).addClass(hiddenRowClass);
		});
			
		$(pathToClasses + secondRequiredClass).each(function() {
			$(this).removeClass(mandatoryFieldClass);
		});
			
		$(pathToClasses + firstRequiredClass).each(function() {
			$(this).addClass(mandatoryFieldClass);
		});
		
		reactivateParsley();
	});
	
	$('#id_' + formsetId + '-' + numOfFormsTotal + '-' + choiceField + '_1').unbind('click').bind('click', function() {
		$(pathToClasses + secondRowClass).each(function() {
			$(this).removeClass(hiddenRowClass);
		});
		
		$(pathToClasses + firstRowClass).each(function() {
			$(this).addClass(hiddenRowClass);
		});
			
		$(pathToClasses + firstRequiredClass).each(function() {
			$(this).removeClass(mandatoryFieldClass);
		});
			
		$(pathToClasses + secondRequiredClass).each(function() {
			$(this).addClass(mandatoryFieldClass);
		});
		
		reactivateParsley();
	});
}


// Handle form addition and removal in formsets: add "Add more", "Remove" buttons, set on-click events for those buttons
// @param formsetId: ID of the div in which the formset is located, corresponds to the name of formset
// @param emptyFormsetId: ID of the div in which the empty form is located
// @param addFormBtnId: ID of the "Add more" button that adds forms to the formset
// @param fieldNames: an array of field names that is used to display and hide fields that combine a text input with a select option
// @param addToId: ID of the element to which the "Add more" button will add a new form
// @param internalFormsets: an array of parameters of the formsets that are stored in the given deposition element
// @param activateChoice: an array of parameters for the handling of the choices for forms that store two different kinds of data
// @param removeButtonVal: the text that is displayed in the "Remove" button
// @param displayRemoveAlways: a switch to display "Remove" button even if there is only one form in formset present on the page
// @example: handleFormsHtml('empiar_cross_reference_formset', 'empiar_cross_reference_formset_empty_form', 'empiar_cross_reference_formset_add_more', empiar_cross_reference_fieldNames);
handleFormsHtml = function(formsetId, emptyFormsetId, addFormBtnId, fieldNames, addToId, internalFormsets, activateChoice, removeButtonVal, displayRemoveAlways, callback){
	// IMPORTANT: the number of currently displayed forms is determined by the class of the form, e.g. empiar_image_set_formset_form. This is
	// necessary for the display of "Remove" button
	
	// Set the default values for parameters that might have been undefined or defined as null
	if ( (typeof addToId === 'undefined') || (addToId == null) )
		addToId = formsetId;
	if ( (typeof removeButtonVal === 'undefined') || (removeButtonVal == null) )
		removeButtonVal = "Remove";
	if ( (typeof displayRemoveAlways === 'undefined') || (displayRemoveAlways == null) )
		displayRemoveAlways = false;
	
	// The class name that is assigned to all forms in the formset
	var addToClass = addToId.replace('formset', 'formset_form');
	
	// The list contains forms that are not empty forms, which are used by Django to add forms to formsets. Those forms contain '__prefix__' (default Django naming), 
	// '__intp__' or '__intpf__' (implemented for handling formsets in formsets) in them
	var nonEmptyForms = $('input').filter("[id*='" + formsetId + "']").filter("[id*='DELETE']").filter(function() {
	    return -1 === this.id.indexOf('__prefix__');
	}).filter(function() {
	    return -1 === this.id.indexOf('__intp__');
	}).filter(function() {
	    return -1 === this.id.indexOf('__intpf__');
	});
	
	nonEmptyFormsNum = nonEmptyForms.size();
	
	// Set the total number of forms to the proper one, as Django recognizes only forms with '__prefix__' and treats those that are added for formsets in formsets implementation
	// ('__intp__' and '__intpf__') as non-empty ones. Triggering change is necessary to allow automatic lists updating, e.g. the list of citations for copying of citation
	// authors into the entry authors
	$('#id_' + formsetId + '-TOTAL_FORMS').val(nonEmptyFormsNum).trigger('change');
	
	// Hide all forms that are marked for deletion
	$('input').filter("[id*='" + formsetId + "']").filter("[id*='DELETE']").filter("[value=1]").parent().parent().parent().parent().parent().hide();
	
	// The number of forms of class that is assigned to all forms in the formset, minus the empty form
	var numOfFormsOfClass = $('.' + addToClass).filter(':visible').size();
	
	// If more than one form is present on the page, then add Remove buttons to all forms
	if (numOfFormsOfClass>1 || displayRemoveAlways) {
		// Only add "Remove" buttons if it is for the handleFormsHtml call from the main Django template rather than a recursive one
		$('.' + addToClass).filter(function() {
			    return -1 === this.id.indexOf('__prefix__');
			}).filter(function() {
			    return -1 === this.id.indexOf('__intp__');
			}).filter(function() {
			    return -1 === this.id.indexOf('__intpf__');
			}).each(function () {
				var newFormDivId = this.id;
				var RemoveFormBtnId = 'remove_' + newFormDivId.replace("-name-div","") + '-name'
				
				addRemoveButton(newFormDivId, formsetId, RemoveFormBtnId, addToClass, removeButtonVal, displayRemoveAlways);
		});
	}
	
	// Handling "Select with 'Other'" field display
	if (typeof fieldNames !== 'undefined' && fieldNames !== null) {
		for (formNum = 0; formNum<nonEmptyFormsNum; formNum++) {
			var arrayLength = fieldNames.length;
	    	if (arrayLength) {
				var fieldId = "";
				for (i = 0; i<arrayLength; ++i) {
					fieldId = "#id_"+formsetId+'-'+formNum+'-'+fieldNames[i];
					showHideOtherField(fieldId);
				}
			}
		}
	}
	
	// "Add more" button on-click event handling
	// rmbv is used to transfer the value of the remove button from the handleFormsHtml(...) call. Otherwise, only the latest value is used for all click events
    $('#'+addFormBtnId).unbind('click').bind('click', {rmbv: removeButtonVal, dra: displayRemoveAlways, callback: callback}, function(event) {
    	// Get the total number of forms
    	var numOfForms = parseInt($('#id_' + formsetId + '-TOTAL_FORMS').val());
    	
    	// The class that will have a form added to it has to be re-defined based on the clicked button name
    	addToClass = addFormBtnId.replace("add_more", "form");
    	
    	var numOfFormsOfClass = $('.'+addToClass).size() - 1;
    	
    	// Html representation of the form that will be appended
    	var formToAppend = $('#'+emptyFormsetId).html()
    	
    	// If internal formsets are defined in the current formset, then replace the internal form elements' IDs intFormsetId with proper ones based on those that are already displayed
    	if (typeof internalFormsets !== 'undefined' && internalFormsets !== null) {
	    	var arrayLength = internalFormsets.length;
	    	if (arrayLength) {
				var fieldId = "";
				
				for (i = 0; i<arrayLength; ++i) {
					var intFormsetId = internalFormsets[i].formsetId.replace("-__intp___empty_form", "")
					
			    	// Set the main form ID in the subform's corresponding field
			    	if (typeof internalFormsets[i].replaceList !== 'undefined' && internalFormsets[i].replaceList !== null) {
			    		var replaceArrayLength = internalFormsets[i].replaceList.length;
			    		for (j = 0; j<replaceArrayLength; ++j) {
			    			
					    	// The parent formset that holds another formset has to have an ID that is used to connect those two formsets on Django side. By default it is set to 
					    	// a negative increment to avoid clashing with proper IDs of already saved in Django forms
					    	var newTopFormId = -numOfForms - 1;
					    	var fieldForTopFordIdSuffix = internalFormsets[i].replaceList[j].fieldForTopFordIdSuffix;
							if (typeof fieldForTopFordIdSuffix !== 'undefined' && fieldForTopFordIdSuffix !== null) {
								var lastTopFormId = $('#id_' + intFormsetId + '-' + (numOfForms-1) + '-' + fieldForTopFordIdSuffix).val();
								if ( lastTopFormId < 0 ) {
									newTopFormId = lastTopFormId - 1;
								}
							}
			    			
				    		find = internalFormsets[i].replaceList[j].originalInput;
					    	regex = new RegExp(find, "g");

					    	formToAppend = formToAppend.replace(find, internalFormsets[i].replaceList[j].finalInput).replace('_value_placeholder_', newTopFormId);
			    		}
			    	}
			    	
					var find = intFormsetId + "-__prefix__";
			    	var regex = new RegExp(find, "g");
			    	var numOfFormsTotal = parseInt($('#id_' + formsetId + '-TOTAL_FORMS').val());

			    	formToAppend = formToAppend.replace(regex, intFormsetId + "-" + (numOfFormsTotal));
			    	formToAppend = formToAppend.replace(intFormsetId + "_add_more-__prefix__", intFormsetId + "_add_more-" + (numOfFormsOfClass));
			    	
			    	// Replace IDs of the first clean subform in the set
			    	find = intFormsetId + "-__intpf__";
			    	regex = new RegExp(find, "g");
			    	var numOfIntForms = parseInt($('#id_' + intFormsetId + '-TOTAL_FORMS').val());
			    	formToAppend = formToAppend.replace(regex, intFormsetId + "-" + numOfIntForms);
			    	
			    	find = intFormsetId + "_form-__prefix__";
			    	regex = new RegExp(find, "g");
			    	formToAppend = formToAppend.replace(regex, intFormsetId + "_form-" + (numOfFormsOfClass));
			    	
			    	find = intFormsetId + "-__intp__";
			    	regex = new RegExp(find, "g");
			    	formToAppend = formToAppend.replace(regex, intFormsetId + "-__prefix__");
			    	
			    	formToAppend = formToAppend.replace(intFormsetId + "_form-__intp__", intFormsetId + "_form-" + (numOfFormsOfClass+1));
				}
	    	}
    	}

    	// Append the empty form to the formset, replace the prefix with the ID of the form that is being added
    	var find = formsetId + "-__prefix__";
    	var regex = new RegExp(find, "g");
    	var numOfFormsTotal = parseInt($('#id_' + formsetId + '-TOTAL_FORMS').val());
    	$('#' + addToId).append( formToAppend.replace(regex, formsetId + "-" + numOfFormsTotal) );
    	$('#id_' + formsetId + '-TOTAL_FORMS').val(numOfFormsTotal+1).trigger('change');
    	
    	if (typeof fieldNames !== 'undefined' && fieldNames !==null) {
	    	// Handling "Other" field display and N/A button functionality
	    	var arrayLength = fieldNames.length;
	    	if (arrayLength) {
	    		var fieldId = "";
	    		for (i = 0; i<arrayLength; ++i) {
	    			fieldId = "#id_"+formsetId+'-'+numOfFormsTotal+'-'+fieldNames[i];
	    			$(fieldId+"_na_button").on("click", function(e) { $('#'+this.id.replace('_na_button', '')).trigger( "focusin" ); $('#'+this.id.replace('_na_button', '')).val("***_N/A_***"); $('#'+this.id.replace('_na_button', '')).trigger( "focusout" ); });
	    			showHideOtherField(fieldId);
	    		}
	    	}
    	}
    	
    	if (typeof activateChoice !== 'undefined' && activateChoice !== null) {
    		activateFormTypeChoice(formsetId, numOfFormsTotal, activateChoice.choiceField, activateChoice.firstRowClass, activateChoice.secondRowClass, activateChoice.firstRequiredClass, activateChoice.secondRequiredClass, activateChoice.hiddenRowClass, activateChoice.mandatoryFieldClass)
    	}
    	
    	// Set the ID of the form to a unique for this formset negative number to signal Django that this is a new entry to the database
    	// If the last form on page is from pending and thus has a negative ID, then use it instead of the total number of forms on page
    	if ( $('#id_'+formsetId+'-'+(numOfFormsTotal-1)+'-id').val() < 0 ) {
    		$('#id_'+formsetId+'-'+numOfFormsTotal+'-id').val( $('#id_'+formsetId+'-'+(numOfFormsTotal-1)+'-id').val() - 1 );
    	} else {
    		$('#id_'+formsetId+'-'+numOfFormsTotal+'-id').val(-numOfFormsTotal - 1);
    	}
    	
    	// Add the "Remove" button to the current form if at the moment of "Add more" button being pressed only one form is being displayed
        // Minus one for the empty_form minus the newly added one
        var numOfFormsOfClassBeforeAdd = $('.' + addToClass).filter(function() {
		    return "none" != this.style.display;
		}).size() - 2;

        if (numOfFormsOfClassBeforeAdd == 1) {
        	// Current form number in the list of all those that have the same class is the total minus the empty_form one minus the newly added one. 
        	// Also .length gives the total number, while we are interested in the position in the array, so there is another minus one
        	currentFormNum = $('.' + addToClass).filter(function() {
    		    return "none" !== this.style.display;
    		}).length - 3
        	var currentFormDivId = $('.' + addToClass).filter(function() {
    		    return "none" !== this.style.display;
    		})[currentFormNum].id;
        	
        	var firstVisibleFormId = currentFormDivId.split("_formset-")[1].split('-')[0];
        	var currentRemoveFormBtnId = 'remove_' + formsetId + '-'+firstVisibleFormId+'-name';
			
    	    addRemoveButton(currentFormDivId, formsetId, currentRemoveFormBtnId, addToClass, event.data.rmbv, event.data.dra);
        }
    	
        // Add the "Remove" button to the added form
        // Check that the number of existing forms before addition is more than 0 or displayRemoveAlways (dra) is set to true
        // otherwise no need to add the remove button
        if (numOfFormsOfClassBeforeAdd > 0 || event.data.dra) {
            // Minus one as the new form has been added and counting starts from 1 and not from 0.
	        numOfFormsTotal = parseInt($('#id_' + formsetId + '-TOTAL_FORMS').val()) - 1;
	        var newFormDivId = formsetId+'-'+numOfFormsTotal+'-name-div';
	    	var RemoveFormBtnId = 'remove_' + formsetId + '-'+numOfFormsTotal + '-name';
	    	addRemoveButton(newFormDivId, formsetId, RemoveFormBtnId, addToClass, event.data.rmbv, event.data.dra);
        }
    	
	    // Add a mask to the input for author ORCID
	    if ($('#'+emptyFormsetId).html().indexOf('-author_orcid')>-1) {
			$.mask.definitions['h'] = "[Xx0-9]";
			$('#id_'+formsetId+'-'+numOfFormsOfClass+'-author_orcid').mask('9999-9999-9999-999h');
			$('#id_'+formsetId+'-'+numOfFormsOfClass+'-author_orcid').bind('paste', function () {
				if ($('#id_'+formsetId+'-'+numOfFormsOfClass+'-author_orcid').val()=='____-____-____-____')
					$('#id_'+formsetId+'-'+numOfFormsOfClass+'-author_orcid').val(''); 
			});
	    }
	    
	    // Activate copy-able tooltips on the added elements
	    setupCopyableTooltip();
	    // Cycle through all forms that are embedded in the parent element
	    if (typeof internalFormsets !== 'undefined' && internalFormsets !== null) {
	    	var arrayLength = internalFormsets.length;
	    	if (arrayLength) {
	    		// The form that has been appended has increased the total number of forms by 2
				var fieldId = "";
				for (l = 0; l<arrayLength; ++l) {
					intFormsetId = internalFormsets[l].formsetId.replace("__intp__", numOfFormsOfClass)
					var numOfInternalFormsTotal = parseInt($('#id_' + intFormsetId + '-TOTAL_FORMS').val());

					$('#id_'+intFormsetId+'-'+numOfInternalFormsTotal+'-id').val(-numOfInternalFormsTotal - 1);
					
					// Call the forms handling with the internal prefix replaced by the parent form number
					if (typeof internalFormsets[l].fieldNames !== 'undefined' && internalFormsets[l].fieldNames !== null) {
				    	// Handling "Other" field display and N/A button functionality
				    	var fieldNamesArrayLength = internalFormsets[l].fieldNames.length;
				    	if (fieldNamesArrayLength) {
				    		var fieldId = "";
				    		for (j = 0; j<fieldNamesArrayLength; ++j) {
				    			fieldId = "#id_"+intFormsetId+'-'+numOfInternalFormsTotal+'-'+internalFormsets[l].fieldNames[j];
				    			$(fieldId+"_na_button").on("click", function(e) { $('#'+this.id.replace('_na_button', '')).trigger( "focusin" ); $('#'+this.id.replace('_na_button', '')).val("***_N/A_***"); $('#'+this.id.replace('_na_button', '')).trigger( "focusout" ); });
				    			showHideOtherField(fieldId);
				    		}
				    	}
			    	}
					handleFormsHtml (intFormsetId, internalFormsets[l].emptyFormsetId.replace("__intp__", numOfFormsOfClass), internalFormsets[l].addFormBtnId.replace("__intp__", numOfFormsOfClass), internalFormsets[l].fieldNames, internalFormsets[l].addToId.replace("__intp__", numOfFormsOfClass), internalFormsets[l].internalFormsets, null, removeButtonVal=internalFormsets[l].removeButtonVal, displayRemoveAlways=internalFormsets[l].displayRemoveAlways);
				}
	    	}
	    }
	    
	    reactivateParsley();
		if (isFunction(callback))
			callback();
   	});
    // End of "Add more" on-click event handling
}


// Build the log table for annotators' actions
EmpiarAnnotationLogTable = function(){
	jQuery.extend( jQuery.fn.dataTableExt.oSort, {
	    "empiar-id-pre": function ( a ) {
	        var x1;

	 		x1 = parseInt(a);

	        return x1;
	    },
	 
	    "empiar-id-asc": function ( a, b ) {
	        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
	    },
	 
	    "empiar-id-desc": function ( a, b ) {
	        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
	    }
	} );

	$('#empiarTable1').dataTable({
		"bAutoWidth":false,
		"lengthMenu": [5, 25, 100],
		"pageLength": 5,
		"order": [[ 0, "desc" ]],
		"processing": true,
		"oLanguage": {
		        "sEmptyTable": "No log entries available",
		        "sLengthMenu": "Show _MENU_ log entries",
		        "sInfo": "Showing _START_ to _END_ of _TOTAL_ log entries",
				"sInfoEmpty":    "Showing 0 to 0 of 0 log entries",
				"sInfoFiltered": "(filtered from _MAX_ total log entries)",
		    },
		columnDefs: [
			{	
				type: 'empiar-id',
				width: '5%',
				targets: 0, 
			},
			{
				targets: 1,
				width: '12%',
			},
			{
				targets: 2,
				width: '8%',
			},
			{
				targets: 3,
				width: '5%',
			},
			{ 
				targets: 4,
				width: '70%',
			},
	     ]
	});
}


// Use the list of authors from the related EMDB entry to fill in forms in the EMPIAR deposition
copyAuthorsFromDB = function(db_entry_id) {
	var authors_from_db = new Array();
	
	$.ajax({
   	    type: "GET",
   	    cache: false,
        url: "get_authors_for_entry=" + db_entry_id,
        success: function(dataPy){
           		if (dataPy.indexOf("Entry does not exist") > -1)
           			alert("The specified EMDB entry does not exist");
           		else {
	           		authors_from_db = dataPy.split(', ');
	           		num_of_authors = authors_from_db.length;
	           		
	           		if (num_of_authors) {
	           			var numOfForms = $('#id_empiar_author_formset-TOTAL_FORMS').val();
	           			var i;
						$.each(authors_from_db, function( index, author ) {
							$('#empiar_author_formset_add_more').trigger("click");
							i = parseInt(numOfForms)+parseInt(index);
							author_surname = authors_from_db[index].substring(0, authors_from_db[index].lastIndexOf(' '));
							author_initials = authors_from_db[index].substring(authors_from_db[index].lastIndexOf(' ')+1, authors_from_db[index].length);
							$('#id_empiar_author_formset-'+i+'-name_0').val(author_surname);
							$('#id_empiar_author_formset-'+i+'-name_1').val(author_initials);
						});
						
						var first_visible_surname = $("[id*='id_empiar_author_formset-']").filter("[id*='-name_0']").filter(':visible')[0].value;
						var first_visible_initials = $("[id*='id_empiar_author_formset-']").filter("[id*='-name_1']").filter(':visible')[0].value;
						var first_visible_orcid = $("[id*='id_empiar_author_formset-']").filter("[id*='-author_orcid']").filter(':visible')[0].value;
						
		           		if ( !first_visible_surname && !first_visible_initials && (!first_visible_orcid || first_visible_orcid=='***_N/A_***' ) )
		           			$("[id*='remove_empiar_author_formset-']").filter("[id*='-name']").filter(':visible')[0].click();
		           		
		           		$("#dialog-db-copy").html("Successfully filled in the author data from the EMDB entry.");
			    	} else {
			    		$("#dialog-db-copy").html("No authors were found for the EMDB entry.");
			    	}

	           		$("#dialog-db-copy").dialog({
	           			resizable: false,
	           			classes: {
	           				"ui-dialog": "dialog-success"
	           			},
   	    		        modal: true,
   	    		        title: "Success",
   	    		        height: 200,
   	    		        width: 400,
   	    		        buttons: {
   	    		            "OK": function () {
	   	 		           			$(this).dialog('close');
	   	 	   		                return 0;
   	        					  }
   	        			}
	           		});

			    }
   		},
   		error: function(){
   			$("#dialog-db-copy").html("An error has occurred while filling in the author data from the EMDB entry. If this repeats, please contact our <a href=\"mailto:{{emdb_global.empiar_rt_email}}\" target=\"_top\">support</a>.");
   			$("#dialog-db-copy").dialog({
   		        resizable: false,
       			classes: {
       				"ui-dialog": "dialog-error"
       			},
   		        modal: true,
   		        title: "Error",
   		        height: 250,
   		        width: 400,
   		        buttons: {
   		            "OK": function () {
		           			$(this).dialog('close');
	   		                return 0;
       					  }
       			}
       		});
        },
   	});
}


// Fill in principal investigator's form in the EMPIAR deposition using the data from a registered EMPIAR user
prInvFillFromCorrAuth = function(i) {
	$('#id_empiar_principal_investigator_formset-'+i+'-author_orcid').val($('#id_empiar_corresponding_author_form-author_orcid').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-first_name').val($('#id_empiar_corresponding_author_form-first_name').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-middle_name').val($('#id_empiar_corresponding_author_form-middle_name').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-last_name').val($('#id_empiar_corresponding_author_form-last_name').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-organization').val($('#id_empiar_corresponding_author_form-organization').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-street').val($('#id_empiar_corresponding_author_form-street').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-town_or_city').val($('#id_empiar_corresponding_author_form-town_or_city').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-state_or_province').val($('#id_empiar_corresponding_author_form-state_or_province').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-country').val($('#id_empiar_corresponding_author_form-country').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-post_or_zip').val($('#id_empiar_corresponding_author_form-post_or_zip').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-email').val($('#id_empiar_corresponding_author_form-email').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-telephone').val($('#id_empiar_corresponding_author_form-telephone').val());
	$('#id_empiar_principal_investigator_formset-'+i+'-fax').val($('#id_empiar_corresponding_author_form-fax').val());
}


// Fill in citation information with DOI or PubMedId data that has been obtained from EuropePMC
// @param data: data that has been obtained from EuropePMC
// @param formClassId: the index of the form that will have its fields filled in
fillInCitation = function(data, formClassId){
	if (typeof data !== 'undefined' && data !== null) {
		
		if ( ('resultList' in data) && ('result' in data['resultList']) && (0 in data['resultList']['result']) ) {
			var result = data['resultList']['result'][0];

			if (typeof result !== 'undefined' && result !== null) {
				if ( ('firstPublicationDate' in result) && (typeof result['firstPublicationDate'] !== 'undefined' && result['firstPublicationDate'] !== null) ) {
					var firstPublicationDate = new Date(result['firstPublicationDate']);
					var todayDate = new Date();
					if (firstPublicationDate <= todayDate) {
						$('#id_empiar_citation_formset-'+formClassId+'-published_0').trigger("click");
					} else {
						$('#id_empiar_citation_formset-'+formClassId+'-published_1').trigger("click");
					}
					
					$('#id_empiar_citation_formset-'+formClassId+'-year').val(firstPublicationDate.getFullYear());
				}
				
				if ( ('doi' in result) && typeof result['doi'] !== 'undefined' && result['doi'] !== null ) {
					$('#id_empiar_citation_formset-'+formClassId+'-doi').val(result['doi']);
				}
				
				if ( ('pmid' in result) && typeof result['pmid'] !== 'undefined' && result['pmid'] !== null ) {
					$('#id_empiar_citation_formset-'+formClassId+'-pubmedid').val(result['pmid']);
				}				
				
				if ( ('title' in result) && typeof result['title'] !== 'undefined' && result['title'] !== null ) {
					if (result['title'][result['title'].length-1] === ".")
									result['title'] = result['title'].slice(0,-1);
					$('#id_empiar_citation_formset-'+formClassId+'-title').val(result['title']);
				}
				
				if ( ('journalInfo' in result) && (typeof result['journalInfo'] !== 'undefined' && result['journalInfo'] !== null) ) {
					$('#id_empiar_citation_formset-'+formClassId+'-j_or_nj_citation_0').trigger("click");
					var journalInfo = result['journalInfo'];
					
					if ( ('journal' in journalInfo) && (typeof journalInfo['journal'] !== 'undefined' && journalInfo['journal'] !== null) ) {
						var journal = journalInfo['journal'];
						
						if ( ('title' in journal) && (typeof journal['title'] !== 'undefined' && journal['title'] !== null) ) {
							$('#id_empiar_citation_formset-'+formClassId+'-journal').val(journal['title']);
						}
						
						if ( ('isoabbreviation' in journal) && (typeof journal['isoabbreviation'] !== 'undefined' && journal['isoabbreviation'] !== null) ) {
							$('#id_empiar_citation_formset-'+formClassId+'-journal_abbreviation').val(journal['isoabbreviation']);
						}
					}
					
					if ( ('issue' in journalInfo) && (typeof journalInfo['issue'] !== 'undefined' && journalInfo['issue'] !== null) ) {
						$('#id_empiar_citation_formset-'+formClassId+'-issue').val(journalInfo['issue']);
					}
					
					if ( ('volume' in journalInfo) && (typeof journalInfo['volume'] !== 'undefined' && journalInfo['volume'] !== null) ) {
						$('#id_empiar_citation_formset-'+formClassId+'-volume').val(journalInfo['volume']);
					}
				} else {
					$('#id_empiar_citation_formset-'+formClassId+'-j_or_nj_citation_1').trigger("click");
					
					if ( ('bookOrReportDetails' in result) && (typeof result['bookOrReportDetails'] !== 'undefined' && result['bookOrReportDetails'] !== null) ) {
						var bookOrReportDetails = result['bookOrReportDetails'];
						
						if ( ('publisher' in bookOrReportDetails) && (typeof bookOrReportDetails['publisher'] !== 'undefined' && bookOrReportDetails['publisher'] !== null) ) {
							$('#id_empiar_citation_formset-'+formClassId+'-publisher').val(bookOrReportDetails['publisher']);
						}
					}
				}
				
				if ( ('pageInfo' in result) && (typeof result['pageInfo'] !== 'undefined' && result['pageInfo'] !== null) ) {
					var pages = result['pageInfo'].split("-");
					
					if (0 in pages)
						$('#id_empiar_citation_formset-'+formClassId+'-first_page').val(pages[0]);
						
					if (1 in pages)
						$('#id_empiar_citation_formset-'+formClassId+'-last_page').val(pages[1]);
				}
				
				if ( ('language' in result) && (typeof result['language'] !== 'undefined' && result['language'] !== null) ) {
					if (result['language'] == "eng")
						result['language'] = "English";
					
					$('#id_empiar_citation_formset-'+formClassId+'-language').val(result['language']);
				}
				
				if ( ('authorList' in result) && (typeof result['authorList'] !== 'undefined' && result['authorList'] !== null) ) {
					if ( ('author' in result['authorList']) && (typeof result['authorList']['author'] !== 'undefined' && result['authorList']['author'] !== null) ) {
						var authors = result['authorList']['author'];

						var visibleAuthors = $('.empiar_cit_author_formset_form-'+formClassId+'>table>tbody>tr>td>span>input').filter("[id*='-name_0']").filter(':visible');

						numOfAuthors = authors.length;
						
						var diffVisibleNeededAuthors = authors.length - visibleAuthors.length;
						
		           		if (numOfAuthors) {
		           			var numOfForms = $('#id_empiar_cit_author_formset-TOTAL_FORMS').val();
		           			
		           			var first_visible_surname = $('.empiar_cit_author_formset_form-'+formClassId+'>table>tbody>tr>td>span>input').filter("[id*='-name_0']").filter(':visible')[0].value;
							var first_visible_initials = $('.empiar_cit_author_formset_form-'+formClassId+'>table>tbody>tr>td>span>input').filter("[id*='-name_0']").filter(':visible')[0].value;
							var first_visible_orcid = $('.empiar_cit_author_formset_form-'+formClassId+'>table>tbody>tr>td>span>input').filter("[id*='-author_orcid']").filter(':visible')[0].value;
		           			var first_remove_button_id = $('.empiar_cit_author_formset_form-'+formClassId+'>table>tbody>tr>td>span>input').filter("[id*='-name_0']").filter(':visible')[0].id.replace('id_empiar','remove_empiar').replace('-name_0', '-name')

		           			var i;
							$.each(authors, function( index ) {
								var author = authors[index];
								$('#empiar_cit_author_formset_add_more-'+formClassId).trigger("click");
								i = parseInt(numOfForms)+parseInt(index);
								var author_surname = author['lastName'];
								var author_initials = author['initials'];
								
								if ( ('authorId' in author) && (typeof author['authorId'] !== 'undefined' && author['authorId'] !== null) ) {
									if ( ('type' in author['authorId']) && (typeof author['authorId']['type'] !== 'undefined' && author['authorId']['type'] !== null) ) {
											var author_orcid = author['authorId']['value'];
											$('#id_empiar_cit_author_formset-'+i+'-author_orcid').val(author_orcid);
										}
								}
								
								$('#id_empiar_cit_author_formset-'+i+'-name_0').val(author_surname);
								$('#id_empiar_cit_author_formset-'+i+'-name_1').val(author_initials);
							});
							/*
							var first_visible_surname = $("[id*='id_empiar_cit_author_formset-']").filter("[id*='-name_0']").filter(':visible')[0].value;
							var first_visible_initials = $("[id*='id_empiar_cit_author_formset-']").filter("[id*='-name_1']").filter(':visible')[0].value;
							var first_visible_orcid = $("[id*='id_empiar_cit_author_formset-']").filter("[id*='-author_orcid']").filter(':visible')[0].value;
							*/
			           		if ( !first_visible_surname && !first_visible_initials && (!first_visible_orcid || first_visible_orcid=='***_N/A_***' ) )
			           			$('#'+first_remove_button_id).click();
				    	}
						
					}
				}
				// End of filling in authors
				
			}
		}
		
	}
}

window.Parsley.addValidator('na_button', {
	validate: function(value, requirement, instance) {
		// Editor ORCID is exempt to empty validation, unless the rest of the fields have been filled in
		var element_name;
		element_name = instance.element.id.replace(/id_empiar_cit_editor_formset-\d+-/g, '');

		return ( (value !== '') || (value === '***_N/A_***') || (element_name === 'author_orcid') );
	},
	messages: {
		en: 'This field is required. If the information is not available, then, please, press the N/A button.',
	},
	priority: 9001,
});

calculateOrcidChecksum = function(value){
	var total, remainder, result;

	value = value.replace(/-/g,"");
	total = 0;
    for (var i = 0; i < value.length-1; i++) {
        var digit = parseInt(value.charAt(i));
        total = (total + digit) * 2;
	}

    remainder = total % 11;
    result = (12 - remainder) % 11;
    if (result == 10)
    	return "X";
    else
    	return result.toString();
}
