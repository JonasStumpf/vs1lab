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
    static id = 0;
    
    #id; //prevent changing id
   get id() {return this.#id;}
    toJSON() { //private variables are ignored in JSON.stringify, so override it
        return {
            ...this,
            id: this.#id
        }
    }

    /**
     * 
     * @param {String} name 
     * @param {Number} lat 
     * @param {Number} long 
     * @param {String} hashtag 
     */
    constructor(name, lat, long,  hashtag) {
        if (!name || !lat || !long) throw new Error("GeoTag information missing.");

        this.#id = GeoTag.id;
        GeoTag.id += 1;
        
        this.name = name;
        this.latitude = lat;
        this.longitude = long;
        this.hashtag = hashtag;
    }

    update(name, lat, long, hashtag) {
        if (name) this.name = name;
        if (lat) this.latitude = lat;
        if (long) this.longitude = long;
        if (hashtag) this.hashtag = hashtag;
    }
    
    /**
     * get distance between the GeoTag and a coordinate
     * @param {Object} cord coordinate to get distance to
     * @param {Number} cord.lat latutide of cord
     * @param {Number} cord.long longitude of cord
     * @returns 
     */
    getDistance(cord) { //return distance this and a given cord -> http://www.movable-type.co.uk/scripts/latlong.html
        const radLat1 = this.latitude * Math.PI/180, radLat2 = cord.lat * Math.PI/180, radLonDiff = (cord.long - this.longitude) * Math.PI/180, R = 6371e3;
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
