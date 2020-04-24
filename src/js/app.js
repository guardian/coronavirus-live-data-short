import template from '../templates/template.html'
import Ractive from 'ractive'
import * as d3 from "d3"

function init(country, confirmed_daily, aus, overrides, latest, aus_daily) {

	// console.log(confirmed)
	// console.log(confirmed_daily)
	// console.log(deaths)
	// console.log(recovered)
	
	console.log(latest);

	const aus_latest = latest.filter(d => d.Country_Region == "Australia")[0]['Confirmed']

	console.log(aus_latest)
	var data = {
		"Australia":{"name":"Australia"},
		"United Kingdom":{"name":"United Kingdom"},
		"US":{"name":"US"},
		"Total":{"name":"World"}
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

	function niceNumber(num) {
		return parseInt(num.replace(/,/g, ""))
	}

	// Country stuff, check if manual total higher than automated total

	var ausManualConfirmed = parseInt(aus.sheets['latest totals'][8]['Confirmed cases (cumulative)'])
	var ausManualDeaths = parseInt(aus.sheets['latest totals'][8]['Deaths'])
	var ausManualRecovered = parseInt(aus.sheets['latest totals'][8]['Recovered'])
	var ausManualActive = parseInt(aus.sheets['latest totals'][8]['Active cases'])

	var ausManualConfirmed2 = parseInt(overrides.sheets['Sheet1'][3]['Cases'])
	var ausManualDeaths2 = parseInt(overrides.sheets['Sheet1'][3]['Deaths'])
	var ausManualRecovered2 = parseInt(overrides.sheets['Sheet1'][3]['Recovered'])
		


	// var ausAutoConfirmed = latest.filter(d => d.Country_Region == "Australia")[0]['Confirmed']
	// var ausAutoDeaths = latest.filter(d => d.Country_Region == "Australia")[0]['Deaths']

	var totalManualConfirmed = niceNumber(overrides.sheets['Sheet1'][0]['Cases'])
	var totalManualDeaths = niceNumber(overrides.sheets['Sheet1'][0]['Deaths'])
	// var totalManualRecovered = niceNumber(overrides.sheets['Sheet1'][0]['Recovered'])

	var totalAutoConfirmed = latest.filter(d => d.Country_Region == "Total")[0]['Confirmed']
	var totalAutoDeaths = latest.filter(d => d.Country_Region == "Total")[0]['Deaths']
	// var totalAutoRecovered = latest.filter(d => d.Country_Region == "Total")[0]['Recovered']

	var usManualConfirmed = niceNumber(overrides.sheets['Sheet1'][1]['Cases'])
	var usManualDeaths = niceNumber(overrides.sheets['Sheet1'][1]['Deaths'])
	// var usManualRecovered = niceNumber(overrides.sheets['Sheet1'][1]['Recovered'])

	var usAutoConfirmed = latest.filter(d => d.Country_Region == "US")[0]['Confirmed']
	var usAutoDeaths = latest.filter(d => d.Country_Region == "US")[0]['Deaths']
	// var usAutoRecovered = latest.filter(d => d.Country_Region == "US")[0]['Recovered']

	var ukManualConfirmed = niceNumber(overrides.sheets['Sheet1'][2]['Cases'])
	var ukManualDeaths = niceNumber(overrides.sheets['Sheet1'][2]['Deaths'])
	// var ukManualRecovered = niceNumber(overrides.sheets['Sheet1'][2]['Recovered'])

	var ukAutoConfirmed = latest.filter(d => d.Country_Region == 'United Kingdom')[0]['Confirmed']
	var ukAutoDeaths = latest.filter(d => d.Country_Region == 'United Kingdom')[0]['Deaths']
	// var ukAutoRecovered = latest.filter(d => d.Country_Region == 'United Kingdom')[0]['Recovered']

	var timeFormat = d3.timeFormat('%Y-%m-%d')
	var timeParse = d3.timeParse('%d/%m/%Y')
	var ausManualTimestamp = aus.sheets['latest totals'][8]['Last updated']
	var autoTimestamp = confirmed_daily[confirmed_daily.length-1]['index']

	var ausFinalDeaths, ausFinalConfirmed, ausFinalRecovered, totalFinalDeaths, totalFinalConfirmed, totalFinalRecovered, usFinalDeaths, usFinalConfirmed, usFinalRecovered, ukFinalDeaths, ukFinalConfirmed, ukFinalRecovered

	// console.log(ausManualConfirmed,ausAutoConfirmed)

	function sorter(a,b) {
		if (a > b) {
			return -1;
		}
		if (b > a) {
			return 1;
		}		
		return 0;
	}

	function compare(things) {
		return [].slice.call(things).sort(sorter)[0]
	}

	ausFinalConfirmed = compare([ausManualConfirmed, ausManualConfirmed2])
	ausFinalDeaths = compare([ausManualDeaths, ausManualDeaths2])
	ausFinalRecovered = compare([ausManualRecovered, ausManualRecovered2])

	totalFinalConfirmed = compare([totalManualConfirmed, totalAutoConfirmed])
	totalFinalDeaths = compare([totalManualDeaths, totalAutoDeaths])
	// totalFinalRecovered = compare([totalManualRecovered, totalAutoRecovered])

	usFinalConfirmed = compare([usManualConfirmed, usAutoConfirmed])
	usFinalDeaths = compare([usManualDeaths, usAutoDeaths])
	// usFinalRecovered = compare([usManualRecovered, usAutoRecovered])

	ukFinalConfirmed = compare([ukManualConfirmed, ukAutoConfirmed])
	ukFinalDeaths = compare([ukManualDeaths, ukAutoDeaths])
	// ukFinalRecovered = compare([ukManualRecovered, ukAutoRecovered])

	data["Australia"]['confirmed'] = format(ausManualActive)
	data["Australia"]['deaths'] = format(ausFinalDeaths)
	data["Australia"]['recovered'] = format(ausFinalRecovered)

	data["United Kingdom"]['confirmed'] = format(ukFinalConfirmed)
	data["United Kingdom"]['deaths'] = format(ukFinalDeaths)
	// data["United Kingdom"]['recovered'] = format(ukFinalRecovered)

	data["US"]['confirmed'] = format(usFinalConfirmed)
	data["US"]['deaths'] = format(usFinalDeaths)
	// data["US"]['recovered'] = format(usFinalRecovered)

	data["Total"]['confirmed'] = format(totalFinalConfirmed)
	data["Total"]['deaths'] = format(totalFinalDeaths)
	// data["Total"]['recovered'] = format(totalFinalRecovered)


	// console.log(data);
	Ractive.DEBUG = false;
	var ractive = new Ractive({
			target: "#outer-wrapper",
			template: template,
			data: { 
					location:data[country],
					layout: "three",
					label: "Active cases*",
					ausManualTimestamp:ausManualTimestamp,
					autoTimestamp:autoTimestamp
				}
		});


	ractive.on({
		world: function ( event ) {
			ractive.set('location', data["Total"])
			ractive.set('layout', "two")
			ractive.set('label', "Confirmed cases")
			country = 'Total'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".world").classed("btn-selected", true);

		},
		us: function ( event ) {
			console.log("us")
			ractive.set('location', data["US"])
			ractive.set('layout', "two")
			ractive.set('label', "Confirmed cases")
			country = 'US'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".us").classed("btn-selected", true);

		},
		uk: function ( event ) {
			console.log("uk")
			ractive.set('location', data["United Kingdom"])
			ractive.set('layout', "two")
			ractive.set('label', "Confirmed cases")
			country = 'United Kingdom'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".uk").classed("btn-selected", true);

		},
		aus: function ( event ) {
			console.log("aus")
			ractive.set('location', data["Australia"])
			ractive.set('layout', "three")
			ractive.set('label', "Active cases*")
			country = 'Australia'
			d3.selectAll(".btn").classed("btn-selected", false);
			d3.select(".aus").classed("btn-selected", true);

		}
	});

	// ractive.set('data', self.pagerank);


};

Promise.all([
		d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_daily.json'),
		d3.json('https://interactive.guim.co.uk/docsdata/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json'),
		d3.json('https://interactive.guim.co.uk/docsdata/1jy3E-hIVvbBAyUx7SY3IfUADB85mGoaR2tobYu9iifA.json'),
		d3.json("https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/latest.json"),
		d3.json("https://interactive.guim.co.uk/docsdata/1xEijW_9nGVP55-CtmMSyIdOYWP9YYwbs-xZYoAeHEso.json")
	])
.then((results) =>  {
	init('Australia', results[0], results[1], results[2], results[3], results[4])
})


// Promise.all([
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_preview.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/confirmed_daily_preview.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/deaths_preview.json'),
// 	d3.json('https://interactive.guim.co.uk/2020/03/coronavirus-widget-data/recovered_preview.json'),
// 	d3.json('https://interactive.guim.co.uk/docsdata/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json'),
// 	d3.json('https://interactive.guim.co.uk/docsdata/1jy3E-hIVvbBAyUx7SY3IfUADB85mGoaR2tobYu9iifA.json')
	
// ])
// .then((results) =>  {
// 	init('Total', results[0], results[1], results[2], results[3], results[4], results[5])
// })

// Promise.all([
// 	d3.json('<%= path %>/assets/confirmed.json'),
// 	d3.json('<%= path %>/assets/deaths.json'),
// 	d3.json('<%= path %>/assets/recovered.json'),
// 	d3.json('<%= path %>/assets/1q5gdePANXci8enuiS4oHUJxcxC13d6bjMRSicakychE.json')
// ])
// .then((results) =>  {
// 	init('Total', results[0], results[1], results[2], results[3])
// })
