import LocationHelper from "./location-helper.js";
import MapManager from "./map-manager.js";

const listContainer = document.querySelector("#discoveryResults");
const mapManager = new MapManager();
const cords = getCords();
const locationHelper = (cords.lat && cords.long) ? new LocationHelper(cords.lat, cords.long) : await new Promise((resolve) => {
    LocationHelper.findLocation((helper)=>{
        resolve(helper);
    });
});

init();


document.querySelector("#discoveryFilterForm").addEventListener("submit", async (event)=>{
    event.preventDefault();
    const form = event.currentTarget;
    const reqParams = (new URLSearchParams(new FormData(form))).toString();
    let tags;
    try {
        const response = await fetch(`/api/geotags/?${reqParams}`, {
            method: "GET",
        });
        if (!response.ok) throw new Error(response.status+" "+response.statusText);
        tags = await response.json();
    } catch (error) {
        console.warn(error);
        tags = false;
    }
    if (!tags) return;
    clearTagList();
    for (const tag of tags) {
        addTagToList(tag);
    }
    mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tags);
});
document.querySelector("#tag-form").addEventListener("submit", async (event)=>{
    event.preventDefault();
    const form = event.currentTarget;
    let tag;
    try {
        const response = await fetch("/api/geotags", {
            method: form.method.toUpperCase(),
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error(response.status+" "+response.statusText);
        tag = await response.json();
    } catch (error) {
        console.warn(error);
        tag = false;
    }
    if (!tag) return;
    addTagToList(tag, true);
    mapManager.addMarker(tag);
    form.reset();
    setInputCords();
});


function clearTagList() {
    listContainer.innerHTML = "";
}
function addTagToList(tag, pre = false) {
    const item = createListElement(tag);
    if (pre) listContainer.prepend(item);
    else listContainer.append(item);
}
function createListElement(data) {
    const container = document.createElement("li");
    container.innerHTML = `<button data-id="${data.id}">${data.name} (${data.latitude},${data.longitude})<span>${data.hashtag}</span></button>`;
    return container;
}


function init() {
    setInputCords();
    const mapContainer = document.querySelector(".discovery__map");
    mapContainer.innerHTML = '<div id="map"></div>';

    const tagList = JSON.parse(mapContainer.dataset.tags || "[]");
    mapManager.initMap(locationHelper.latitude, locationHelper.longitude);
    mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tagList);

    listContainer.addEventListener("click", ()=>{
        let target = event.target;
        while (target && target != event.currentTarget && !target.dataset.id) {
            target = target.parentElement;
        }
        if (!target.dataset.id) return;
        mapManager.goToMarker(target.dataset.id);
    });
}
function setInputCords() {
    for (const latInput of document.querySelectorAll("input.js-lat")) {
        latInput.value = locationHelper.latitude;
    }
    for (const longInput of document.querySelectorAll("input.js-long")) {
        longInput.value = locationHelper.longitude;
    }
}
function getCords() {
    return {
        lat: document.querySelector("input.js-lat").value,
        long: document.querySelector("input.js-long").value
    };
}