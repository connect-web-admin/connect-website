
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION })
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)

let tableName = "TopicsDDB"
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV
}

const partitionKeyName = "category"
const partitionKeyType = "S"
const sortKeyName = "fiscal_year"
const sortKeyType = "S"
const hasSortKey = sortKeyName !== ""
const path = "/items"
const UNAUTH = 'UNAUTH'
const hashKeyPath = '/:' + partitionKeyName
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : ''

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
app.get(path + '/objects' + sortKeyPath, async function (req, res) {
	const fiscalYear = req.params.fiscal_year

	const queryParams = {
		TableName: tableName,
		IndexName: "filterByFiscalYear",
		KeyConditionExpression: "fiscal_year = :fiscal_year",
		ExpressionAttributeValues: {
			":fiscal_year": fiscalYear
		}
	}

	try {
		const data = await ddbDocClient.send(new QueryCommand(queryParams))
		res.statusCode = 200
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