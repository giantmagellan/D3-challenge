// ===========================================================
// SET MARGINS
// ===========================================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// ===========================================================
// SVG WRAPPER
// ===========================================================
var svg = d3.select("#scatter")
  .classed('chart', true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
console.log(svg);

// Appending svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ===========================================================
// INITIAL PARAMETERS
// ===========================================================
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// ===========================================================
// AXIS SCALES
// ===========================================================
// function to update x-scale on click of x-axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// function yScale(healthData, chosenYAxis) {
//     // Create scales
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(healthData, s => d[chosenYAxis]) * 0.8,
//         d3.max(healthData, s => s[chosenYAxis]) * 1.2
//         ])
//         .range([width, 0]);
    
//     return yLinearScale;
// }

// ===========================================================
// LABELS CLICK FUNCTION
// ===========================================================
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function to update y-axis when y-axis label is clicked
// function renderAxesY(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);

//     yAxis.transition()
//         .duration(1000)
//         .call(leftAxis);
    
//     return yAxis;
// }

// ===========================================================
// CIRCLES TRANSITION EDITING
// ===========================================================
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

// function renderYcircles(circlesGroup, newYScale, chosenYAxis) {

//     circlesGroup.transition()
//         .duration(1000)
//         .attr("cy", s => newYScale(s[chosenYAxis]));
// }

// ===========================================================
// UPDATE CIRCLES/TOOLTIP FUNCTION
// ===========================================================
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === 'poverty') {
        label = "In Poverty (%)";
    }
    else if (chosenXAxis === 'age') {
        label = "Age (Median)";
    }
    else {
        label = "Household Income (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(d => `${d.state} <br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}`);
    
    circlesGroup.call(toolTip);

    circlesGroup.classed("active inactive", true)
    .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}

// ===========================================================
// RETRIEVE DATA FROM CSV FILE
// ===========================================================
d3.csv("healthData.csv").then(function(healthData, err) {
    console.log(healthData);
    if (err) throw err;

    //parse data for all 3 sets of axes
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;       // In Poverty (%)
        data.healthcare = +data.healthcare; // Lacks Healthcare (Median)
        data.age = +data.age;               // Age (Median)
        // data.smokes = +data.smokes;         // Smokes (%)
        // data.income = +data.income;         // Household Income (Median)
        // data.obesity = +data.obesity;       // Obese (%)
    });
    // console.log(healthData);

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)])
        .range([height, 0]);

    
    // initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
      // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
    .classed("y-axis", true)
    // .attr("transform", `translate(${height}, 0)`)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fillColor", "royalblue")
        .attr("opacity", 0.8);

    var circleLabels = circlesGroup.selectAll(null)
        .data(healthData)
        .enter()
        .append(circleLabels);

    circleLabels
    .attr("x", function(d) { return d.poverty; })
    .attr("y", function(d) { return d.healthcare; })
    .text(function(d) { return d.abbr; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "5px");

    // Group for 3 x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 2})`);
    
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30) // placement of label beneath the x-axis
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 50) // placement of label beneath the x-axis
        .attr("value", "age") // value to grab for event listener
        .classed("active", false)
        .text("Age (Median)");
    
    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 70) 
        .attr("value", "income") // value for event listener
        .classed("active", false)
        .text("Household Income (Median)");
    
    // Group for 3 y-axis labels
    var healthcareLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");
    
    
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
            .classed("active", true)    // poverty label is bold
            .classed("inactive", false)
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)    // age label is bold
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)    // income label is bold
            .classed("inactive", false);
        }
        }
    });
}).catch(function(error) {
    console.log(error);
});
