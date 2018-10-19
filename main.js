function rowConverter(row) {
  return {
		stateInitials:row.state,
		stateName:row.StateName,
		totalprod: parseFloat(row.totalprod),
		year: row.year,
		pesticides: parseInt(row.nAllNeonic),
  }
}

let stateMap = new Map();
let state_lbl;
let state_select;

let big_dataset, state_dataset;
let xScale, yScale, colorScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;
let chart;
let w, h;
let leftMargin, rightMargin, bottomMargin;
let tooltip;
let barWidth;
let numLength, num;

let key = (d) => d.totalprod;

//Sets up scales, axes, graph demensions, and labels
function makeChart(dataset) {
	
  w = 900;
  h = 450;

  leftMargin = 70;
  rightMargin = 20;
  bottomMargin = 50;
  
  numlength = d3.max(dataset, (d) => d.totalprod).toString().length; //get lengh of number
  num = Math.pow(10,numlength-1);
  console.log(num);
  
  // sort the data by downloads
  // uses built-in Array.sort() with comparator function
  //dataset.sort((a,b) => b.totalprod - a.totalprod);

  chart = d3.select('#chart')
    .attr('width', w)
    .attr('height', h);
	
  // ((graph width - rightMargin) / length of  dataset) - padding
  barWidth = ((w - rightMargin) / dataset.length) - 8; 

  xScale = d3.scaleLinear()
    // adding 1 more year to the max so last rect doesn't go off x-axis
    .domain([d3.min(dataset, (d) => d.year), Number(d3.max(dataset, (d) => d.year)) + 1])
    .rangeRound([leftMargin, w - rightMargin]);

  yScale = d3.scaleLinear()
    .domain([0, Math.ceil(d3.max(dataset, (d) => d.totalprod)/num) * num])
    .rangeRound([h-bottomMargin, 20]);

  // d3 allows scaling between colors
  colorScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.pesticides)])
    .range(['#fecf67', '#914420']);
  
  // AXES
  xAxis = d3.axisBottom(xScale);
  xAxis.tickFormat(d3.format('d')).ticks(dataset.length);
	
  yAxis = d3.axisLeft(yScale);
  yAxis.tickFormat(d3.format(".2s"));
  
  xAxisGroup = chart.append('g')
    .attr('class', 'axis-bottom')
    .attr('transform', `translate(0, ${h - bottomMargin})`)
    .call(xAxis);
	
  yAxisGroup = chart.append('g')
    .attr('class', 'axis-left')
    .attr('transform', `translate(70,0)`)
    .call(yAxis);
  
  // LABELS
  chart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(h-bottomMargin)/2)
    .attr("y", 20)
    .style("text-anchor", "middle")
    .text("Total Production (lbs)");
	
  chart.append("text")
    .attr("x", h)
    .attr("y", (w/2))
    .style("text-anchor", "middle")
    .text("Years");
}

// gridlines in y axis function
function createHorizontalLines() {
  return d3.axisLeft(yScale);
}

function updateChart(dataset) {

  let bars = chart.selectAll('rect').data(dataset, key);
  let y_grid = chart.selectAll('.y-grid').data(dataset, key);
  
  barWidth = ((w - rightMargin) / dataset.length) - 8;
  numlength = d3.max(dataset, (d) => d.totalprod).toString().length;
  num = Math.pow(10,numlength-1);

  console.log(d3.max(dataset, (d) => d.totalprod));
  console.log(numlength);
  
  xScale.domain([d3.min(dataset, (d) => d.year), Number(d3.max(dataset, (d) => d.year)) + 1]);
  yScale.domain([0, Math.ceil(d3.max(dataset, (d) => d.totalprod)/num) * num]);
  colorScale.domain([0, d3.max(dataset, (d) => d.pesticides)]);
	
  //update y-axis grid line position
  y_grid
    .enter()
        .data(dataset, key)
        .append("g")
        .attr("class", "y-grid")
        .style("stroke-dasharray",("3,3"))
        .attr('transform', `translate(${leftMargin},0)`)
        .style('opacity', 0)
    .merge(y_grid)
        .transition()
        .duration(3000)
        .call(
            d3.axisLeft(yScale)
              .tickSize(-w)
              .tickFormat("")
        )
        .style('opacity', 1);

  y_grid
    .exit()
        .transition()
        .duration(1000)
        .style('opacity', 0)
        .remove();

// select rects, rebind with key, use transitions for newly added rects and removed rects
  bars
    .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.year))
      .attr('y', h - bottomMargin)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('value', (d) => d.totalprod)
			.on('mouseover', function(d){
																
				d3.select(this)
					.transition("fill")
					.duration(250)
					.style('fill', 'green')
					.style('cursor', 'pointer');
		
//				tooltip
//						.transition()
//						.duration(200)				
//						.style("opacity", .7)
//						.text("Slept hours: " + d.sleep)
//						.style('left', (d3.event.pageX) + "px")
//						.style('top', (d3.event.pageY) + "px");
			})
			.on('mouseout', function(d){
					d3.select(this)
						.transition("fill")
						.duration(250)
						.style('fill', (d) => colorScale(d.pesticides));

//					tooltip
//						.transition()
//						.duration(500)				
//						.style("opacity", 0);

		})
    .merge(bars)
      .transition()
      .duration(1500)
      .attr('height', (d) => h - bottomMargin - yScale(d.totalprod))
      .attr('y', (d) => yScale(d.totalprod))
      .attr('fill', (d) => colorScale(d.pesticides));
  
  // change opacity when bars leave
  bars
    .exit()
    .transition()
    .duration(1000)
    .style('opacity', 0)
    .remove();

// after that, always update xAxis scale, xAxisGroup with xAxis (call), and same for yAxis scale and yAxisGroup
  //xAxis.scale(xScale);
  xAxisGroup.transition("axis")
    .duration(1000)
    .call(xAxis);

  //yAxis.scale(yScale);
  yAxisGroup.transition("axis")
    .duration(1000)
    .call(yAxis);
}

function populateSelect(dataset){
  // populate dropdown based on unique keys = no duplicates of stateInitials
  state_select.selectAll("option")
    .data(d3.map(dataset, function(d){return d.stateInitials;}).keys())
    .enter()
    .append("option")
    .attr("value", function (d) {return d})
    .text(function (d) {return d});

  state_select.on("change", function (d){
    var value = d3.select(this).property("value");
    changeDataset(value);
  });
}

function changeDataset(value){
  //set the state_lbl to full state name
  state_lbl.innerHTML = stateMap.get(value);
  
  //get new dataset based on selected state
  state_dataset = big_dataset.filter(function(d) {return d.stateInitials == value});
  
  //console.log(state_dataset);
  updateChart(state_dataset);
}

//creates a map obj to make state abr. to name
function createStateMap(){
  stateMap.set('AL', 'Alabama');
  stateMap.set('AK', 'Alaska');
  stateMap.set('AZ', 'Arizona');
  stateMap.set('AR', 'Arkansas');
  stateMap.set('CA', 'California');
  stateMap.set('CO', 'Colorado');
  stateMap.set('CT', 'Connecticut');
  stateMap.set('DE', 'Delaware');
  stateMap.set('FL', 'Florida');
  stateMap.set('GA', 'Georgia');
  stateMap.set('HI', 'Hawaii');
  stateMap.set('ID', 'Idaho');
  stateMap.set('IL', 'Illinois');
  stateMap.set('IN', 'Indiana');
  stateMap.set('IA', 'Iowa');
  stateMap.set('KS', 'Kansas');
  stateMap.set('KY', 'Kentucky');
  stateMap.set('LA', 'Louisiana');
  stateMap.set('ME', 'Maine');
  stateMap.set('MD', 'Maryland');
  stateMap.set('MA', 'Massachusetts');
  stateMap.set('MI', 'Michigan');
  stateMap.set('MN', 'Minnesota');
  stateMap.set('MS', 'Mississippi');
  stateMap.set('MO', 'Missouri');
  stateMap.set('MT', 'Montana');
  stateMap.set('NE', 'Nebraska');
  stateMap.set('NV', 'Nevada');
  stateMap.set('NH', 'New Hampshire');
  stateMap.set('NJ', 'New Jersey');
  stateMap.set('NM', 'New Mexico');
  stateMap.set('NY', 'New York');
  stateMap.set('NC', 'North Carolina');
  stateMap.set('ND', 'North Dakota');
  stateMap.set('OH', 'Ohio');
  stateMap.set('OK', 'Oklahoma');
  stateMap.set('OR', 'Oregon');
  stateMap.set('PA', 'Pennsylvania');
  stateMap.set('RI', 'Rhode Island');
  stateMap.set('SC', 'South Carolina');
  stateMap.set('SD', 'South Dakota');
  stateMap.set('TN', 'Tennessee');
  stateMap.set('TX', 'Texas');
  stateMap.set('UT', 'Utah');
  stateMap.set('VT', 'Vermont');
  stateMap.set('VA', 'Virginia');
  stateMap.set('WA', 'Washington');
  stateMap.set('WV', 'West Virginia');
  stateMap.set('WI', 'Wisconsin');
  stateMap.set('WY', 'Wyoming');
}

window.onload = function () {
	
  // set variables
  let initials = "MD"; //MD??????
  state_select = d3.select('#stateSelect');
  state_lbl = document.querySelector('#stateName');
  tooltip = d3.select("body").append("div").attr('id', 'tooltip').style("opacity", 0);
	
  //get the csv and call appropriate functions
  d3.csv('HoneyNeonic.csv', rowConverter)
    .then((d) => {
      big_dataset = d;
      state_dataset = big_dataset.filter(function(d) {return d.stateInitials == initials});
        // set up the drop down selection
        createStateMap();
        populateSelect(big_dataset);
        state_select.property("value", initials);

        // make chart once
        makeChart(state_dataset);

        //
        changeDataset(initials);
    });
}
