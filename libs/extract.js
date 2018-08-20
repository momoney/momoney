'use strict';

const cheerio = require("cheerio");

exports.contributions = function(body) {
  const $ = cheerio.load(body);

  const headers = [];
  const data = [];

  $("table tr").each(function(i, tr) {
    if (i == 0) { // headers
      $(tr).find('th').each(function(j, th) {
        const value = processHeaders($(th).text());
        headers.push(value);
      });
    }
    else {
      const thisData = {};

      $(tr).find('td').each(function(j, td) {
        thisData[headers[j]] = $(td).text();
      });

      data.push(thisData);
    }
  });

  return data;
}

exports.campaign = function(body) {
  const ids = {
    name           : "#ContentPlaceHolder_ContentPlaceHolder1_lblCommName",
    type           : "#ContentPlaceHolder_ContentPlaceHolder1_lblCommType",
    address_line1  : "#ContentPlaceHolder_ContentPlaceHolder1_lblCommAdd",
    address_line2  : "#ContentPlaceHolder_ContentPlaceHolder1_lblCommCSZ",
    candidate_name : "#ContentPlaceHolder_ContentPlaceHolder1_lblCandName",
    party          : "#ContentPlaceHolder_ContentPlaceHolder1_lblParty",
    office         : "#ContentPlaceHolder_ContentPlaceHolder1_grvElecHistory_lblSub_0",
    office_year    : "#ContentPlaceHolder_ContentPlaceHolder1_grvElecHistory_lblElecYear_0"
  };
  
  const $ = cheerio.load(body);

  const campaign = {};

  for (const id in ids) {
    campaign[id] = $(ids[id]).text().trim();
  }

  return campaign;
}

function processHeaders(header) {
  return header.toLowerCase().replace("-", " ").replace("\/", " ").replace(/ /g, "_");
}
