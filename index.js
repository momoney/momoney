'use strict';

const moment          = require("moment-timezone");

const requestChains   = require("./libs/request-chains");
const retrieveWebpage = require("./libs/retrieve-webpage");
const extract         = require("./libs/extract");
const write           = require("./libs/write");
const filter          = require("./libs/filter");
const hydrate         = require("./libs/hydrate");
const broadcast       = require("./libs/broadcast");

exports.handler = async function(event) {
  await main().catch(console.log);
}

async function main() {
  const now = moment().tz("America/Chicago");
  const timeToCheckFrom = now.clone().subtract(3, "days").set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});

  console.log({now, timeToCheckFrom, timeToCheckFromTimestamp: timeToCheckFrom.valueOf()});

  const contributionsRequestChain = requestChains.largeContributions({timeToCheckFrom});
  const contributionsHTML = await retrieveWebpage(contributionsRequestChain);
  
  const allContributions = extract.contributions(contributionsHTML);

  console.log({allContributionsLength: allContributions.length, allContributions});

  if (!allContributions.length)
    return;

  const newContributions = await filter.contributions(allContributions, timeToCheckFrom);

  console.log({newContributionsLength: newContributions.length, newContributions});

  if (!newContributions.length)
    return;

  const writtenContributions = await write.contributions(newContributions);
  const hydratedContributions = await hydrate.contributions(writtenContributions);

  console.log({hydratedContributions});

  await broadcast(hydratedContributions);

  return;
}
