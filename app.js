document.addEventListener('DOMContentLoaded', function () {
    // Replace 'your-mapbox-access-token' with your actual Mapbox access token
    L.mapbox.accessToken = 'pk.eyJ1Ijoic2FyYWw1NjU2IiwiYSI6ImNsdGZiMTRvczBxZHMycm8xOXBwcTN5emUifQ.6W9ag2tQAX7ShJIRv_U4gw';

    // Initialize map
    var mymap = L.map('map').setView([51.0447, -114.0719], 12);

    // Add the Mapbox tile layer using the style URL
    var mapboxLayer = L.mapbox.styleLayer('mapbox://styles/saral5656/cltfbxlhb00su01raetzfelhs');

    // Add the OpenStreetMap base as a fallback
    var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Group layers
    var baseLayers = {
        "Mapbox": mapboxLayer,
        "OpenStreetMap": openStreetMapLayer
    };

    // Add the layer control to the map
    L.control.layers(baseLayers).addTo(mymap);

    // Set the default layers
    mapboxLayer.addTo(mymap);
    openStreetMapLayer.addTo(mymap);
    
    //-----------------------------------------------------------------------------------------

    // Initialize MarkerClusterGroup for markers on map
    var markers = L.markerClusterGroup();

    // Initialize flatpickr for picking range of date
    var datePicker = flatpickr('#datePicker', {
        mode: 'range',
        dateFormat: 'Y-m-d'
    });

    // Select building permits based of range of dates
    document.getElementById('filterButton').addEventListener('click', function () {
       
        // Get selected date range
        var selectedDates = datePicker.selectedDates;

        // Fetch building permits data
        fetch('https://data.calgary.ca/resource/c2es-76ed.geojson')
            .then(response => response.json())
            .then(data => {
                // Clear existing markers from the map
                markers.clearLayers();

                // Add new markers to the map
                data.features.forEach(feature => {
                    if (feature.geometry && feature.geometry.coordinates) {
                        var issuedDate = new Date(feature.properties.issueddate);

                        // Check if the issued date is within the selected date range
                        if (issuedDate >= selectedDates[0] && issuedDate <= selectedDates[1]) {
                            var marker = L.marker([
                                feature.geometry.coordinates[1],
                                feature.geometry.coordinates[0]
                            ]);

                            // Show popup with data below when clicked
                            marker.bindPopup(
                                `<b>Issued Date:</b> ${feature.properties.issueddate}<br>
                                <b>Work Class Group:</b> ${feature.properties.workclassgroup}<br>
                                <b>Contractor Name:</b> ${feature.properties.contractorname}<br>
                                <b>Community Name:</b> ${feature.properties.communityname}<br>
                                <b>Original Address:</b> ${feature.properties.originaladdress}`
                            );
                            markers.addLayer(marker);
                        }
                    }
                });

                // Add MarkerClusterGroup to the map
                mymap.addLayer(markers);

                // Zoom the map out to make all markers visable
                mymap.fitBounds(markers.getBounds());
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
});
