function require(jspath) {
    document.write('<script type="text/javascript" src="'+jspath+'"><\/script>');
}
function require_css(csspath) {
    document.write('<link rel="stylesheet" type="text/css" src="'+csspath+'"><\/script>');
}

//require("http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");
//require("inc/highcharts/highcharts.js");
//require("inc/highcharts/modules/exporting.js");



var chart_menu_items = [ { text: "General"},
                         { text: "Map releases", value: "statistics_releases.html"},
			 { text: "Map size statistics for released maps", value: "statistics_map_size.html"},
			 { text: "Distribution of maps released based on EM technique used", value: "statistics_emmethod.html"},
			 { text: "Trends and distribution of microscope usage for released maps", value: "statistics_microscope.html"},
			 { text: "Trends and distribution of software package usage for released maps", value: "statistics_software.html"},
			 { text: "Molecular weight statistics of single-particle released maps", value: "statistics_mol_wt.html"},
			 { text: "Sample taxonomy statistics for released maps", value: "statistics_species.html"},
			 { text: "Resolution"},
			 { text: "Trend of highest resolutions achieved annually for released maps", value: "statistics_min_res.html"},
			 { text: "Number of released maps achieving given resolution levels", value: "statistics_num_res.html"},
			 { text: "Single-particle released maps -  resolution trends", value: "statistics_sp_res.html"},
                         { text: "Single-particle released maps - resolution versus acceleration voltage and source type", value: "statistics_volt_source.html" },
			 { text: "Single-particle released maps - resolution versus microscope type and software package used", value: "statistics_mic_soft.html" },
			 { text: "Single-particle released maps - resolution versus number of projections", value: "statistics_nproj_res.html" },
			 { text: "Tomography - resolution trends for released maps", value: "statistics_tom_res.html"},
			 { text: "Publications"},
			 { text: "Trend for publications associated with released maps", value: "statistics_pub.html"},
			 { text: "Journal distribution of articles associated with released maps", value: "statistics_journal.html"},
			 { text: "Publication trends and distribution for different microscope types", value: "statistics_mic_pub.html"},
			 { text: "Publication trends and distribution for different software packages", value: "statistics_soft_pub.html"},
			 { text: "FTP downloads"},
			 { text: "Monthly FTP downloads", value: "ftp_monthly_stat"},
			 { text: "Top 10 FTP downloads", value: "ftp_top_stat"},
			 //{ text: "Depositions and annotations"},
			 //{ text: "Deposition and annotation statistics", value: "depo_stats"},
			 
			 { text: "EMPIAR"},
             { text: "Entry releases", value: "statistics_empiar_entry_releases.html"},
             { text: "Entry size statistics for released entries", value: "statistics_empiar_entry_size.html"},
             { text: "Yearly data storage", value: "statistics_empiar_yearly_size.html"},
             { text: "Storage per method", value: "empiar_storage_used_stat"},
             { text: "Number of EMPIAR file transfers", value: "empiar_aspera_ftp_monthly_stat"},
             { text: "Volume of EMPIAR transfers", value: "empiar_aspera_ftp_monthly_size_stat"},
             { text: "Number of users", value: "empiar_aspera_ftp_monthly_user_stat"},
             { text: "Number of files per deposited entry", value: "empiar_num_fpe_stat"},
             ];
  
function get_chart_title() {
	// Get page url without the query parameters
	var path;
	if (window.location.pathname.charAt(window.location.pathname.length-1) == '/') {
		path = window.location.pathname.slice(0,-1);
	}
	else {
		path = window.location.pathname;
	}
	var index = path.lastIndexOf("/");
	var filename = path.substring(index+1);
	var found = false;
	index = -1;
	for(var i = 0; i < chart_menu_items.length; i++) {
		if(chart_menu_items[i]['value'] == filename) {
			document.write(chart_menu_items[i]['text']);
			found = true;
			break;
		}
	}
	if (found == false) document.write('Title not found for page: ' + filename);
}

function set_chart_menu(chartmenu, url_root, selected_option) {
	if( typeof selected_option == 'undefined') {
		// Get page url without the query parameters
		var path;
		if (window.location.pathname.charAt(window.location.pathname.length-1) == '/') {
			path = window.location.pathname.slice(0,-1);
		}
		else {
			path = window.location.pathname;
		}

		var index = path.lastIndexOf("/");
		var filename = path.substring(index+1);
		var found = false;
		index = -1;
		for(var i = 0; i < chart_menu_items.length; i++) {
			if(chart_menu_items[i]['value'] == filename) {
				selected_option = i;
				found = true;
				break;
			}
		}
		if (found == false) return;
	}
	document.write("<table><tr>");
	document.write("<td>Select another chart:&nbsp;</td>");
	document.write("<td><select id='" + chartmenu + "' ></select></td>");
	document.write("</tr></table><br/>");
	$(document).ready(function() {
		menutag = '#' + chartmenu;
		$(menutag).html("");
		menugroup = false;
		for (var i=0; i<chart_menu_items.length; i++) {
			if (typeof chart_menu_items[i].value == 'undefined') {
				$("<optgroup label='" + chart_menu_items[i].text + "' >").appendTo(menutag);
				menugroup = true;
			}
			else {
				var opt_text = "<option " + ((i == selected_option)?"selected ":"") + "value='" + url_root + chart_menu_items[i].value + "'>" + chart_menu_items[i].text + "</option>";
				if(menugroup == false) {
					$(opt_text).appendTo(menutag);
				}
				else {
					$(opt_text).appendTo(menutag + " optgroup:last");
				}
			}

		}
		$(menutag).change(function () {
			window.location = this.options[this.selectedIndex].value;
		});

	})
};

function display_chart_list(chartmenu, url_root) {
    document.write("<div id='" + chartmenu + "' ></div>");
    $(document).ready(function() {
	    menutag = '#' + chartmenu;
	    $(menutag).html("");
	    menugroup = false;
            for (var i=0; i<chart_menu_items.length; i++) {
		if (typeof chart_menu_items[i].value == 'undefined') {
                    $("<br/>").appendTo(menutag);
		    $("<h3>" + chart_menu_items[i].text + "</h3>").appendTo(menutag);
		    $("<ol>").appendTo(menutag);
                    menugroup = true;
		}
                else {
		    var opt_text = "<li><a href='" + url_root + chart_menu_items[i].value + "'>" + chart_menu_items[i].text + "</a></li>";
		    if(menugroup == false) {
			$(opt_text).appendTo(menutag);
		    }
		    else {
			$(opt_text).appendTo(menutag + " ol:last");
		    }
		}

	    }
	    $(menutag).change(function () {
		    window.location = this.options[this.selectedIndex].value;
		});
		
	})
};

// Array of help tooltip texts
var help_tooltip_texts =  new Array();

// Useful for combinations of line and pie charts
help_tooltip_texts[0] = "Click on any data point in a graph (or pie on a pie chart) to get a list of corresponding EMDB entries. Zoom into a region in a graph by dragging the mouse pointer over the region while holding the left mouse button down. Data series can be toggled on/off by clicking the corresponding label in the legend.";

// Only pie charts
help_tooltip_texts[1] = "Click on any slice of the pie to get a list of corresponding EMDB entries.";

// Only column charts
help_tooltip_texts[2] = "Click on any column to get a list of corresponding EMDB entries. Data series can be toggled on/off by clicking the corresponding label in the legend.";

// Column and pie chart
help_tooltip_texts[3] = "Click on any column of the column chart or any slice of the pie chart to get a list of corresponding EMDB entries. Data series can be toggled on/off by clicking the corresponding label in the legend.";

// Line chart and column chart
help_tooltip_texts[4] = "Click on any data point in a graph (or column on a column chart) to get a list of corresponding EMDB entries. Zoom into a region in a graph by dragging the mouse pointer over the region while holding the left mouse button down. Data series can be toggled on/off by clicking the corresponding label in the legend.";

// FTP download stats
help_tooltip_texts[5] = "Use the form below to specify search options, then press the Search button. The FTP statistics are displayed below as charts or as tables. The graphs are interactive - the viewing area can be zoomed and curves can be toggled.";

// EMPIAR for charts
help_tooltip_texts[6] = "Zoom into a region in a graph by dragging the mouse pointer over the region while holding the left mouse button down. Data series can be toggled on/off by clicking the corresponding label in the legend.";

// EMPIAR transfer stats
help_tooltip_texts[7] = "Use the form below to specify search options, then press the Search button. The EMPIAR transfer statistics are displayed below as charts or as tables. The graphs are interactive - the viewing area can be zoomed and curves can be toggled.";

// Function for adding the help button to the page
function add_help_button(helpID, helpButtonImage) {
    document.write('<img id="' + helpID + '" src="' + helpButtonImage + '" alt="help" style="cursor:help;position:relative; left: 2em"/>');
}
// Tooltip for help buttons on statistics pages
function set_help_tooltip(helpID, helpText) {
    var h = Math.round(( helpText.length / 30 ) + 1); 
    var tooltip = new YAHOO.widget.Tooltip("tooltip_" + helpID, {
	    context: helpID,
	    width: '30em',
	    height: h.toString() + "em",
	    showdelay: 300,
	    zIndex: 3,
	    text: helpText
	});
    return tooltip;
};
