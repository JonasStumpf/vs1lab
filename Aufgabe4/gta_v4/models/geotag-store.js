// File origin: VS1LAB A3

const GeoTag = require('./geotag');

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{
    #list = [];

    constructor() {
        const GeoTagExamples = require('../models/geotag-examples');
        for (const tagInfo of GeoTagExamples.tagList) {
            this.addGeoTag(tagInfo);
        }
    }

    /**
     * get GeoTags that are within a radius of a location
     * @param {Object} location location to search around
     * @param {Number} location.lat latitude of location
     * @param {Number} location.long longitude of location
     * @param {Number} [radius=5] radius to search in km
     * @returns list with GeoTags that are within the radius
     */
    getNearbyGeoTags(location, radius = 5) {
        return (location.lat && location.long) ? this.#list.filter((item)=>item.getDistance(location) < radius*1000) : this.getAllGeoTags();
    }

    /**
     * get GeoTags that are withing a radius of a location and (partially) match a keyword
     * @param {String} keyword keyword to search for
     * @param {Object} location location to search around
     * @param {Number} location.lat latitude of location
     * @param {Number} location.lon longitude of location
     * @param {Number} [radius=5] radius to search in km
     * @returns list with GeoTags that are within the radius and match the keyword
     */
    searchNearbyGeoTags(keyword, location, radius) {
        const tags = this.getNearbyGeoTags(location, radius);
        return keyword ? tags.filter((item)=>item.matchesKeyword(keyword)) : tags;
    }

    addGeoTag(tagInfo) {
        const tag = new GeoTag(...tagInfo);
        this.#list.push(tag);
        return tag;
    }
    removeGeoTag(name) {
        this.#list = this.#list.filter((item)=>item.name != name);
    }
    deleteGeoTag(id) {
        for (let i = 0; i < this.#list.length; i++) {
            const tag = this.#list[i];
            if (tag.id != id) continue;
            this.#list.splice(i, 1);
            return tag;
        }
        return false;
    }
    updateGeoTag(id, data = {}) {
        const tag = this.getGeoTag(id);
        if (!tag) return false;
        tag.update(data.name, data.lat, data.long, data.hashtag);
        return tag;
    }
    getGeoTag(id) {
        for (const tag of this.#list) {
            if (tag.id == id) return tag;
        }
        return false;
    }
    getAllGeoTags(limiter = 0) {
        return limiter ? this.#list.slice(0, limiter) : this.#list;
    }
}

module.exports = InMemoryGeoTagStore
