function setDatePicker(startdate, maxDate) {
    $("#fromdate").datepicker({
        /*showOn: 'button',
        buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        buttonImageOnly: true,*/
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'M yy',
        minDate: startdate,
        maxDate: maxDate,
        beforeShow: function (selectedDate) {
            if (!selectedDate.value) {
                $("#fromdate").datepicker("option", "defaultDate", startdate);
            } else {
                $("#fromdate").datepicker("option", "defaultDate", new Date("1 " + selectedDate.value));
            }
        },
        onClose: function (dateText, inst) {
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            /* I haven't been able to set the minDate because of the dateFormat
            mydatestring = ("0" + (parseInt(month) + 1)).slice(-2) + "/01/" + year;
            $("#todate").datepicker("option", "minDate", mydatestring);*/
            $(this).datepicker('setDate', new Date(year, month, 1));
            $("#mainform").submit();
        }
    });
    $("#todate").datepicker({
        /*showOn: 'button',
        buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        buttonImageOnly: true,*/
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'M yy',
        minDate: startdate,
        maxDate: maxDate,
        beforeShow: function (selectedDate) {
            if (!selectedDate.value) {
                $("#todate").datepicker("option", "defaultDate", startdate);
            } else {
                $("#todate").datepicker("option", "defaultDate", new Date("1 " + selectedDate.value));
            }
        },
        onClose: function (selectedDate) {
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            mydatestring = ("0" + (parseInt(month) + 1)).slice(-2) + "/01/" + year;
            /* I haven't been able to set the maxDate because of the dateFormat
            mydatestring = ("0" + (parseInt(month) + 1)).slice(-2) + "/01/" + year;
            $("#fromdate").datepicker("option", "maxDate", mydatestring);*/
            $(this).datepicker('setDate', new Date(year, month, 1));
            $("#mainform").submit();
        }
    });
}
