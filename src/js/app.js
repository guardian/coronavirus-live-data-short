import template from '../templates/template.html'
import Ractive from 'ractive'
import * as d3 from "d3"

function init(country, confirmed, confirmed_daily, deaths, recovered, aus) {

	console.log(confirmed)
	console.log(confirmed_daily)
	console.log(deaths)
	console.log(recovered)
	console.log(aus)

	var data = {
		"Australia":{},
		"United Kingdom":{},
		"US":{},
		"Total":{}
	};


	function numberFormat(num) {
        if ( num > 0 ) {
            if ( num > 1000000000 ) { return ( num / 1000000000 ) + 'bn' }
            if ( num > 1000000 ) { return ( num / 1000000 ) + 'm' }
            if ( num > 1000 ) { return ( num / 1000 ) + 'k' }
            if (num % 1 != 0) { return num.toFixed(2) }
            else { return num.toLocaleString() }
        }
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return [ "-" + String(( posNum / 1000000000 )) + 'bn'];
            if ( posNum > 1000000 ) return ["-" + String(( posNum / 1000000 )) + 'm'];
            if ( posNum > 1000 ) return ["-" + String(( posNum / 1000 )) + 'k'];
            else { return num.toLocaleString() }
        }
        return num;
    }

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var format = d3.format(",")

	// Country stuff, check if manual total higher than automated total

	var ausManualConfirmed = parseInt(aus.sheets['latest totals'][8]['Confirmed cases (cumulative)'])
	var ausManualDeaths = parseInt(aus.sheets['latest totals'][8]['Deaths'])
	var ausAutoConfirmed = confirmed[confirmed.length-1]['Australia']
	var ausAutoDeaths = deaths[deaths.length-1]['Australia']

	var timeFormat = d3.timeFormat('%Y-%m-%d')
	var timeParse = d3.timeParse('%d/%m/%Y')
	var ausManualTimestamp = aus.sheets['latest totals'][8]['Last updated']
	var autoTimestamp = confirmed[confirmed.length-1]['index']

	var ausFinalDeaths,ausFinalConfirmed
	console.log(ausManualConfirmed,ausAutoConfirmed)

	if (ausManualConfirmed >= ausAutoConfirmed) {
		ausFinalConfirmed = ausManualConfirmed
	}

	else {
		ausFinalConfirmed = ausAutoConfirmed
	}

	if (ausManualDeaths >= ausAutoDeaths) {
		ausFinalDeaths = ausManualDeaths
	}

	else {
		ausFinalDeaths = ausAutoDeaths
	}

	data["Australia"]['confirmed'] = format(ausFinalConfirmed)
	data["Australia"]['deaths'] = format(ausFinalDeaths)
	data["Australia"]['recovered'] = format(recovered[recovered.length-1]['Australia'])

	data["United Kingdom"]['confirmed'] = format(confirmed[confirmed.length-1]['United Kingdom'])
	data["United Kingdom"]['deaths'] = format(deaths[deaths.length-1]['United Kingdom'])
	data["United Kingdom"]['recovered'] = format(recovered[recovered.length-1]['United Kingdom'])

	data["US"]['confirmed'] = format(confirmed[confirmed.length-1]['US'])
	data["US"]['deaths'] = format(deaths[deaths.length-1]['US'])
	data["US"]['recovered'] = format(recovered[recovered.length-1]['US'])

	data["Total"]['confirmed'] = format(confirmed[confirmed.length-1]['Total'])
	data["Total"]['deaths'] = format(deaths[deaths.length-1]['Total'])
	data["Total"]['recovered'] = format(recovered[recovered.length-1]['Total'])


	console.log(data);

	var ractive = new Ractive({
			target: "#outer-wrapper",
			template: template,
			data: { 
					location:data["Total"],
					ausManualTimestamp:ausManualTimestamp,
					autoTimestamp:autoTimestamp
				}
		});


	ractive.on({
		world: function ( event ) {
			ractive.set('location', data["Total"])
			country = 'Total'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".world").classed("btn-selected", true);
			drawChart(confirmed_daily, country);
		},
		us: function ( event ) {
			console.log("us")
			ractive.set('location', data["US"])
			country = 'US'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".us").classed("btn-selected", true);
			drawChart(confirmed_daily, country);
		},
		uk: function ( event ) {
			console.log("uk")
			ractive.set('location', data["United Kingdom"])
			country = 'United Kingdom'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".uk").classed("btn-selected", true);
			drawChart(confirmed_daily, country);
		},
		aus: function ( event ) {
			console.log("aus")
			ractive.set('location', data["Australia"])
			country = 'Australia'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".aus").classed("btn-selected", true);
			drawChart(confirmed_daily, country);
		}
	});

	// ractive.set('data', self.pagerank);

	function drawChart(data, country) {

		// var yFormat = d3.format(".2s")
		var width = document.querySelector("#barChart").getBoundingClientRect().width
		var height = 200			
		var margin
		var dateParse = d3.timeParse('%Y-%m-%d');

		margin = {top: 0, right: 10, bottom: 20, left:40}
		width = width - margin.left - margin.right,
    	height = height - margin.top - margin.bottom

    	d3.select("#barChart svg").remove();

    	var barChart = d3.select("#barChart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "barChartSvg")
				.attr("overflow", "hidden")					

		var features = barChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		data.forEach(function(d) {
			if (typeof d[country] == 'string') {
				d[country] = +d[country];
			}
		
			if (typeof d.index == 'string') {
				d.index = dateParse(d.index);
			}
			

		})

		// var keys = Object.keys(data[0])
		// keys.splice(0, 1);
		var x = d3.scaleBand().range([0, width]).paddingInner(0.08);
    	var y = d3.scaleLinear().range([height, 0]);

		
		x.domain(data.map(function(d) { return d.index; }))

		y.domain(d3.extent(data, function(d) { return d[country]; }))
		

		var xAxis;
		var yAxis;

		var ticks = x.domain().filter(function(d,i){ return !(i%10); } );

		if (isMobile) {
			ticks = x.domain().filter(function(d,i){ return !(i%20); } );
		}	

		if (isMobile) {
			xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %d"))
			yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)}).ticks(5).tickSize(-width)
		}

		else {
			xAxis = d3.axisBottom(x).tickValues(ticks).tickFormat(d3.timeFormat("%b %d"))
			yAxis = d3.axisLeft(y).tickFormat(function (d) { return numberFormat(d)}).ticks(5).tickSize(-width)
		}

		// function make_y_gridlines() {		
		//     return d3.axisLeft(y)
		//         .ticks(5)
		// }

		features.append("g")
				.attr("class","x")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

		features.append("g")
			.attr("class","y grid")
			.call(yAxis)

		features.selectAll(".bar")
	    	.data(data)
			    .enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.index) })
				.style("fill", function(d) {
						return "rgb(204, 10, 17)"
				})
				.attr("y", function(d) { 
					return y(Math.max(d[country], 0))
					// return y(d[keys[0]]) 
				})
				.attr("width", x.bandwidth())
				.attr("height", function(d) { 
					return Math.abs(y(d[country]) - y(0))
				});

	}

	drawChart(confirmed_daily, country);

	var to=null
	var lastWidth = document.querySelector("#barChart").getBoundingClientRect()

	window.addEventListener('resize', function() {
		var thisWidth = document.querySelector("#barChart").getBoundingClientRect()
		if (lastWidth != thisWidth) {
			window.clearTimeout(to);
			to = window.setTimeout(function() {
				    drawChart(confirmed_daily, country);
				}, 100)
		}
	
	})

};

// Promise.all([
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_daily.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/deaths.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/recovered.json'),
// 	d3.json('https://interactive.guim.co.uk/docsdata/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json')
// ])
// .then((results) =>  {
// 	init('Total', results[0], results[1], results[2], results[3], results[4])
// })


Promise.all([
	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_preview.json'),
	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_daily_preview.json'),
	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/deaths_preview.json'),
	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/recovered_preview.json'),
	d3.json('https://interactive.guim.co.uk/docsdata/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json')
])
.then((results) =>  {
	init('Total', results[0], results[1], results[2], results[3], results[4])
})

// Promise.all([
// 	d3.json('<%= path %>/assets/confirmed.json'),
// 	d3.json('<%= path %>/assets/deaths.json'),
// 	d3.json('<%= path %>/assets/recovered.json'),
// 	d3.json('<%= path %>/assets/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json')
// ])
// .then((results) =>  {
// 	init('Total', results[0], results[1], results[2], results[3])
// })
