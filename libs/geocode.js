'use strict';

var GoogleMapsAPI = require('googlemaps');
var googleMaps = new GoogleMapsAPI({
  key: process.env.google_maps_key,
  secure: true
});


/**
 * Make geocode request
 *
 * @param [address] (required string) address to search
 *
 * successful promise returns object with address + location
 *
 */

module.exports = function(address, callback) {
  return new Promise((resolve, reject) => {
    var geocodeParams = {
      address: address,
      language: 'en',
      region:   'us'
    };

    googleMaps.geocode(geocodeParams, function(err, response){
      if (err || !response.hasOwnProperty('results') || response.status == "ZERO_RESULTS") {
        console.log({err, response: JSON.stringify(response)})
        resolve(null);
      }
      else {
        var result = response.results[0];
      
        if (result.formatted_address.split(", ").reverse()[0].trim() !== "USA")
          resolve(null);

        resolve({
          address: result.formatted_address.replace(", USA", ""),
          location: result.geometry.location
        });
      }
    });
  });
}
