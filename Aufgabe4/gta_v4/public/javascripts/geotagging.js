import LocationHelper from "./location-helper.js";
import MapManager from "./map-manager.js";

const listContainer = document.querySelector("#discoveryResults");
const mapManager = new MapManager();
const cords = getCords();
const locationHelper = (cords.lat && cords.long) ? new LocationHelper(cords.lat, cords.long) : await new Promise((resolve) => {
    LocationHelper.findLocation((helper)=>resolve(helper));
});
const {tags, pages} = await fetchTags("get" , `lat=${locationHelper.latitude}&long=${locationHelper.longitude}`); //const tagList = JSON.parse(mapContainer.dataset.tags || "[]");
//const {tags, pages} = await fetchTags("get"); //load without location search for example tags to show at the start, for testing/demo purposes

class PaginationHandler {
    #page = 1;
    #pageCount;
    #container; 
    #pageView = {};
    #prevBtn; #nextBtn;
    constructor(container, pageCount) {
        this.#container = container;
        container.classList.remove("hidden");
        this.#prevBtn = this.#container.querySelector(".prev-btn");
        this.#nextBtn = this.#container.querySelector(".next-btn");
        this.#pageView.container = this.#container.querySelector(".page-number");
        this.#pageView.current = this.#pageView.container.querySelector(".current");
        this.#pageView.max = this.#pageView.container.querySelector(".max");

        this.pageCount = pageCount;

        container.querySelector(".prev-btn").addEventListener("click", ()=>{
            this.setNewPage(this.#page-1);
        });
        container.querySelector(".next-btn").addEventListener("click", ()=>{
            this.setNewPage(this.#page+1);
        });
    }

    set page(page) {
        this.#page = page;
        this.#container.querySelector(".page-number .current").innerText = page;
        if (page <= 1) this.#prevBtn.setAttribute("disabled", true);
        else this.#prevBtn.removeAttribute("disabled");
        if (page >= this.#pageCount) this.#nextBtn.setAttribute("disabled", true);
        else this.#nextBtn.removeAttribute("disabled");
    }
    get page() {
        return this.#page;
    }
    set pageCount(count) {
        this.#pageCount = count;
        this.#container.querySelector(".page-number .max").innerText = this.#pageCount;
        this.page = Math.min(1, count);
    }
    get pageCount() {
        return this.#pageCount;
    }

    async setNewPage(page) {
        const params = (new URLSearchParams(new FormData(document.querySelector("#discoveryFilterForm")))).toString()+`&page=${page}`;
        const {tags, pages} = await fetchTags("get", params);
        console.log(tags);
        clearTagList();
        addTagsToList(tags);
        mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tags);
        if (pages != this.#pageCount) this.pageCount = pages;
        else this.page = page;
    }

}
const pagHandler = new PaginationHandler(document.querySelector("nav.pagination"), pages);
initForms();
initMap(tags);
initList(tags);


function initMap(tagList) {
    const mapContainer = document.querySelector(".discovery__map");
    mapContainer.innerHTML = '<div id="map"></div>';
    mapManager.initMap(locationHelper.latitude, locationHelper.longitude); //create map
    mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tagList); //add markers
}

function initList(tagList) {
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
        const {tags, pages} = await fetchTags("get", (new URLSearchParams(new FormData(event.currentTarget))).toString());
        if (!tags) return;
        pagHandler.pageCount = pages;
        clearTagList();
        addTagsToList(tags);
        mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tags);
    });
    document.querySelector("#tag-form").addEventListener("submit", async (event)=>{
        event.preventDefault();
        const form = event.currentTarget;
        const tag = await fetchTags(form.method, JSON.stringify(Object.fromEntries(new FormData(form))));
        if (!tag) return;
        const tagEl = createListElement(tag);
        tagEl.classList.add("new")
        listContainer.prepend(tagEl);
        mapManager.addMarker(tag);
        form.reset();
        setInputCords();
        if (pagHandler.pageCount == 0) pagHandler.pageCount = 1;
    });
}

async function fetchTags(method, data) {
    method = method.toUpperCase();
    let tags, query = "", body = {}, url = "/api/pag/geotags/";
    if (method == "GET") query = "?"+data;
    else body = {headers: {"Content-Type": "application/json"}, body: data};
    if (method != "GET") url = "/api/geotags/"; //for pagination
    try {
        const response = await fetch(url+query/* `/api/geotags/${query}` */, {
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