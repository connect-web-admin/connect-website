
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
	http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "ConnecterDDB";
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV;
}

const matchDDBTable = "MatchDDB-dev"

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "connecter_id";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
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

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/
app.get(path + '/object' + hashKeyPath + '/:fiscal_year', async function (req, res) {
	/*************************************
	 * ConnecterDDBからコネクターの情報を取得 *
	 *************************************/
	const connecterId = req.params.connecter_id
	const fiscalYear = req.params.fiscal_year
	let fetchedDataFromConnecterDDB = []
	let fetchedDataFromMatchDDB = []

	const input = {
		TableName: tableName,
		Key: {
			connecter_id: connecterId
		}
	}

	try {
		const command = new GetCommand(input)
		fetchedDataFromConnecterDDB = await ddbDocClient.send(command)
		console.log(fetchedDataFromConnecterDDB)
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message })
	}

	// 取得したコネクターが結果登録するべき対象試合をMatchDDBから絞り込むために、コネクターに登録されているchampionship_idをまとめておく	
	// const championshipIds = fetchedDataFromConnecterDDB['matches_to_register_result'].map(item => item.championship_id)

	// 取得したコネクターが結果登録するべき対象試合をMatchDDBから絞り込むために、
	// コネクターに登録されているchampionship_idとmatch_idをまとめておく
	const championshipIdsAndMatchIds = []
	fetchedDataFromConnecterDDB.Item['matches_to_register_result'].forEach(item => championshipIdsAndMatchIds.push(item))

	/*********************************
	 * MatchDDBから情報を取得 *
	 *********************************/
    const queryParams = {
        TableName: matchDDBTable,
		IndexName: "gsiByFiscalYear",
		KeyConditionExpression: "fiscal_year = :fiscal_year",
		ExpressionAttributeValues: {
            ":fiscal_year": fiscalYear
		}
    }

    try {
		const command = new QueryCommand(queryParams)
        fetchedDataFromMatchDDB = await ddbDocClient.send(command)

		/*********************************
		 * 結果登録すべき試合を抽出 *
		 *********************************/
		let matchInfoToReturn = []
		for (const cidInConnecterDDB of championshipIdsAndMatchIds) { // ■ 5thBirdsCupなどの大会名を一つ取り出す
			for (const championship of fetchedDataFromMatchDDB.Items) { // ▲ 大会アイテムを一つ取り出す
				if (cidInConnecterDDB['championship_id'] === championship['championship_id']) {
					for (const midInConnecterDDB of cidInConnecterDDB['match_ids']) { // ■ championship_idの大会に属するmatch_idを一つずつ取り出す
						for (const round in championship['matches']) { // ▲ 大会アイテムのmatchesからround（に相当するもの）を一つ取り出す
							for (const match in championship['matches'][round]) { // ▲ 大会アイテムのroundからmatch（に相当するもの）を一つ取り出す
								const matchId = championship['matches'][round][match]['match_id']
								if (midInConnecterDDB === matchId) {
									const objGroup = {championshipName: '', match: {}}
									objGroup.championshipName = championship['championship_name']
									objGroup.match = championship['matches'][round][match]

									matchInfoToReturn.push(objGroup)
								}
							}
						}
					}
				}
			}
		}

		res.status(200).json(matchInfoToReturn)
    } catch (err) {
        res.statusCode = 500
        res.json({ error: 'Could not load items: ' + err.message })
    }
})

/************************************
* HTTP put method for insert object *
*************************************/
app.put(path + "/register_match_result", async function (req, res) {
	const fiscalYear = req.body.fiscalYear
	const championshipId = req.body.championshipId
	const matchId = req.body.matchId
	const userAttrSub = req.body.userAttrSub

	// 取得したアイテムを保持
	let originalData = []

	const getItemParams = {
		TableName: tableName,
		Key: {
			connecter_id: userAttrSub
		}
	}

	try {
		const command = new GetCommand(getItemParams)
		const data = await ddbDocClient.send(command)

		originalData = data.Item
	} catch (err) {
		console.error('Error getting data:', err)
		res.status(500).json({ success: false, error: 'Error getting data' })
	}

	// match_idで該当の試合を検索しデータを追加
	let updated = false
	for (const match of originalData['live_reporting_matches']) {
		if (match['match_id'] === matchId) {
			match['is_match_ended'] = true
			updated = true
		}
	}

	if (!updated) {
		res.status(404).json({ message: 'Match not found' })
		return
	}

	// 更新したアイテムを保存
	try {
		const params = {
			TableName: tableName,
			Key: {
				'connecter_id': userAttrSub
			},
			UpdateExpression: 'SET live_reporting_matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': originalData.live_reporting_matches
			},
			ReturnValues: 'UPDATED_NEW'
		}

		const result = await ddbDocClient.send(new UpdateCommand(params))
		console.log('Update successful:', result)
		res.status(200).json(result)
	} catch (err) {
		console.error('Error updating data:', err)
		res.status(500).json({ success: false, error: 'Error adding data' })
	}
})

/************************************
* HTTP put method for insert object *
*************************************/
app.put(path + "/complete_registering_players", async function (req, res) {
	const fiscalYear = req.body.fiscalYear
	const championshipId = req.body.championshipId
	const matchId = req.body.matchId
	const userAttrSub = req.body.userAttrSub

	// 取得したアイテムを保持
	let originalData = []

	const getItemParams = {
		TableName: tableName,
		Key: {
			connecter_id: userAttrSub
		}
	}

	try {
		const command = new GetCommand(getItemParams)
		const data = await ddbDocClient.send(command)

		originalData = data.Item
	} catch (err) {
		console.error('Error getting data:', err)
		res.status(500).json({ success: false, error: 'Error getting data' })
	}

	// match_idで該当の試合を検索しデータを上書き
	let updated = false
	for (const match of originalData['live_reporting_matches']) {
		if (match['match_id'] === matchId) {
			match['is_players_registered'] = true
			updated = true
		}
	}

	if (!updated) {
		res.status(404).json({ message: 'Match not found' })
		return
	}

	// 更新したアイテムを保存
	try {
		const params = {
			TableName: tableName,
			Key: {
				'connecter_id': userAttrSub
			},
			UpdateExpression: 'SET live_reporting_matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': originalData.live_reporting_matches
			},
			ReturnValues: 'UPDATED_NEW'
		}

		const result = await ddbDocClient.send(new UpdateCommand(params))
		console.log('Update successful:', result)
		res.status(200).json(result)
	} catch (err) {
		console.error('Error updating data:', err)
		res.status(500).json({ success: false, error: 'Error adding data' })
	}
})

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app