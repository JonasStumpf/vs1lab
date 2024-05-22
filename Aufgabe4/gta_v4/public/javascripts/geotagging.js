import LocationHelper from "./location-helper.js";
import MapManager from "./map-manager.js";

const listContainer = document.querySelector("#discoveryResults");
const mapManager = new MapManager();
const cords = getCords();
const locationHelper = (cords.lat && cords.long) ? new LocationHelper(cords.lat, cords.long) : await new Promise((resolve) => {
    LocationHelper.findLocation((helper)=>resolve(helper));
});
const tagList = await fetchTags("get"); //const tagList = JSON.parse(mapContainer.dataset.tags || "[]");


initForms();
initMap();
initList();




function initMap() {
    const mapContainer = document.querySelector(".discovery__map");
    mapContainer.innerHTML = '<div id="map"></div>';
    mapManager.initMap(locationHelper.latitude, locationHelper.longitude); //create map
    mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tagList); //add markers
}

function initList() {
    addTagsToList(tagList);
    //move to marker on list-element click
    listContainer.addEventListener("click", ()=>{
        let target = event.target;
        while (target && target != event.currentTarget && !target.dataset.id) {
            target = target.parentElement;
        }
        if (!target.dataset.id) return;
        mapManager.goToMarker(target.dataset.id);
    });
}

function initForms() {
    setInputCords();
    document.querySelector("#discoveryFilterForm").addEventListener("submit", async (event)=>{
        event.preventDefault();
        const tags = await fetchTags("get", (new URLSearchParams(new FormData(event.currentTarget))).toString());
        if (!tags) return;

        clearTagList();
        addTagsToList(tags);
        mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tags);
    });
    document.querySelector("#tag-form").addEventListener("submit", async (event)=>{
        event.preventDefault();
        const form = event.currentTarget;
        const tag = await fetchTags(form.method, JSON.stringify(Object.fromEntries(new FormData(form))));
        if (!tag) return;

        listContainer.prepend(createListElement(tag));
        mapManager.addMarker(tag);
        form.reset();
        setInputCords();
    });
}

async function fetchTags(method, data) {
    method = method.toUpperCase();
    let tags, query = "", body = {};
    if (method == "GET") query = "?"+data;
    else body = {headers: {"Content-Type": "application/json"}, body: data};
    try {
        const response = await fetch(`/api/geotags/${query}`, {
            method: method, 
            ...body
        });
        if (!response.ok) throw new Error(response.status+" "+response.statusText);
        tags = await response.json();
    } catch (error) {
        console.warn(error);
        tags = false;
    }
    return tags;
}

function clearTagList() {
    listContainer.innerHTML = "";
}
function addTagsToList(tags) {
    for (const tag of tags) {
        listContainer.append(createListElement(tag));
    }
}
function createListElement(data) {
    const container = document.createElement("li");
    container.innerHTML = `<button data-id="${data.id}">${data.name} (${data.latitude},${data.longitude})<span>${data.hashtag}</span></button>`;
    return container;
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