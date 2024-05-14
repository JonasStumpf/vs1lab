// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** * 
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    /**
     * 
     * @param {String} name 
     * @param {Number} lat 
     * @param {Number} long 
     * @param {String} hastag 
     */
    constructor(name, lat, long,  hastag) {
        if (!name || !lat || !long) throw new Error("GeoTag information missing.");
        this.name = name;
        this.latitude = lat;
        this.longitude = long;
        this.hashtag = hastag;
    }
    
    /**
     * get distance between the GeoTag and a coordinate
     * @param {Object} cord coordinate to get distance to
     * @param {Number} cord.lat latutide of cord
     * @param {Number} cord.long longitude of cord
     * @returns 
     */
    getDistance(cord) { //return distance this and a given cord -> http://www.movable-type.co.uk/scripts/latlong.html
        const radLat1 = this.latitude * Math.PI/180, radLat2 = cord.lat * Math.PI/180, radLonDiff = (cord.lon - this.longitude) * Math.PI/180, R = 6371e3;
        const d = Math.acos( Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1)*Math.cos(radLat2) * Math.cos(radLonDiff) ) * R;
        return d;
    }

    /**
     * Checks name and hashtag for a partial match of a given keyword
     * @param {String} keyword keyword to compare to
     * @returns boolean
     */
    matchesKeyword(keyword) {
        keyword = keyword.toLowerCase();
        return this.name.toLowerCase().includes(keyword) || this.hashtag.toLowerCase().includes(keyword);
    }
}

module.exports = GeoTag;
