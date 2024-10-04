$(document).ready(function () {
  // Wait for the modal to be shown
  $("#staticBackdrop1").on("shown.bs.modal", function () {
    // Create the map inside the modal
    let myMap = L.map("map", {
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
      iconSize: [30, 30], // Adjust the icon size as needed
    });

    // D3 function to load CSV data
    d3.csv("outputs/locations_clean.csv").then(function (data) {
      // Loop through the data and add markers
      data.forEach(function (d) {
        // Create a marker for each location
        let marker = L.marker(
          [parseFloat(d.Latitude), parseFloat(d.Longitude)],
          { icon: carIcon }
        );

        // Construct the popup content
        let popupContent = `
          <b>${d["Location Name"]}</b><br>
          Address: ${d["Location Address"]}<br>
          State FIPS: ${d["State FIPS"]}<br>
          County FIPS: ${d["County FIPS"]}<br>
          Tract: ${d["Tract"]}
        `;

        // Bind the popup to the marker
        marker.bindPopup(popupContent);

        // Add the marker to the layer group
        marker.addTo(locationLayer);
      });
    });

    // Add layers to the map with different colors
    let baseLayers = {
      "Street Map": streetMap,
    };

    let overlayLayers = {
      Locations: locationLayer.addTo(myMap),
    };

    L.control
      .layers(baseLayers, overlayLayers, {
        collapsed: false,
      })
      .addTo(myMap);

    // Create a custom legend control
    const legend = L.control({ position: "bottomright" });

    // legend.onAdd = function (map) {
    //   let div = L.DomUtil.create("div", "legend");
    //   div.innerHTML += "<h6>Category Icons</h6>";
    //   for (const [iconClass, color] of Object.entries(legendIcons)) {
    //     const legendItem = L.DomUtil.create("div", "legend-item", div);
    //     legendItem.innerHTML =
    //       `<i class="${iconClass} legend-icon" style="color: ${color};"></i>` +
    //       `<span class="legend-text">${getLayerNameByIconClass(
    //         iconClass
    //       )}</span>`;
    //   }
    //   return div;
    // };

    // Add the legend control to the map
    legend.addTo(myMap);
  });

  // Add custom CSS to change the car icon color to black
  let customIconColor = document.createElement("style");
  customIconColor.innerHTML = `
      .custom-marker .fas.fa-car {
        color: black;
      }
    `;
  document.head.appendChild(customIconColor);

  // Create a custom control for the home button
  let homeButton = L.Control.extend({
    options: {
      position: "topleft",
    },

    onAdd: function () {
      let container = L.DomUtil.create("div", "home-button");
      container.innerHTML = '<i class="fas fa-home"></i>';
      container.title = "Home";

      container.onclick = function () {
        // Reset map view to original position and zoom level
        myMap.setView([46.226, -94.3266], 7);
      };

      return container;
    },
  });
});
