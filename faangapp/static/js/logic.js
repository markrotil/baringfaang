var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [18, 18],
        iconAnchor: [12, 74],
        popupAnchor: [-3, -76]
    }
})


var Amzn = new LeafIcon({ iconUrl: 'amazon pin.png' }),
    Appl = new LeafIcon({ iconUrl: 'templates/apple pin.png' }),
    Googl = new LeafIcon({ iconUrl: 'templates/google pin.png' }),
    FacB = new LeafIcon({ iconUrl: 'templates/facebook pin.png' }),
    Nflx = new LeafIcon({ iconUrl: 'templates/netflix pin.png' }),
    Micrsft = new LeafIcon({ iconUrl: 'templates/microsoft pin.png' });





// Create the tile layer that will be the background of our map
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
    Facebook: new L.LayerGroup(),
    Amazon: new L.LayerGroup(),
    Apple: new L.LayerGroup(),
    Netflix: new L.LayerGroup(),
    Google: new L.LayerGroup()
};

// Create the map with our layers
var map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [
        layers.Facebook,
        layers.Amazon,
        layers.Apple,
        layers.Netflix,
        layers.Google
    ]
});

// Add our 'lightmap' tile layer to the map
lightmap.addTo(map);

// Create an overlays object to add to the layer control
var overlays = {
    "Facebook": layers.Facebook,
    "Amazon": layers.Amazon,
    "Apple": layers.Apple,
    "Netflix": layers.Netflix,
    "Google": layers.Google
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map
var info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    return div;
};
// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
var icons = {
    Facebook: FacB,

    Amazon: Amzn,

    Google: Googl,

    Apple: Appl,

    Netflix: Nflx
};

// Perform an API call to the Citi Bike Station Information endpoint
d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json", function (infoRes) {

    // When the first API call is complete, perform another call to the Citi Bike Station Status endpoint
    d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json", function (statusRes) {
        var updatedAt = infoRes.last_updated;
        var stationStatus = statusRes.data.stations;
        var stationInfo = infoRes.data.stations;

        // Create an object to keep of the number of markers in each layer
        var stationCount = {
            Facebook: 0,
            Amazon: 0,
            Apple: 0,
            Netflix: 0,
            Google: 0
        };

        // Initialize a stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for layer group
        var stationStatusCode;

        // Loop through the stations (they're the same size and have partially matching data)
        for (var i = 0; i < stationInfo.length; i++) {

            // Create a new station object with properties of both station objects
            var station = Object.assign({}, stationInfo[i], stationStatus[i]);
            // If a station is listed but not installed, it's Facebook
            if (!station.is_installed) {
                stationStatusCode = "Facebook";
            }
            // If a station has no bikes available, it's Amazon
            else if (!station.num_bikes_available) {
                stationStatusCode = "Amazon";
            }
            // If a station is installed but isn't renting, it's out of order
            else if (station.is_installed && !station.is_renting) {
                stationStatusCode = "Google";
            }
            // If a station has less than 5 bikes, it's status is Apple
            else if (station.num_bikes_available < 5) {
                stationStatusCode = "Apple";
            }
            // Otherwise the station is Netflix
            else {
                stationStatusCode = "Netflix";
            }

            // Update the station count
            stationCount[stationStatusCode]++;
            // Create a new marker with the appropriate icon and coordinates
            var newMarker = L.marker([station.lat, station.lon], {
                icon: icons[stationStatusCode]
            });

            // Add the new marker to the appropriate layer
            newMarker.addTo(layers[stationStatusCode]);

            // Bind a popup to the marker that will  display on click. This will be rendered as HTML
            newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
        }

        // Call the updateLegend function, which will... update the legend!
        updateLegend(updatedAt, stationCount);
    });
});

// Update the legend's innerHTML with the last updated time and station count
function updateLegend(time, stationCount) {
    document.querySelector(".legend").innerHTML = [
        "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
        "<p class='out-of-order'>Out of Order Stations: " + stationCount.Google + "</p>",
        "<p class='coming-soon'>Stations Facebook: " + stationCount.Facebook + "</p>",
        "<p class='Amazon'>Amazon Stations: " + stationCount.Amazon + "</p>",
        "<p class='Apple'>Apple Stations: " + stationCount.Apple + "</p>",
        "<p class='healthy'>Healthy Stations: " + stationCount.Netflix + "</p>"
    ].join("");
}
