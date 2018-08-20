'use strict';

const database = require("../database");

exports.contributions = async function(contributions) {
  const writtenContributions = [];

  for (var i = 0; i < contributions.length; i++) {
    const contribution = contributions[i];
    contribution.type = "contribution";
    contribution.created = new Date().getTime();

    await database.write(contribution);
    writtenContributions.push(contribution);
  }

  return writtenContributions;
};
