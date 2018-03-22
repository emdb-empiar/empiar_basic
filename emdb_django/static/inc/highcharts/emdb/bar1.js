
function bar1(json_url, container, display) {
    var chart;
    var json;

    $(document).ready(function() {
    

    
	    request = jQuery.getJSON(json_url,function(json) {

		    var options = {
			chart: {
			    renderTo: container,
			    defaultSeriesType: 'bar'
			    //zoomType: 'xy'
			},
			credits: {
			    enabled: false
			},
			exporting: {
			    enabled: true
			},
			tooltip: {
			    formatter: function() {
				return this.x + "," + this.y;
			    }
			},
			xAxis: {
			    labels: {
				formatter: function() {
				    return this.value; // clean, unformatted number for year
				}
			    }   
			},
			yAxis: {},
			series: [],
			legend: {},
			plotOptions: {
			   
			    bar: {
				cursor: 'pointer',
				dataLabels: {
				    enabled: false,                                   				    
				},
				events: {
				    click: function(event) {
                                        if (event.point.subquery != "") {
                                            if (typeof display == 'undefined') {
						window.location = event.point.subquery;
					    }
					    else if (display == "none") {
						// do nothing
					    }
					    else {
						$('#' + display).load(event.point.subquery);	
					    }
					}
					else {
					    alert("Subqueries not implemented");
					}
				    }
				}
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