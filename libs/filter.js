'use strict';

const database = require("../database");

exports.contributions = async function(scrapedContributions, timeToCheckFrom) {
  const newContributions = [];

  // subtract forty-eight hours and seven minutes
  timeToCheckFrom.subtract(173320, "seconds");

  const queryOptions = {
    table: "momoney_contributions",
    query: "#type = :type and #created > :created",
    queryNames: { "#type": "type", "#created": "created" },
    queryValues: { ":type": "contribution", ":created": timeToCheckFrom.valueOf() }
  };

  const storedContributions = await database.query(queryOptions);
  console.log({storedContributionsLength: storedContributions.length, storedContributions});

  for (var i = 0; i < scrapedContributions.length; i++) {
    const scrapedContribution = scrapedContributions[i];

    let isNewContribution = true;

    for (var j = 0; j < storedContributions.length; j++) {
      if (sameObject(storedContributions[j], scrapedContribution)) {
        isNewContribution = false;
        break;
      }
    }

    if (isNewContribution)
      newContributions.push(scrapedContribution);
  }

  return newContributions;
}

function sameObject(ogObj, newObj) {
  let same = true;

  for (var key in ogObj) {
    if (newObj.hasOwnProperty(key) && key !== "created" && key !== "type") {
      if (ogObj[key] !== newObj[key]) {
        same = false;
        break;
      }
    }
  }

  return same;
}
