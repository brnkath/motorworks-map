// Start Miami-Dade County Median Income by Zip Code Bar Graph

// Fetch the miami_info.csv
fetch("resources/miami_info.csv")
  .then((response) => response.text())
  .then((data) => processData(data));

function processData(data) {
  // Parse the CSV data into an array of objects
  const parsedData = d3.csvParse(data, (d) => ({
    Zipcode: d.Zipcode.toString(), // Convert Zipcode to a string
    Median_income: +d.Median_income.replace(/\$/, "").replace(/,/g, ""), // Convert Median_income to a number
  }));

  // Extract the Zipcode and Median_income data
  const zipcodes = parsedData.map((item) => item.Zipcode);
  const incomes = parsedData.map((item) => item.Median_income);

  // Create the Plotly bar graph
  createBarGraph(zipcodes, incomes);
}

function createBarGraph(zipcodes, incomes) {
  const trace = {
    x: zipcodes, // X-axis should be Zipcodes
    y: incomes, // Y-axis should be Median_income
    type: "bar",
    marker: {
      color: "orange", // Set the bar color to orange
    },
  };

  const layout = {
    title: "Miami-Dade County Median Income by Zip Code",
    xaxis: {
      title: "Zip Code",
      type: "category", // Set the X-axis type to 'category'
      tickmode: "linear", // Set the tick mode to 'linear' to preserve the original Zipcodes
      tickangle: -45, // Set the angle of the tick to -45 degrees
    },
    yaxis: { title: "Median Income" },
  };

  Plotly.newPlot("bar-graph", [trace], layout);
}

// End Miami-Dade County Median Income by Zip Code Bar Graph

// Start Pie Chart of Available Food Sources

let cat_data = [
  {
    values: [233, 88, 14],
    labels: ["Restaurant", "Fast Food", "Supermarket"],
    type: "pie",
  },
];

let layout = {
  title: "Available Food Sources",
  height: 600,
  width: 700,
};

Plotly.newPlot("pie-chart", cat_data, layout);

// End Pie Chart of Available Food Sources
