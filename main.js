/* Assignment 3 
 * 
 * When the chart type dropdown changes, update the chart 
 * by sorting the dataset and re-joining the data to the rects.
 * Update the axes and item positions to smoothly go to their new sizes and
 * positions. You will only need to use the update selection in
 * updateChartType for this exercise. 
*/

const chartType = document.querySelector('#chartType');

function rowConverter(row) {
  return {
    app_name: row.app_name,
    downloads: parseInt(row.downloads),
    average_rating: parseFloat(row.average_rating),
    thirty_day_keep: parseFloat(row.thirty_day_keep) / 100
  }
}

let dataset;
let xScale, yScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;
let chart1;
let w, h;

let key = (d) => d.app_name;

function makeChart1(dataset) {

   w = 600;
   h = dataset.length * 24;

  // sort the data by downloads
  // uses built-in Array.sort() with comparator function
  dataset.sort((a,b) => b.downloads - a.downloads);

  chart1 = d3.select('#chart1')
    .attr('width', w)
    .attr('height', h);

  // our range is limited from 0 to width - 100, 
  // which is for the 80 pixels on left for axis and 
  // 20 pixels on right for padding
  xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.downloads)])
    .rangeRound([0, w - 100]);

  // using scale band to work with nominal values 
  // the Array.map() call allows us to get a new array
  // by calling a function on each item of the source array 
  // here it pulls out the app_name
  yScale = d3.scaleBand()
    .domain(dataset.map((d) => d.app_name))
    .rangeRound([20, h - 20]);

  // d3 allows scaling between colors
  let colorScale = d3.scaleLinear()
    .domain([4.5, 5])
    .range(['#88d', '#ccf']);

  chart1.selectAll('rect')
    .data(dataset, key)
    .enter()
    .append('rect')
    .attr('x', 80)
    .attr('y', (d) => yScale(d.app_name))
    .attr('width', (d) => xScale(d.downloads))
    .attr('height', 18)
    .attr('fill', (d) => colorScale(d.average_rating));

  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale)

  // AXES
  xAxisGroup = chart1.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(80, ${h - 20})`)
    .call(xAxis);

  yAxisGroup = chart1.append('g')
    .attr('class', 'axis-left1')
    .attr('transform', `translate(80,0 )`)
    .call(yAxis);
}

function updateChartType() {
  console.log(chartType.value);
  console.log(chartType.selectedIndex);

	let bars = chart1.selectAll('rect').data(dataset, key);
	
  // TODO
  // Depending on chartType.selectedIndex
  // update the chart by:
  // 1. re-sort the dataset
  // 2. update xscale domain 
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


window.onload = function () {
  d3.csv('fake_app_download_rating.csv', rowConverter)
    .then((d) => {
      dataset = d;
      makeChart1(dataset);
    });

  chartType.addEventListener("change", updateChartType);
}
