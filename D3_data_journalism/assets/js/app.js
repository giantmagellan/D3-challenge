// Script to create scatter plot between Healthcare & Poverty

// ==========================================================
// Set margins

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
// SVG wrapper
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Appending svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ===========================================================
// Initial Parameters
var chosenXAxis = "poverty";

// function to update x-scale on click of x-axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d =>[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// function to update x-axis upon click on x-axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function to update circle group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

// function to update circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    var label; // initialize with empty string???
    
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
        .html(function(d) {
            return (`${d.abbr}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    });

    return circlesGroup;
}

// ===========================================================
// Retrieve data from the CSV file 
d3.csv("healthData.csv").then(function(healthData, err) {
    console.log(healthData);
    if (err) throw err;

    //parse data for all 3 sets of axes
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;       // In Poverty (%)
        data.healthcare = +data.healthcare; // Lacks Healthcare (Median)
        data.age = +data.age;               // Age (Median)
        data.smokes = +data.smokes;         // Smokes (%)
        data.income = +data.income;         // Household Income (Median)
        data.obesity = +data.obesity;       // Obese (%)
    });
    console.log(data);

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)])
        .range([height, 0]);
    
    // initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
});
