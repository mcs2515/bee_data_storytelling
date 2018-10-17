function rowConverter(row) {
  return {
		stateInitials:row.state,
		stateName:row.StateName,
		totalprod: row.totalprod,
		year: row.year,
		pesticides: row.nAllNeonic,
  }
}

//b = new Map()
//b.set('AL', Alabama);
//b.get('AL');


//var state_data = data.filter(function(d) {return d.stateInitials = 'AL'});


let dataset;
let xScale, yScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;
let chart;
let w, h;

let key = (d) => d.app_name;

function makeChart(dataset) {
	
	w = 900;
	h = 400;
   
	// sort the data by downloads
  // uses built-in Array.sort() with comparator function
  //dataset.sort((a,b) => b.pesticides - a.pesticides);

  chart = d3.select('#chart')
    .attr('width', w)
    .attr('height', h);

  // our range is limited from 0 to width - 100, 
  // which is for the 80 pixels on left for axis and 
  // 20 pixels on right for padding
  xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.totalprod)])
    .rangeRound([20, w - 20]);

  yScale = d3.scaleLinear()
    .domain([d3.min(dataset, (d) => d.pesticides),d3.max(dataset, (d) => d.pesticides)])
    .rangeRound([h-20, 20]);

  // d3 allows scaling between colors
  let colorScale = d3.scaleLinear()
    .domain([4.5, 5])
    .range(['#88d', '#ccf']);

  chart.selectAll('rect')
    .data(dataset, key)
    .enter()
    .append('rect')
    .attr('x', (d)=>xScale(d.totalprod))
    .attr('y', (d) => h- yScale(d.pesticides))
    .attr('width', 18)
    .attr('height', (d) => yScale(d.pesticides))
    .attr('fill', (d) => colorScale(d.totalprod));

  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale)

  // AXES
  xAxisGroup = chart.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(80, ${h - 20})`)
    .call(xAxis);

  yAxisGroup = chart.append('g')
    .attr('class', 'axis-left1')
    .attr('transform', `translate(80,0 )`)
    .call(yAxis);
}

function updateChart() {

	let bars = chart.selectAll('rect').data(dataset, key);
	
	if(chartType.selectedIndex == 0){  //downloads
		dataset.sort((a,b) => b.downloads - a.downloads);
		xScale.domain([0, d3.max(dataset, (d) => d.downloads)]);
		bars.attr('width', (d) => xScale(d.downloads));
	}
	else if(chartType.selectedIndex == 1){ //popularity
		dataset.sort((a,b) => b.average_rating - a.average_rating);
		xScale.domain([0, d3.max(dataset, (d) => d.average_rating)]);
		bars.attr('width', (d) => xScale(d.average_rating));
	}
	else if(chartType.selectedIndex == 2){ //retension
		dataset.sort((a,b) => b.thirty_day_keep - a.thirty_day_keep);
		xScale.domain([0, d3.max(dataset, (d) => d.thirty_day_keep)]);
		bars.attr('width', (d) => xScale(d.thirty_day_keep));
	}
  
  // 3. update yscale domain
	yScale.domain(dataset.map((d)=> d.app_name));
	
  // 4. select rects, rebind with key, use transition to then
  // update x,y, and width of bars
	bars
		.transition()
		.attr('x', 80)
		.attr('y', (d) => yScale(d.app_name));
	
  // After that, alway update xAxis scale, xAxisGroup with xAxis (call), and same for yAxis scale and yAxisGroup  (see 5.3 example code)
	xAxis.scale(xScale);
	xAxisGroup.transition('axis')
	  .duration(1000)
	  .call(xAxis);
	
	yAxis.scale(yScale);
	yAxisGroup.transition('axis')
	  .duration(1000)
	  .call(yAxis);
}

function populateSelect(dataset){
	
	let state_select = d3.select('#stateSelect');
	let state_lbl = d3.select('#stateName');
	
	//populate dropdown based on unique keys = no duplicates of stateInitials
	state_select.selectAll("option")
		.data(d3.map(dataset, function(d){return d.stateInitials;}).keys())
		.enter()
		.append("option")
		.attr("value", function (d) {return d})
		.text(function (d) {return d});
	

	
	state_select.on("change", function (d){
		var value = d3.select(this).property("value");
		
		//set the state_lbl to full state name
		
		//pass value to year, pesticide, and totalprod
		//updateChart()
		console.log("selection changed: " + value);
	});
}

window.onload = function () {
  d3.csv('HoneyNeonic.csv', rowConverter)
    .then((d) => {
      dataset = d;
			populateSelect(dataset);
      makeChart(dataset);
    });

  //stateSelect.addEventListener("change", updateChart);
}
