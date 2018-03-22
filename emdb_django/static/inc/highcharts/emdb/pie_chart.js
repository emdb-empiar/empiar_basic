// conf = {
//         json_url: full path to stats query json
//         search_path: path to search json
//         emsearch_path: path prefix to emsearch directory
//         container: div in which to display chart
//         title: div in which to display subquery title
//         show_subquery: boolean - if true process subquery 
//         }
function pie_chart(conf) {
    var chart,
    json,
    searchVar = {};

    $(document).ready(function() {
    
    
	    request = jQuery.getJSON(conf.json_url,function(data) {
		    json = data;
                        
		    var array = new Array(json.CategoryValues.length);                       

		    for (i = 0; i < json.CategoryValues.length; i++){
			array[i] = { name: json.CategoryNames[i], y: json.CategoryValues[i], y_norm: json.CategoryValues[i] *100 / json.CategoryValuesSum, subquery: json.CategorySubqueries[i] } 
		    };

		    var options = {
			chart: {
			    renderTo: conf.container,
			    plotBackgroundColor: null,
			    plotBorderWidth: null,
			    plotShadow: false
			},
			credits: {
			    enabled: false
			},
			tooltip: {
			    formatter: function() {
				var y = this.y;
				if(typeof json.TooltipYDecPlaces == 'number') {
				    y = y.toFixed(json.TooltipYDecPlaces);
				}
				s = '<b>' + this.point.name + ':</b><br/>' + y;
				if(typeof json.TooltipSuffix != 'undefined') {
				    s += json.TooltipSuffix;
				}
				return s;			
			    }
			},
			plotOptions: {
			   
			    pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
				    enabled: true,                                   
				    formatter: function() {
					return '<b>'+ this.point.name +'</b>: '+ (this.point.y_norm).toFixed(0) + '%';
				    } 
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
			},
			series: [{
				type: 'pie',
				name: json.SeriesName,
                                data: array
			    }] 
		    }

		    if(typeof json.ChartTitle != 'undefined') { 
			options['title'] =  {
			    text: json.ChartTitle
			}
		    }
   
		    chart = new Highcharts.Chart(options);
		});
    
    
	});

    return chart;
           
}