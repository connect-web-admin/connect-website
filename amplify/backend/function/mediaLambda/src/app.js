/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
	http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "MediaDDB";
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "article_id";
const partitionKeyType = "S";
const sortKeyName = "fiscal_year";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/items";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "*")
	next()
});

/************************************
 * HTTP Get method to 最新の4つのメディア記事を取得 *
 ************************************/

app.get(path + '/latest-four-articles', async function (req, res) {
	const fiscalYear = req.query.fiscalYear;

	// 年度変わりに対応するために、前年度の記事も取得する
	const pastFiscalYear = String(Number(fiscalYear) - 1);
	const queryItemParamsPast = {
		TableName: tableName,
		IndexName: "gsiByFiscalYear",
		KeyConditionExpression: "fiscal_year = :pastFiscalYear",
		ExpressionAttributeValues: {
			":pastFiscalYear": pastFiscalYear,
		},
	};

	const queryItemParams = {
		TableName: tableName,
		IndexName: "gsiByFiscalYear",
		KeyConditionExpression: "fiscal_year = :fiscalYear",
		ExpressionAttributeValues: {
			":fiscalYear": fiscalYear,
		},
	};

	const passingData = [];

	try {
		const commandForPast = new QueryCommand(queryItemParamsPast);
		const fetchedDataPast = await ddbDocClient.send(commandForPast);
		const dataPast = fetchedDataPast.Items;

		dataPast.sort((a, b) => b.article_id - a.article_id);
		passingData.push(...dataPast);

		const command = new QueryCommand(queryItemParams);
		const fetchedData = await ddbDocClient.send(command);
		const data = fetchedData.Items;

		data.sort((a, b) => b.article_id - a.article_id);
		passingData.push(...data);

		// 最新の4件だけを残すためにupdated_atで降順ソートして5個目以降の要素は削除
		// 20250429時点、5件に増やしている
		// 20250703時点、3件に減らすよう指示があった
		const latest5 = [...passingData]
			.sort((a, b) => {
				return b.updated_at.localeCompare(a.updated_at);
			})
			.slice(0, 3);

		res.status(200).json(latest5);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message });
	}
});

/************************************
 * HTTP Get method to すべてのピックアップニュースを取得 *
 ************************************/
app.get(path + '/all-articles', async function (req, res) {
	const params = {
		TableName: tableName,
	};

	try {
		const command = new ScanCommand(params);
		const fetchedData = await ddbDocClient.send(command);
		const data = fetchedData.Items;
		// data.sort((a, b) => b.article_id - a.article_id);

		res.status(200).json(data);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message });
	}
});

/************************************
 * HTTP Get method to クリックされた1つのニュースを取得 *
 ************************************/
app.get(path + '/article' + '/:fiscalYear' + '/:articleId', async function (req, res) {
	const fiscalYear = req.params.fiscalYear;
	const articleId = req.params.articleId;

	const input = {
		TableName: tableName,
		Key: {
			article_id: articleId,
			fiscal_year: fiscalYear
		}
	}

	try {
		const command = new GetCommand(input)
		const data = await ddbDocClient.send(command)

		res.status(200).json(data.Item);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message })
	}
});

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app