// @TODO: YOUR CODE HERE!
var svgWidth = 750;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60, 
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart and shift the latter by left and top margins
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data.csv").then(function(censusData) {

    // Parse Data & Cast as numbers
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(censusData, d => d.poverty))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("Circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "rgb(117, 145, 197)") 
      .attr("opacity", "0.5");

    // Add state labels to the points
    var circleLabels = circlesGroup.selectAll("text").data(censusData).enter().append("text");

    circleLabels
      .attr("x", function(d) { return d.poverty; })
      .attr("y", function(d) { return d.healthcare; })
      .text(function(d) { return d.abbr; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "5px")
      .attr("fill", "white");

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("In Poverty (%)");

    // Initialize tooltip
    var toolTip = d3.tip() 
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return  `${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}<br>`; 
    });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

});