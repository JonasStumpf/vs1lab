import LocationHelper from "./location-helper.js";
import MapManager from "./map-manager.js";
// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
//console.log("The geoTagging script is going to start...");


/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    //alert("Please change the script 'geotagging.js'");
    updateLocation();
});

async function updateLocation() {
    const mapManager = new MapManager();
    const cords = getCords();
    const locationHelper = (cords.lat && cords.long) ? new LocationHelper(cords.lat, cords.long) : await new Promise((resolve) => {
        LocationHelper.findLocation((helper)=>{
            resolve(helper);
        });
    });

    for (const latInput of document.querySelectorAll("input.js-lat")) {
        latInput.value = locationHelper.latitude;
    }
    for (const longInput of document.querySelectorAll("input.js-long")) {
        longInput.value = locationHelper.longitude;
    }
    document.querySelector(".discovery__map").innerHTML = '<div id="map"></div>';
    mapManager.initMap(locationHelper.latitude, locationHelper.longitude);
    mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude);
}

function getCords() {
    return {
        lat: document.querySelector("input.js-lat").value,
        long: document.querySelector("input.js-long").value
    };
}