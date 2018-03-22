// conf = {
//         json_url: full path to stats query json
//         search_path: path to search json
//         emsearch_path: path prefix to emsearch directory
//         container: div in which to display chart
//         subquery_container: container for subquery
//         title: div in which to display subquery title
//         show_subquery: boolean - if true process subquery 
//         }
function column_chart(conf) {
    var chart,
    json,
    searchVar = {};

    $(document).ready(function() {
    

    
	    request = jQuery.getJSON(conf.json_url,function(json) {

		    var options = {
			chart: {
			    renderTo: conf.container,
			    defaultSeriesType: 'column'
			    // zoomType: 'xy'
			},
			credits: {
			    enabled: false
			},
			exporting: {
			    enabled: true
			},
			tooltip: {
			    formatter: function() {
				y = this.y;
				if(typeof json.TooltipYDecPlaces == 'number') {
				    y = y.toFixed(json.TooltipYDecPlaces);
				}
				if(typeof json.TooltipYPrecision == 'number') {
				    y = y.toPrecision(json.TooltipYPrecision);
				}
				s = '<b>' + this.x + ':</b><br/>' + y;
				if(typeof json.TooltipSuffix != 'undefined') {
				    s += json.TooltipSuffix;
				}
				return s;
			    }
			},
			xAxis: {
			    labels: {
				formatter: function() {
				    var s = this.value;
				    if (typeof s === 'string') {
					if (s.length >25) {
					    s = s.substring(0,25);
					}
				    }
				    return s; // clean, unformatted number for year
				}
			    }   
			},
			yAxis: {},
			series: [],
			legend: {},
			plotOptions: {
			   
			    column: {
				cursor: 'pointer',
				dataLabels: {
				    enabled: false,                                   				    
				},
				events: {
				    click: function(event) {
if (event.point.subquery !== '' && conf.show_subquery === true) {
					    $('#' + conf.subquery_container).show();
					    if (typeof searchResultsTable !== 'undefined') {
						delete searchResultsTable;
					    }

					    // Set title
					    if (typeof conf.title !== 'undefined') {
						$('#' + conf.title).html(event.point.subquery.text);
					    }
					    searchVar = args2SearchVar(urlArgs(event.point.subquery.query));
					    searchResultsTable = new YAHOO.EMDB.SearchResultsTable({searchURL: conf.search_path, 
												    queryString: "q=" + searchVar.query,  
												    emsearchLibDir: conf.emsearch_path,
												    configURL: conf.emsearch_path + "/configSearch.json",
											        searchFilter: searchVar.searchColumns,
												    numPerPage: searchVar.numPerPage,
												    sortOrder: searchVar.sortOrder});      
					    
					}
				    }
				},
			    }
			}
		    }

		    // Chart options
		    if(typeof json.ChartTitle != 'undefined') { 
			options['title'] =  {
			    text: json.ChartTitle
			}
		    }
		    if(typeof json.ChartSubTitle != 'undefined') { 
			options['subtitle'] =  {
			    text: json.ChartSubTitle
			}
		    }

		    // X axis options
		    if(typeof json.XaxisTitle != 'undefined') {
			options['xAxis']['title'] = {
			    text: json.XaxisTitle
			};
			if(typeof json.XaxisTitleMargin != 'undefined') {
			    options['xAxis']['title']['margin'] = json.XaxisTitleMargin;
			}
		    }
		    if(typeof json.CategoryNames != 'undefined') {
			options['xAxis']['categories'] = json.CategoryNames;
		    }
		    if(typeof json.XaxisMin != 'undefined') { 
			options['xAxis']['min'] = json.XaxisMin;
		    }
		    if(typeof json.XaxisMax != 'undefined') { 
			options['xAxis']['max'] = json.XaxisMax;
		    }
		    if(typeof json.XaxisTickInterval != 'undefined') { 
			options['xAxis']['tickInterval'] = json.XaxisTickInterval;
		    }
		    if(typeof json.XaxisLabelRotation == 'number') { 
			options['xAxis']['labels']['rotation'] = json.XaxisLabelRotation;
                        if(json.XaxisLabelRotation < -5) {
			    options['xAxis']['labels']['align'] = 'right';
			}
			else {
			    options['xAxis']['labels']['align'] = 'center';
			}
		    }

		    // Y axis options
		    if(typeof json.YaxisTitle != 'undefined') { 
			options['yAxis']['title'] = {
			    text: json.YaxisTitle
			};
			if(typeof json.YaxisTitleMargin != 'undefined') {
			    options['yAxis']['title']['margin'] = json.YaxisTitleMargin;
			}
		    }
		    if(typeof json.YaxisMin != 'undefined') { 
			options['yAxis']['min'] = json.YaxisMin; 
		    }
		    if(typeof json.YaxisMax != 'undefined') { 
			options['yAxis']['max'] = json.YaxisMax;
		    }
		    if(typeof json.ShowPlotLines != 'undefined') { 
			if(json.ShowPlotLines == true) {
			    options['yAxis']['plotLines'] = [{
				    value: 0,
				    width: 1,
				    color: '#808080'
				}];

			}
		    }

		    // Legend
		    if(typeof json.ShowLegend != 'undefined') { 
			if(json.ShowLegend == true) {
			    options['legend'] = { 
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				borderWidth: 0
			    }
			    if(typeof json.LegendHorizontal != 'undefined' && json.LegendHorizontal == true) {
				options['legend']['layout'] = 'horizontal';
				options['legend']['align'] = 'center';
				options['legend']['verticalAlign'] = 'bottom';
                                if(typeof json.LegendItemWidth == 'number') {
				    options['legend']['itemWidth'] = json.LegendItemWidth;
				}
			    }
			    if(typeof json.LegendX == "number") {
				options['legend']['x'] = json.LegendX;
			    }
			    if(typeof json.LegendY == "number") {
				options['legend']['y'] = json.LegendY;
			    }

			}
                        else {
			    options['legend'] = { 
				enabled: false				 
			    }
			}
		    }

		    // Series
		    for(i=0; i < json.Series.length; i++) {
			options['series'][i] = {};
			if(typeof json.Series[i].name == 'string') {
			    options['series'][i]['name'] = json.Series[i].name;
			}
			if(typeof json.Series[i].data != 'undefined') {
                            // data is an associative array of the following pairs:
			    // { {'y': number, 'subquery': 'string'}} 
                            // or: { {'x': number, 'y': number, 'subquery': 'string'}}
			    options['series'][i]['data'] = json.Series[i].data;
			}
		    }


   
		    chart = new Highcharts.Chart(options);
		});
    
    
	});

    return chart;
           
}