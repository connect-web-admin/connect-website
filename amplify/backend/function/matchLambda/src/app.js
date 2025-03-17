/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
	http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')
const jwt = require("jsonwebtoken");

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "MatchDDB";
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "championship_id";
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

// オブジェクトの空判定
function isEmptyObj(obj) {
	return Object.keys(obj).length === 0;
}

/************************************
* HTTP Get method 速報対象試合検索画面へのアクセス許可を判定 *
* 試合当日から見て、前日の午前8時から翌日の23時59分までアクセス可能にする *
************************************/
app.get(path + '/current-matches', async function (req, res) {
	const fiscalYear = req.query.fiscalYear;

	const queryItemParams = {
		TableName: tableName,
		IndexName: "gsiByFiscalYear",
		KeyConditionExpression: "fiscal_year = :fiscalYear",
		ExpressionAttributeValues: {
			":fiscalYear": fiscalYear,
		},
	};

	try {
		const command = new QueryCommand(queryItemParams);
		const fetchedData = await ddbDocClient.send(command);
		const data = fetchedData.Items;

		// アクセスを試行する日が、今年度のすべての大会のすべての試合の開催日を見て、
		// 「ある試合の当日から見て前日の午前8時から翌日の23時59分まで」に含まれる場合、
		// その試合を速報対象試合としたいので、そうでない開催日をもつ試合をdeleteする。
		// ある大会が一つも速報対象試合を持たない場合、その大会自体をspliceする。
		data.forEach(item => {
			for (const round in item['matches']) {
				for (const match in item['matches'][round]) {
					if (!isAccessAllowed(item['matches'][round][match]['match_date'])) {
						delete item['matches'][round][match];
					}
				}
			}
		});

		// 各大会の各ラウンドの各試合の中身を走査して、一つでdeleteされていない試合があれば。trueとしてfilteredDataに追加
		const filteredData = data.filter(item =>
			Object.values(item.matches).some(match => Object.keys(match).length > 0)
		);

		res.status(200).json(filteredData);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	/**
	 * アクセスする日が、「ある試合の当日から見て前日の午前8時から翌日の23時59分まで」に含まれる場合、アクセス許可とする
	 */
	function isAccessAllowed(targetDateStr) {
		// JSTの基準日時を作成（YYYY-MM-DD 形式を前提）
		const [year, month, day] = targetDateStr.split('-').map(Number);

		// JSTの基準日をUTC基準で作成
		const baseDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

		// JSTの前日 08:00 (UTCの前日 23:00)
		const startDate = new Date(Date.UTC(year, month - 1, day, 8, 0, 0, 0));
		startDate.setUTCDate(startDate.getUTCDate() - 1);

		// JSTの翌日 23:59 (UTCの翌日 14:59)
		const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
		endDate.setUTCDate(endDate.getUTCDate() + 1);

		// 現在のJST時刻を取得
		const now = new Date();
		const nowJST = new Date(now.getTime() + 9 * 60 * 60 * 1000);

		return startDate <= nowJST && nowJST <= endDate;
	}
});

/************************************
* HTTP Get method 当年度の全大会のアイテムを取得 *
************************************/
// app.get(path + '/all-championships', async function (req, res) {
// 	const fiscalYear = req.query.fiscalYear;

//     const queryItemParams = {
// 		TableName: tableName,
// 		IndexName: "gsiByFiscalYear",
// 		KeyConditionExpression: "fiscal_year = :fiscalYear",
// 		ExpressionAttributeValues: {
// 		  ":fiscalYear": fiscalYear,
// 		},
// 	  };

// 	try {
// 		const command = new QueryCommand(queryItemParams);
// 		const fetchedData = await ddbDocClient.send(command);
// 		const data = fetchedData.Items;

// 		// 今日の日付と今日から１日前の日付を取得
// 		const today = new Date();
// 		const oneWeekAgo = new Date();
// 		oneWeekAgo.setDate(today.getDate() - 1);

// 		data.forEach(item => {
// 			for (const round in item['matches']) {
// 				for (const match in item['matches'][round]) {
// 					// matchのmatchDateが１日前から今日の間でない場合はdataから削除
// 					const matchDateInItem = new Date(item['matches'][round][match]['match_date']);					
// 					if (!(oneWeekAgo <= matchDateInItem && matchDateInItem <= today)) {
// 						delete item['matches'][round][match];
// 					}
// 				}
// 			}
// 		});

// 		// // 今日の日付と今日から一週間前の日付を取得
// 		// const today = new Date();
// 		// const oneWeekAgo = new Date();
// 		// oneWeekAgo.setDate(today.getDate() - 7);

// 		// data.forEach(item => {
// 		// 	for (const round in item['matches']) {
// 		// 		for (const match in item['matches'][round]) {
// 		// 			// matchのmatchDateが一週間前から本日の間でない場合はdataから削除
// 		// 			const matchDateInItem = new Date(item['matches'][round][match]['match_date']);					
// 		// 			if (!(oneWeekAgo <= matchDateInItem && matchDateInItem <= today)) {
// 		// 				delete item['matches'][round][match];
// 		// 			}
// 		// 		}
// 		// 	}
// 		// });


// 		res.status(200).json(data);
// 	} catch (err) {
// 		console.error('Error getting data:', err);
// 		res.status(500).json({ success: false, error: 'Error getting data' });
// 	}
// });

/************************************
* HTTP Get method 対象の一試合のみを取得 *
************************************/
app.get(path + '/target-match', async function (req, res) {
	const championshipId = req.query.championshipId;
	const matchId = req.query.matchId;
	const fiscalYear = req.query.fiscalYear;
	let passingData = { "championship_name": "", "is_league": false, "round": "", "match": "", "match_detail": {} };

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		const data = fetchedData.Item;

		for (const round in data['matches']) {
			for (const match in data['matches'][round]) {
				if (matchId === data['matches'][round][match]['match_id']) {
					passingData['championship_name'] = data['championship_name'];
					passingData['is_league'] = data['is_league'];
					passingData['round'] = round;
					passingData['match'] = match;
					passingData['match_detail'] = data['matches'][round][match];
				}
			}
		}

		res.status(200).json(passingData);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}
});

/************************************
* HTTP Put method 得点追加 *
************************************/
app.put(path + '/plus-score', async function (req, res) {

	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const gameStatus = req.body.gameStatus;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索し得点追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					if (homeOrAway === 'home') {
						switch (gameStatus) {
							case '前半':
								data.matches[round][match]['home_club']['first_half_score']++;
								break;
							case '後半':
								data.matches[round][match]['home_club']['second_half_score']++;
								break;
							case '延長前半':
								data.matches[round][match]['home_club']['extra_first_half_score']++;
								break;
							case '延長後半':
								data.matches[round][match]['home_club']['extra_second_half_score']++;
								break;
						}

						data.matches[round][match]['home_club']['final_score'] =
							data.matches[round][match]['home_club']['first_half_score']
							+ data.matches[round][match]['home_club']['second_half_score']
							+ data.matches[round][match]['home_club']['extra_first_half_score']
							+ data.matches[round][match]['home_club']['extra_second_half_score']
					} else if (homeOrAway === 'away') {
						switch (gameStatus) {
							case '前半':
								data.matches[round][match]['away_club']['first_half_score']++;
								break;
							case '後半':
								data.matches[round][match]['away_club']['second_half_score']++;
								break;
							case '延長前半':
								data.matches[round][match]['away_club']['extra_first_half_score']++;
								break;
							case '延長後半':
								data.matches[round][match]['away_club']['extra_second_half_score']++;
								break;
						}

						data.matches[round][match]['away_club']['final_score'] =
							data.matches[round][match]['away_club']['first_half_score']
							+ data.matches[round][match]['away_club']['second_half_score']
							+ data.matches[round][match]['away_club']['extra_first_half_score']
							+ data.matches[round][match]['away_club']['extra_second_half_score']
					}

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method 得点取り消し *
************************************/
app.put(path + '/minus-score', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const gameStatus = req.body.gameStatus;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索し得点取り消し
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					if (homeOrAway === 'home') {
						switch (gameStatus) {
							case '前半':
								if (0 < data.matches[round][match]['home_club']['first_half_score']) {
									data.matches[round][match]['home_club']['first_half_score']--;
								}
								break;
							case '後半':
								if (0 < data.matches[round][match]['home_club']['second_half_score']) {
									data.matches[round][match]['home_club']['second_half_score']--;
								}
								break;
							case '延長前半':
								if (0 < data.matches[round][match]['home_club']['extra_first_half_score']) {
									data.matches[round][match]['home_club']['extra_first_half_score']--;
								}
								break;
							case '延長後半':
								if (0 < data.matches[round][match]['home_club']['extra_second_half_score']) {
									data.matches[round][match]['home_club']['extra_second_half_score']--;
								}
								break;
						}

						data.matches[round][match]['home_club']['final_score'] =
							data.matches[round][match]['home_club']['first_half_score']
							+ data.matches[round][match]['home_club']['second_half_score']
							+ data.matches[round][match]['home_club']['extra_first_half_score']
							+ data.matches[round][match]['home_club']['extra_second_half_score']
					} else if (homeOrAway === 'away') {
						switch (gameStatus) {
							case '前半':
								if (0 < data.matches[round][match]['away_club']['first_half_score']) {
									data.matches[round][match]['away_club']['first_half_score']--;
								}
								break;
							case '後半':
								if (0 < data.matches[round][match]['away_club']['second_half_score']) {
									data.matches[round][match]['away_club']['second_half_score']--;
								}
								break;
							case '延長前半':
								if (0 < data.matches[round][match]['away_club']['extra_first_half_score']) {
									data.matches[round][match]['away_club']['extra_first_half_score']--;
								}
								break;
							case '延長後半':
								if (0 < data.matches[round][match]['away_club']['extra_second_half_score']) {
									data.matches[round][match]['away_club']['extra_second_half_score']--;
								}
								break;
						}

						data.matches[round][match]['away_club']['final_score'] =
							data.matches[round][match]['away_club']['first_half_score']
							+ data.matches[round][match]['away_club']['second_half_score']
							+ data.matches[round][match]['away_club']['extra_first_half_score']
							+ data.matches[round][match]['away_club']['extra_second_half_score']
					}

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method PKの得点の操作 *
************************************/
app.put(path + '/manage-pk-score', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const index = req.body.index;
	const result = req.body.result;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索し得点追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					if (homeOrAway === 'home') {
						switch (result) {
							case 'success':
								data.matches[round][match]['home_club']['pk_score_list'][index] = 'success';
								break;
							case 'failure':
								data.matches[round][match]['home_club']['pk_score_list'][index] = 'failure';
								break;
							case 'cancel':
								data.matches[round][match]['home_club']['pk_score_list'].splice(index, 1);
								break;
							default:
							// 何もしない
						}
						// 成功数を計算
						const score = data.matches[round][match]['home_club']['pk_score_list'].filter(result => result === 'success').length;
						data.matches[round][match]['home_club']['pk_score'] = score;
					} else if (homeOrAway === 'away') {
						switch (result) {
							case 'success':
								data.matches[round][match]['away_club']['pk_score_list'][index] = 'success';
								break;
							case 'failure':
								data.matches[round][match]['away_club']['pk_score_list'][index] = 'failure';
								break;
							case 'cancel':
								data.matches[round][match]['away_club']['pk_score_list'].splice(index, 1);
								break;
							default:
							// 何もしない
						}
						// 成功数を計算
						const score = data.matches[round][match]['away_club']['pk_score_list'].filter(result => result === 'success').length;
						data.matches[round][match]['away_club']['pk_score'] = score;
					}

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const updateResult = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', updateResult);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method 試合状況進行（試合前から前半に進める、試合終了から後半に戻すなど） *
************************************/
app.put(path + '/handle-game-status', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const changingGameStatus = req.body.changingGameStatus;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索し試合進行状況を変更
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					data.matches[round][match]['game_status'] = changingGameStatus;
				}

				updated = true;
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method to 延長戦開始・取り消し *
************************************/
app.put(path + '/register-extra-halves', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const action = req.body.action;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索しデータを追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					if (action === 'apply') {
						data.matches[round][match]['has_extra_halves'] = true;
						data.matches[round][match]['game_status'] = '延長前半';
					} else {
						data.matches[round][match]['has_extra_halves'] = false;

						// 強制的に後半に戻す
						data.matches[round][match]['game_status'] = '後半';

						// 両クラブの延長戦スコアを初期化、合計スコアを再計算
						data.matches[round][match]['home_club']['extra_first_half_score'] = 0;
						data.matches[round][match]['home_club']['extra_second_half_score'] = 0;
						data.matches[round][match]['home_club']['final_score'] =
							data.matches[round][match]['home_club']['first_half_score']
							+ data.matches[round][match]['home_club']['second_half_score']
							+ data.matches[round][match]['home_club']['extra_first_half_score']
							+ data.matches[round][match]['home_club']['extra_second_half_score']

						data.matches[round][match]['away_club']['extra_first_half_score'] = 0;
						data.matches[round][match]['away_club']['extra_second_half_score'] = 0;
						data.matches[round][match]['away_club']['final_score'] =
							data.matches[round][match]['away_club']['first_half_score']
							+ data.matches[round][match]['away_club']['second_half_score']
							+ data.matches[round][match]['away_club']['extra_first_half_score']
							+ data.matches[round][match]['away_club']['extra_second_half_score']

						// PK戦の履歴取り消し
						data.matches[round][match]['has_pk'] = false;
						// 両クラブのPKスコアを初期化
						data.matches[round][match]['home_club']['pk_score'] = 0;
						data.matches[round][match]['home_club']['pk_score_list'].splice(0); // 配列を空にする
						data.matches[round][match]['away_club']['pk_score'] = 0;
						data.matches[round][match]['away_club']['pk_score_list'].splice(0); // 配列を空にする
					}

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method to PK戦開始・取り消し *
************************************/
app.put(path + '/register-pk', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const action = req.body.action;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索しデータを追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					if (action === 'apply') {
						data.matches[round][match]['has_pk'] = true;
						data.matches[round][match]['game_status'] = 'PK戦';
					} else if (action === 'cancel') {
						data.matches[round][match]['has_pk'] = false;

						// 強制的に後半に戻す
						data.matches[round][match]['game_status'] = '後半';

						// 両クラブのPKスコアを初期化
						data.matches[round][match]['home_club']['pk_score'] = 0;
						data.matches[round][match]['home_club']['pk_score_list'].splice(0); // 配列を空にする
						data.matches[round][match]['away_club']['pk_score'] = 0;
						data.matches[round][match]['away_club']['pk_score_list'].splice(0); // 配列を空にする
					}

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method to register match result *
************************************/
app.put(path + '/register-match-result', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const actualMatchStartTime = req.body.actualMatchStartTime;
	const comment = req.body.comment;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索しデータを追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					let targetMatchInfo = data.matches[round][match];

					// バリデーション
					if (targetMatchInfo['game_status'] !== '試合終了') {
						res.status(500).json({ message: 'Game status is not 試合終了' });
						return;
					}

					targetMatchInfo['actual_match_start_time'] = actualMatchStartTime;

					// 前後半（と延長戦前後半）の得点の合計またはPK戦の最終結果により勝敗を登録
					if (targetMatchInfo['home_club']['final_score'] > targetMatchInfo['away_club']['final_score'] ||
						targetMatchInfo['home_club']['pk_score'] > targetMatchInfo['away_club']['pk_score']) {
						targetMatchInfo['home_club']['result'] = 'win';
						targetMatchInfo['away_club']['result'] = 'lose';
					} else if (targetMatchInfo['home_club']['final_score'] < targetMatchInfo['away_club']['final_score'] ||
						targetMatchInfo['home_club']['pk_score'] < targetMatchInfo['away_club']['pk_score']) {
						targetMatchInfo['home_club']['result'] = 'lose';
						targetMatchInfo['away_club']['result'] = 'win';
					} else {
						targetMatchInfo['home_club']['result'] = 'draw';
						targetMatchInfo['away_club']['result'] = 'draw';
					}

					targetMatchInfo['is_result_registered'] = true;
					targetMatchInfo['comment'] = comment;

					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method to register match result *
************************************/
app.put(path + '/register-match-delay', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;

	// 取得したアイテムをいったん格納する
	let data = {};

	const getItemParams = {
		TableName: tableName,
		Key: {
			championship_id: championshipId,
			fiscal_year: fiscalYear
		}
	};

	try {
		const command = new GetCommand(getItemParams);
		const fetchedData = await ddbDocClient.send(command);
		data = fetchedData.Item;
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}

	try {
		// match_idで該当の試合を検索しデータを追加
		let updated = false;
		for (const round in data.matches) {
			for (const match in data.matches[round]) {
				if (data.matches[round][match]['match_id'] === matchId) {
					data.matches[round][match]['is_delayed'] = true;
					data.matches[round][match]['match_date'] = '2099-12-31';
					updated = true;
				}
			}
		}

		if (!updated) {
			res.status(500).json({ message: 'Match not found' });
			return;
		}

		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches = :updatedMatches',
			ExpressionAttributeValues: {
				':updatedMatches': data.matches
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const result = await ddbDocClient.send(new UpdateCommand(params));
		console.log('Update successful:', result);
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app