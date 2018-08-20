'use strict';

const requestChains = require("./request-chains");
const retrieveWebpage = require("./retrieve-webpage");
const extract = require("./extract");
const geocode = require("./geocode");

/**
 * hydrate contributions
 *
 * @param [contribution] Array of contributions to hydrate
 *
 * successful promise returns array of hydrated contributions
 *
 */

exports.contributions = async function(contributions) {
  const hydratedContributions = [];

  for (var i = 0; i < contributions.length; i++) {
    const hydratedContribution = await hydrateContribution(contributions[i]);
    hydratedContributions.push(hydratedContribution);
  }

  return hydratedContributions;
}

async function hydrateContribution(contribution) {
  // get campaign information
  const campaignRequestChain  = requestChains.campaign({campaignId: contribution.mecid});
  const campaignHTML          = await retrieveWebpage(campaignRequestChain);

  contribution.amount                   = contribution.contribution_amount;
  contribution.campaign                 = extract.campaign(campaignHTML);
  contribution.campaign.candidate_name  = contribution.campaign.candidate_name.replace(/  /, " ");
  contribution.campaign.office          = contribution.campaign.office.replace(/  /, " ");
  contribution.campaign.name            = contribution.campaign.name.replace(/  /, " ");

  var committee = contribution.contributor_committee.trim();
  var company   = contribution.contributor_company.trim();

  if (committee) {
    contribution.contributor      = committee;
    contribution.contributor_type = "Committee";
  }
  else if (company) {
   contribution.contributor       = company;
   contribution.contributor_type  = "Company";
  }
  else {
    contribution.contributor      = [contribution.contributor_first_name, contribution.contributor_last_name].join(" ");
    contribution.contributor_type = "Individual";
  }
  
  // get address + geocode data
  const geocodeSearchAddress = contribution.address1+", "+contribution.city+", "+contribution.state+" "+contribution.zip;
  const poBoxTest = contribution.address1.toLowerCase().replace(/\./g, "").replace(/ /g, "").includes("pobox");

  if (!poBoxTest) {
    const geocodeData = await geocode(geocodeSearchAddress);

    if (geocodeData) {
      contribution.address = geocodeData.address;
      contribution.location = geocodeData.location;
    }
    else {
      contribution.address = geocodeSearchAddress;
    }
  } else {
    contribution.address = geocodeSearchAddress;
  }

  return contribution;
}
