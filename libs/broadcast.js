/*

  Note (8/18/2018):

  Since July of 2018, Twitter has been locking down access to their API. Currently, MO Money
  does not have access to the API to push tweets to Twitter. In the meantime, contributions
  and the associated images are sent via email and manually tweeted

*/

'use strict';

var generateImage = require("../libs/generate-image");

var TwitterAPI = require("twit");
var twitter = new TwitterAPI({
  consumer_key: process.env.twitter_consumer_key,
  consumer_secret: process.env.twitter_consumer_secret,
  access_token: process.env.twitter_access_token,
  access_token_secret: process.env.twitter_access_token_secret
});

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const ses = new AWS.SES({region: 'us-east-1', apiVersion: '2010-12-01'});

const s3Bucket = "momoney-images";

module.exports = async function(contributions) {
  for (var i = 0; i < contributions.length; i++) {
    await broadcast(contributions[i]);
  }
}

/**
 * sends a tweet
 *
 * @param [contribution] (required object) an hydrated contribution
 *
 * successful promise returns nothing
 *
 */

async function broadcast(contribution) {
  const image = await generateImage(contribution);

  // upload to s3 + email
  const image_name = contribution.created+".png";
  await uploadImageToS3(image, image_name);
  
  const image_url = "https://s3.amazonaws.com/"+s3Bucket+"/" + image_name;
  const body = generateTweet(contribution)+"<br><br>"+image_url;
  await sendEmail(body);

  // tweet
  // const media = await twitter.post("media/upload", {media_data: image});

  // const tweetParameters = {
  //   status: generateTweet(contribution),
  //   media_ids: [media.media_id_string]
  // };

  // if ("location" in contribution) {
  //   tweetParameters.lat                 = contribution.location.lat;
  //   tweetParameters.long                = contribution.location.lng;
  //   tweetParameters.display_coordinates = true;
  // }

  // console.log({tweetParameters});

  // const tweet = await twitter.post("statuses/update", tweetParameters);
}

function uploadImageToS3(image, name) {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      Bucket: s3Bucket,
      Key: name,
      ContentType: "image/png",
      Body: image,
      ACL: 'public-read'
    };

    console.log({uploadParams})

    s3.upload(uploadParams, (err, response) => {
      if (err)
        reject(err)
      else
        resolve(response)
    });
  });
}

function sendEmail(body) {
  return new Promise((resolve, reject) => {
    const sendObj = { 
      Source: process.env.email,
      Destination: { ToAddresses: [process.env.email] },
      Message: {
        Subject: { Data: "New MO Money Contribution - "+(new Date().getTime()) },
        Body: {
          Html: { Data: body }
        }
      }
    };
    
    ses.sendEmail(sendObj, (err, data) => {
      if (err)
        reject(err);
      else
        resolve(data);
    });
  });
}

function generateTweet(contribution) {
  const amount   = contribution.amount,
        campaign = contribution.campaign,
        state    = contribution.state.trim(),
        city     = contribution.city.trim();

  const type     = campaign.type,
        office   = campaign.office,
        location = state == "MO" ? city : [city, state].join(", ");

  let name       = type == "Candidate" ? campaign.candidate_name : campaign.name;

  if (type == "Candidate") {
    const party = campaign.party == "Democrat" ? "Democratic" : campaign.party;
    name = [name, "- a", party, "candidate for", office, "-"].join(" ");
  }

  const tweet = [name, "received", amount, "from a donor in", location];

  return tweet.join(" ");
}
