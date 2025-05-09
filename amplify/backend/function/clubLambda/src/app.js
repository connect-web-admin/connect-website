/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
	http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed oa n an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION })
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)

let tableName = "ClubDDB"
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV;
}

const partitionKeyName = "club_id"
const partitionKeyType = "S"
const sortKeyName = "location"
const sortKeyType = "S"
const hasSortKey = sortKeyName !== ""
const path = "/items"
const UNAUTH = 'UNAUTH'
const hashKeyPath = '/:' + partitionKeyName
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : ''
const gsiPartitionKeyName = "membership_state"
const gsiHashKeyPath = '/:' + gsiPartitionKeyName


// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "*")
	next()
})

/*****************************************
 * HTTP Get method for get match info to read latest match results *
 *****************************************/
app.get(path + gsiHashKeyPath, async function (req, res) {
	const membershipState = req.params.membership_state

	const queryParams = {
		TableName: tableName,
		IndexName: "getActiveClubInfo",
		KeyConditionExpression: "membership_state = :value",
		ExpressionAttributeValues: {
			":value": membershipState,
		},
	}

	try {
		const data = await ddbDocClient.send(new QueryCommand(queryParams))
		res.json(data.Items)
	} catch (err) {
		res.statusCode = 500
		res.json({ error: 'Could not load items: ' + err.message })
	}
})

app.listen(3000, function () {
	console.log("App started")
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
