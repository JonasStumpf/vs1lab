// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const GeoTagList = new GeoTagStore();

// App routes (A3)
//default start page
const defaultRender = (req, res)=>{
  res.render('index', { 
    taglist: res._taglist || GeoTagList.getAllGeoTags(15),
    location: {lat, long} = req.body
  });
}
//check if cords are set for POST requests
const checkLocation = (req, res, next)=>{
  const data = req.body;
  if (!data.lat || !data.long) {
    defaultRender(req, res);
    return;
  }
  next();
}
/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */
router.get('/', defaultRender);

router.post("/tagging", checkLocation, (req, res)=>{
  const data = req.body;
  GeoTagList.addGeoTag([data.name, data.lat, data.long, data.tag]);
  res._taglist = GeoTagList.getNearbyGeoTags(data);
  defaultRender(req, res);
});

router.post("/discovery", checkLocation, (req, res)=>{
  const  data = req.body;
  res._taglist = GeoTagList.searchNearbyGeoTags(data.search, data);
  defaultRender(req, res);
});


// API routes (A4)
/* pagination */
const pagItemsPerPage = 3;
router.get('/api/pag/geotags', (req, res, next)=>{
  const data = req.query;
  const tags = GeoTagList.searchNearbyGeoTags(data.search, data);
  const startIndex = (data.page) ? (data.page - 1) * pagItemsPerPage : 0;
  res.json( {
    pages: Math.ceil(tags.length / pagItemsPerPage),
    tags: (data.page < 0) ? [] : tags.slice(startIndex, startIndex + pagItemsPerPage)
  } );
});

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */
// TODO: ... your code here ...
router.get('/api/geotags', (req, res, next)=>{
  const data = req.query;
  res.json( GeoTagList.searchNearbyGeoTags(data.search, data) );
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */
// TODO: ... your code here ...
router.post('/api/geotags', (req, res, next)=>{
  const data = req.body;
  let tag;
  try {
    tag = GeoTagList.addGeoTag([data.name, data.lat, data.long, data.tag]);
  } catch (error) {
    res.status(400).send({error: 'GeoTag data missing.'});
    return;
  }
  res.location(`/api/geotags/${tag.id}`);
  res.status(201);
  res.json( tag );
});


const getTag = (req, res, next)=>{
  const tag = GeoTagList.getGeoTag(req.params.id);
  if (!tag) {
    res.sendStatus(404);
    return;
  }
  res._tag = tag;
  next();
}
/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */
// TODO: ... your code here ...
router.get('/api/geotags/:id', getTag, (req, res, next)=>{
  res.json( res._tag );
});

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */
// TODO: ... your code here ...
router.put('/api/geotags/:id', getTag, (req, res, next)=>{
  res.json( GeoTagList.updateGeoTag(res._tag, req.body) );
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */
// TODO: ... your code here ...
router.delete('/api/geotags/:id', getTag, (req, res, next)=>{
  res.json( GeoTagList.deleteGeoTag(res._tag) );
});



module.exports = router;
