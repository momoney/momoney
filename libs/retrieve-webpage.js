'use strict';

const request = require("request-promise-native");
const cheerio = require("cheerio");

/**
 *
 * calls each element in a requestChain and passes stateParameters from previous request
 *
 * @param [requestChain] (required, array)  A requestChain from request_chains.js which contains 
 *                                          objects that contains successive http requests to submit
 *                                          state + parameters to simulate clicks on .NET based sites
 *
 * @param [requestChain[n].url]                       (required, string)
 * @param [requestChain[n].method]                    (required, string)
 * @param [requestChain[n].parameters]                (optional, string)
 * @param [requestChain[n].form_state_parameters_id]  (optional, string)  css selector for .NET form
 *                                                                        that has state parameters
 *
 * successful promise contains the responseBody of the last http request in the chain
 *
 */

module.exports = async function(requestChain) {
  let stateParameters, responseBody;

  for (var i = 0; i < requestChain.length; i++) {
    const requestChainElement = requestChain[i];
    ({ stateParameters, responseBody } = await doRequest(requestChainElement, stateParameters));
  }

  return responseBody;
}


/**
 *
 * performs an http request based on a single Object from a requestChain + stateParameters (if any)
 *
 * @param [requestChainElement] A single Object from a requestChain array
 * @param [stateParameters] (Optional) State parameters from a previous request
 *
 * successful promise will contain an object with any new stateParameters + request responseBody
 *
 */

async function doRequest(requestChainElement, stateParameters) {
  const requestOptions = buildRequest(requestChainElement, stateParameters);
  const responseBody = await request(requestOptions);

  // get state parameters from webpage data
  if ("form_state_parameters_id" in requestChainElement) {
    const formStateParametersId = requestChainElement.form_state_parameters_id;

    const $ = cheerio.load(responseBody);
    const serializedStateParameters = $(formStateParametersId).serializeArray();
    stateParameters = objectifySerializedArray(serializedStateParameters);
  }

  return { stateParameters, responseBody };
}


/**
 *
 * builds the options for a request formatted for the request library (github.com/request/request)
 *
 * @param [requestChainElement] A single Object from a requestChain array
 * @param [stateParameters] (Optional) State parameters from a previous request
 *
 * returns an Object containing options for a request 
 *
 */

function buildRequest(requestChainElement, stateParameters) {
  const reqObj = requestChainElement;

  // stringify combined parameters from the requestChain (if any) + the state parameters from
  // the previous request in the chain (if any)
  const parameters = stringifyParameters(
    Object.assign(stateParameters || {}, reqObj.parameters || {})
  );

  // add parameters to the url if using the GET method (and parameters exist)
  const url = reqObj.method == "GET" && "parameters" in reqObj 
    ? [reqObj.url, parameters].join("?") : reqObj.url;

  const requestOptions = {
    url: url,
    method: reqObj.method,
    simple: false, // does not reject promise due to errored status codes, important for 302s
    jar: true // enable cookies (more .NET state stored here)
  };

  // add parameters to the request body + set content-type if using the POST method
  if (reqObj.method == "POST") {
    requestOptions.body = parameters;
    requestOptions.headers = { "Content-type": "application/x-www-form-urlencoded" };
  }

  return requestOptions;
}


/**
 *
 * build objectified parameters from serialized form
 *
 * @param [parameters] Array of objects that contains parameters (ie [{"name": "id", "value": 42}])
 *
 * returns object of parameters (ie {id: 42})
 */

function objectifySerializedArray(parameters) {
  var obj = {};

  for (var i = 0; i < parameters.length; i++) {
    obj[parameters[i].name] = parameters[i].value;
  };

  return obj;
}


/**
 *
 * build stringified parameters
 *
 * @param [parameters] Object that contains parameters for call (ie {id: 42})
 *
 * returns string with url encoded parameters
 */

function stringifyParameters(parameters) {
  var url = [];

  for (var key in parameters) {
    var value = parameters[key];

    if (typeof value == "object") {
      for (var i = 0; i < value.length; i++) {
        var obj = value[i];
        for (var k in obj) {
          url.push([encodeURIComponent(k), encodeURIComponent(obj[k])].join("="));
        }
      };
    } 
    else {
      url.push([encodeURIComponent(key), encodeURIComponent(value)].join("="));  
    }
  }

  return url.join("&");
}
