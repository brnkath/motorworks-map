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

    // Load JSON data using D3
    d3.json("resources/locations.json").then(function (data) {
      // Create layers for different types of features
      let restaurantLayer = L.layerGroup();
      let fastFoodLayer = L.layerGroup();
      let supermarketLayer = L.layerGroup();

      // Create marker clusters for each category
      let restaurantCluster = L.markerClusterGroup();
      let fastFoodCluster = L.markerClusterGroup();
      let supermarketCluster = L.markerClusterGroup();

      // Loop through the data and add markers to appropriate layers with Font Awesome icons
      data.features.forEach(function (feature) {
        let coordinates = feature.geometry.coordinates;
        let properties = feature.properties;

        let markerOptions = {
          icon: L.divIcon({
            className: "custom-marker",
            html: properties.categories.includes("catering.restaurant")
              ? '<i class="fas fa-utensils" style="color: #FF0000;"></i>'
              : properties.categories.includes("catering.fast_food")
              ? '<i class="fas fa-hamburger" style="color: #0000FF;"></i>'
              : properties.categories.includes("commercial.supermarket")
              ? '<i class="fas fa-shopping-cart" style="color: #66b447;"></i>'
              : "", // Empty string if no category matches
          }),
        };

        // Check the type of feature and add marker to the corresponding layer with Font Awesome icon
        if (properties.categories.includes("catering.restaurant")) {
          L.marker([coordinates[1], coordinates[0]], markerOptions)
            .bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
            .addTo(restaurantLayer);
        } else if (properties.categories.includes("catering.fast_food")) {
          L.marker([coordinates[1], coordinates[0]], markerOptions)
            .bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
            .addTo(fastFoodLayer);
        } else if (properties.categories.includes("commercial.supermarket")) {
          L.marker([coordinates[1], coordinates[0]], markerOptions)
            .bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
            .addTo(supermarketLayer);
        }

        // Check the type of feature and add marker to the corresponding cluster
        if (properties.categories.includes("catering.restaurant")) {
          let marker = L.marker([coordinates[1], coordinates[0]]);
          restaurantCluster.addLayer(
            marker.bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
          );
        } else if (properties.categories.includes("catering.fast_food")) {
          let marker = L.marker([coordinates[1], coordinates[0]]);
          fastFoodCluster.addLayer(
            marker.bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
          );
        } else if (properties.categories.includes("commercial.supermarket")) {
          let marker = L.marker([coordinates[1], coordinates[0]]);
          supermarketCluster.addLayer(
            marker.bindPopup(
              `<h5>${
                properties.address_line1
              }</h5><hr><h6><strong>Address: </strong>${
                properties.address_line2
              }</h6><h6><strong>Category: </strong>${
                properties.categories.includes("catering.restaurant")
                  ? "Restaurant"
                  : properties.categories.includes("catering.fast_food")
                  ? "Fast Food"
                  : properties.categories.includes("commercial.supermarket")
                  ? "Supermarket"
                  : ""
              }</h6>`
            )
          );
        }
      });
      // Declare colorScale variable in the global scope
      let colorScale;
      // Create a promise for loading the income data
      let incomePromise = new Promise(function (resolve, reject) {
        d3.json("resources/filtered_zipcodes.geojson").then(function (geojson) {
          let incomeRange = d3.extent(geojson.features, function (d) {
            return parseInt(
              d.properties.median_income.replace("$", "").replace(",", "")
            );
          });
          colorScale = d3
            .scaleQuantize()
            .domain(incomeRange)
            .range([
              "#3288bd",
              "#66c2a5",
              "#abdda4",
              "#e6f598",
              "#fee08b",
              "#fdae61",
              "#f46d43",
              "#d53e4f",
            ]);
          let incomeLayer = L.geoJson(geojson, {
            style: function (feature) {
              let income = parseInt(
                feature.properties.median_income
                  .replace("$", "")
                  .replace(",", "")
              );
              return {
                fillColor: colorScale(income),
                weight: 1,
                opacity: 1,
                color: "black",
                fillOpacity: 0.5,
              };
            },
            onEachFeature: function (feature, layer) {
              layer.bindPopup(
                `<h6><strong>Zipcode: </strong> ${feature.properties.ZCTA5CE10}</h6?<br><h6><strong>Median Income: </strong> ${feature.properties.median_income}</h6>`
              );
            },
          }).addTo(myMap);
          resolve(incomeLayer);
        });
      });

      // Wait for the incomeLayer promise to resolve
      incomePromise.then(function (incomeLayer) {
        // Create a new layer for all locations with marker clusters
        let allLocationsClusterLayer = L.layerGroup([
          restaurantCluster,
          fastFoodCluster,
          supermarketCluster,
        ]);

        // Load neighborhood data using D3
        d3.json("resources/City_Boundary.geojson").then(function (city) {
          // Create a GeoJSON layer for neighborhoods
          let miamiLayer = L.geoJson(city, {
            style: function (feature) {
              return {
                weight: 4,
                opacity: 1,
                color: "purple",
                dashArray: "3",
                fillOpacity: 0,
              };
            },
            // onEachFeature: function (feature, layer) {
            //   layer.bindPopup(
            //     `<h6><strong>Neighborhood: </strong> ${feature.properties.LABEL}</h6>`
            //   );
            // },
          });

          // Add layers to the map with different colors
          let baseLayers = {
            "Street Map": streetMap,
          };

          let overlayLayers = {
            Restaurants: restaurantLayer.addTo(myMap),
            "Fast Food": fastFoodLayer.addTo(myMap),
            Supermarkets: supermarketLayer.addTo(myMap),
            "Income Level": incomeLayer.addTo(myMap),
            "Restaurants Cluster": restaurantCluster,
            "Fast Food Cluster": fastFoodCluster,
            "Supermarkets Cluster": supermarketCluster,
            "Miami Boundary": miamiLayer,
          };

          L.control
            .layers(baseLayers, overlayLayers, {
              collapsed: false,
            })
            .addTo(myMap);

          const legendColors = colorScale.range();

          const incomeLegend = L.control({ position: "bottomright" });

          incomeLegend.onAdd = function (map) {
            let div = L.DomUtil.create("div", "incomeLegend");
            div.innerHTML += "<h6>Median Income</h6>";
            for (let i = 0; i < legendColors.length; i++) {
              const legendItem = L.DomUtil.create(
                "div",
                "incomeLegendItem",
                div
              );
              const lowerBound = colorScale
                .invertExtent(legendColors[i])[0]
                .toLocaleString();
              const upperBound = colorScale
                .invertExtent(legendColors[i])[1]
                .toLocaleString();
              legendItem.innerHTML =
                `<div class="incomeLegendColor" style="background:${legendColors[i]}"></div>` +
                `<span class="incomeLegendText">$${lowerBound} - $${upperBound}</span><br>`;
            }
            return div;
          };

          incomeLegend.addTo(myMap);
        });

        // Define FontAwesome icons and their colors
        const legendIcons = {
          "fas fa-utensils": "#FF0000",
          "fas fa-hamburger": "#0000FF",
          "fas fa-shopping-cart": "#66b447",
        };

        // Function to get layer name by FontAwesome icon class
        function getLayerNameByIconClass(iconClass) {
          switch (iconClass) {
            case "fas fa-utensils":
              return "Restaurants";
            case "fas fa-hamburger":
              return "Fast Food";
            case "fas fa-shopping-cart":
              return "Supermarkets";
            default:
              return "";
          }
        }

        // Create a custom legend control
        const legend = L.control({ position: "bottomright" });

        legend.onAdd = function (map) {
          let div = L.DomUtil.create("div", "legend");
          div.innerHTML += "<h6>Category Icons</h6>";
          for (const [iconClass, color] of Object.entries(legendIcons)) {
            const legendItem = L.DomUtil.create("div", "legend-item", div);
            legendItem.innerHTML =
              `<i class="${iconClass} legend-icon" style="color: ${color};"></i>` +
              `<span class="legend-text">${getLayerNameByIconClass(
                iconClass
              )}</span>`;
          }
          return div;
        };

        // Add the legend control to the map
        legend.addTo(myMap);
      });
    });
  });
});
