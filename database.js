'use strict';

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-2" });
const dynamo = new AWS.DynamoDB.DocumentClient();

const table = "momoney_contributions";

exports.query = function({query, queryValues, queryNames}) {
  return new Promise((resolve, reject) => {

    const queryObject = {
      TableName: table,
      KeyConditionExpression: query,
      ExpressionAttributeValues: queryValues,
      ExpressionAttributeNames: queryNames
    };

    dynamo.query(queryObject, (err, response) => {
      if (err)
        reject(err);
      else
        resolve(response.Items);
    });
  });
}

exports.write = function(record) {
  return new Promise((resolve, reject) => {
    const writeRecord = {
      TableName: table,
      Item: record
    };

    dynamo.put(writeRecord, (err, response) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
}
