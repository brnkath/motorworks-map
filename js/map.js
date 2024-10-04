$(document).ready(function () {
  let myMap;

  // Wait for the modal to be shown
  $("#staticBackdrop1").on("shown.bs.modal", function () {
    // Create the map inside the modal
    myMap = L.map("map", {
      center: [46.226, -94.3266],
      zoom: 7,
    });

    // Adding a tile layer (the background map image) to the map
    let streetMap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(myMap);

    // Create a layer group for the markers
    let locationLayer = L.layerGroup().addTo(myMap);

    // Define a custom car icon using Font Awesome
    let carIcon = L.divIcon({
      className: "custom-marker",
      html: '<i class="fas fa-car"></i>',
      iconSize: [20, 20],
    });

    // Function to format number with commas
    function numberWithCommas(x) {
      return Math.round(parseFloat(x))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // New function to format percentage
    function formatPercentage(x) {
      return parseFloat(x).toFixed(2) + "%";
    }

    // Function to load and process CSV files
    function loadCSVFiles() {
      // Fetch the contents of the outputs directory
      fetch("outputs-locations/")
        .then((response) => response.text())
        .then((html) => {
          // Parse the HTML to find CSV files
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const links = doc.querySelectorAll("a");
          const csvFiles = Array.from(links)
            .map((link) => link.href)
            .filter((href) => href.endsWith(".csv"));

          // Process each CSV file
          csvFiles.forEach((fileUrl) => {
            d3.csv(fileUrl)
              .then(function (data) {
                data.forEach(function (d) {
                  // Create a marker for each location
                  let marker = L.marker(
                    [parseFloat(d.Latitude), parseFloat(d.Longitude)],
                    { icon: carIcon }
                  );

                  // Construct the popup content
                  let popupContent = `
                    <b>${d.Location}</b><br>
                    State: ${d.State}<br>
                    County: ${d.County}<br>
                    Zip Code: ${d["Zip Code"]}<br>
                    <br>
                    <b>- County Level Data - </b><br>
                    Median Income: $${numberWithCommas(d["Median Income"])}<br>
                    Population: ${numberWithCommas(d.Population)}<br>
                    Unemployment: ${numberWithCommas(
                      d.Unemployment
                    )} <b>(${formatPercentage(d["Unemployment %"])})</b><br>
                    Poverty Count: ${numberWithCommas(
                      d["Poverty Count"]
                    )} <b>(${formatPercentage(d["Poverty %"])})</b><br>
                    Education (High School Grad): ${numberWithCommas(
                      d["Education (High School Grad)"]
                    )} <b>(${formatPercentage(
                    d["Education (High School Grad) %"]
                  )})</b>
                  `;

                  // Bind the popup to the marker
                  marker.bindPopup(popupContent);

                  // Add the marker to the layer group
                  marker.addTo(locationLayer);
                });
              })
              .catch((error) =>
                console.error(`Error loading ${fileUrl}:`, error)
              );
          });
        })
        .catch((error) =>
          console.error("Error fetching CSV file list:", error)
        );
    }

    // Call the function to load and process CSV files
    loadCSVFiles();

    // Add layers to the map
    let baseLayers = {
      "Street Map": streetMap,
    };

    let overlayLayers = {
      "Shop Locations": locationLayer,
    };

    L.control
      .layers(baseLayers, overlayLayers, {
        collapsed: false,
      })
      .addTo(myMap);

    // Create a custom control for the home button
    let HomeButton = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function (map) {
        let container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control leaflet-control-home"
        );
        let button = L.DomUtil.create("a", "", container);
        button.innerHTML =
          '<i class="fas fa-home" style="line-height: 30px;"></i>';
        button.href = "#";
        button.title = "Reset View";

        L.DomEvent.on(button, "click", function (e) {
          e.preventDefault();
          map.setView([46.226, -94.3266], 7);
        });

        return container;
      },
    });

    // Add the home button to the map
    new HomeButton().addTo(myMap);

    // Adjust the position of the home button
    setTimeout(() => {
      let zoomControl = document.querySelector(".leaflet-control-zoom");
      let homeControl = document.querySelector(".leaflet-control-home");
      zoomControl.appendChild(homeControl);
    }, 100);
  });

  // Add custom CSS for the map controls and markers
  let customStyles = document.createElement("style");
  customStyles.innerHTML = `
    .custom-marker .fas.fa-car {
      color: blue;
    }
    .leaflet-control-home {
      margin-top: -0.7px !important;
      margin-left: -2.3px !important;
    }
    .leaflet-control-home a {
      font: bold 18px 'Lucida Console', Monaco, monospace;
      text-indent: 1px;
      text-align: center;
      width: 30px;
      height: 30px;
      display: block;
    }
    .leaflet-control-zoom-in {
      margin-bottom: 1px;
    }
    .leaflet-control-zoom a, .leaflet-control-home a {
      background-color: #fff;
      border-bottom: 1px solid #ccc;
      width: 30px;
      height: 30px;
      line-height: 30px;
      display: block;
      text-align: center;
      text-decoration: none;
      color: black;
    }
    .leaflet-control-zoom a:hover, .leaflet-control-home a:hover {
      background-color: #f4f4f4;
    }
    .leaflet-control-zoom {
      padding-bottom: 0;
    }
  `;
  document.head.appendChild(customStyles);
});
