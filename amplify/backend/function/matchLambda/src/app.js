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

function selectClub(homeOrAway) {
	if (homeOrAway === 'home') {
		return 'home_club'
	} else {
		return 'away_club'
	}
}

function formatTimeZone(gameStatus) {
	switch(gameStatus) {
		case '前半':
			return 'first_half_score';
		case '後半':
			return 'second_half_score';
		case '延長前半':
			return 'extra_first_half_score';
		case '延長後半':
			return 'extra_second_half_score';
		default:
			return '';
	}
}

function isWithinLastTuesdayToNextMonday(targetDateStr) {
	// ── １．JST の今日 00:00 を取得 ──
	const todayJST = new Date(
	  new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
	);
	todayJST.setHours(0, 0, 0, 0);
  
	const day = todayJST.getDay(); // 0: 日曜 … 2: 火曜 … 1: 月曜
  
	// ── ２．過去の直近火曜 ──
	const lastTuesday = new Date(todayJST);
	const diffToLastTue = (day - 2 + 7) % 7;
	lastTuesday.setDate(todayJST.getDate() - diffToLastTue);
  
	// ── ３．未来の直近月曜 ──
	const nextMonday = new Date(todayJST);
	let diffToNextMon = (1 - day + 7) % 7;
	if (diffToNextMon === 0) diffToNextMon = 7;  // 今日が月曜なら「来週の月曜」
	nextMonday.setDate(todayJST.getDate() + diffToNextMon);
  
	// ── ４．target も JST の当日 00:00 に丸める ──
	const tJST = new Date(
	  new Date(targetDateStr).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
	);
	tJST.setHours(0, 0, 0, 0);
  
	// ── ５．判定 ──
	return tJST >= lastTuesday && tJST <= nextMonday;
  }
  

function canAccess(matchDate) {
	// 日本時間での現在の日付を取得（YYYY-MM-DD形式）
	const now = new Date();
	const japanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

	// YYYY-MM-DD 形式に整形
	const year = japanTime.getUTCFullYear();
	const month = String(japanTime.getUTCMonth() + 1).padStart(2, "0");
	const day = String(japanTime.getUTCDate()).padStart(2, "0");
	const today = `${year}-${month}-${day}`;

	// 試合日と今日を比較
	const isMatchDateToday = matchDate === today;

	return isMatchDateToday;
}

/************************************
* HTTP Get method TOP画面に表示する試合を取得 *
************************************/
app.get(path + '/championship-names-ids', async function (req, res) {
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
		const namesAndIds = data.map(({ championship_name, championship_id, category }) => ({ championship_name, championship_id, category }));

		res.status(200).json(namesAndIds);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}
});

/************************************
* HTTP Get method 結果速報画面に表示する試合を取得 *
************************************/
app.get(path + '/matches-in-this-week', async function (req, res) {
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

		// ある大会が一つも速報対象試合を持たない場合、その大会自体をspliceする。
		data.forEach(item => {
			if (item['item_type'] === 'championship') {
				for (const round in item['matches']) {
					for (const match in item['matches'][round]) {
						// round_idはのバリューは文字列なので、それ以外の場合のみmatch_dateについて判定
						if (typeof item['matches'][round][match] !== 'string') {
							// console.log('date', item['matches'][round][match]['match_date']);
							// console.log('bool',isWithinLastTuesdayToNextMonday(item['matches'][round][match]['match_date']))
							if (!isWithinLastTuesdayToNextMonday(item['matches'][round][match]['match_date'])) {
								delete item['matches'][round][match];
							}
						}
					}
				}
			}
		});

		// 各大会の各ラウンドの各試合の中身を走査して、一つでもdeleteされていない試合があれば、trueとしてfilteredDataに追加
		// round_idはdeleteされないので、必ず一つはキー・バリューが残っている。二つ以上のキー・バリューがあれば、一つ以上の試合が残っていると判定
		const filteredData = data.filter(item =>
			item['item_type'] === 'championship' && Object.values(item.matches).some(match => Object.keys(match).length >= 2)
		);
console.log('filteredData', JSON.stringify((filteredData)));
		res.status(200).json(filteredData);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}
});

/************************************
* HTTP Get method 速報対象試合検索画面へのアクセス許可を判定 *
* 試合当日のみアクセス許可 *
************************************/
app.get(path + '/current-matches', async function (req, res) {
	const fiscalYear = req.query.fiscalYear;
	const accessToken = req.query.accessToken;
console.log('entering current matches', req.body)
	// U-12とWOMANはまとめて一つの扱いなので
	// 配列化して長さが１ならばU-15（ジュニアユース）かU-18（ユース）、そうでなければU-12（ジュニア）とWOMAN
	const category = (req.query.category).split(',').length === 1 ? req.query.category : (req.query.category).split(',')

	if (category === 'U-15（ジュニアユース）' || category === 'U-18（ユース）') {
		const queryItemParams = {
			TableName: tableName,
			IndexName: "gsiByFiscalYearAndCategory",
			KeyConditionExpression: "fiscal_year = :fiscalYear and category = :category",
			ExpressionAttributeValues: {
				":fiscalYear": fiscalYear,
				":category": category
			},
		};

		try {
			const command = new QueryCommand(queryItemParams);
			const fetchedData = await ddbDocClient.send(command);
			const data = fetchedData.Items;

			// アクセス日に開催される試合であり、試合パスワードaccess_tokenが一致する試合のみを抽出
			// ある大会が一つも速報対象試合を持たない場合、その大会自体をspliceする。
			data.forEach(item => {
				if (item['item_type'] === 'championship') {
					for (const round in item['matches']) {
						for (const match in item['matches'][round]) {
							// round_idは直接試合と無関係なので、それ以外の場合についてmatch_dateについて判定
							if (match !== 'round_id') {
								if (!canAccess(item['matches'][round][match]['match_date'])) {
									delete item['matches'][round][match];
									continue;
								}

								if (canAccess(item['matches'][round][match]['match_date']) && item['matches'][round][match]['access_token'] !== undefined) {
									if (item['matches'][round][match]['access_token'] !== accessToken) {
										delete item['matches'][round][match];
									}
								}
							}
						}
					}
				}
			});

			// 各大会の各ラウンドの各試合の中身を走査して、一つでもdeleteされていない試合があれば。trueとしてfilteredDataに追加
			// round_idはdeleteされないので、必ず一つはキー・バリューが残っている。二つ以上のキー・バリューがあれば、一つ以上の試合が残っていると判定
			const filteredData = data.filter(item =>
				item['item_type'] === 'championship' && Object.values(item.matches).some(match => Object.keys(match).length >= 2)
			);
			
			res.status(200).json(filteredData);
		} catch (err) {
			console.error('Error getting data:', err);
			res.status(500).json({ success: false, error: 'Error getting data' });
		}
	} else {
		const passingData = [];

		for (const eachCategory of category) {
			const queryItemParams = {
				TableName: tableName,
				IndexName: "gsiByFiscalYearAndCategory",
				KeyConditionExpression: "fiscal_year = :fiscalYear and category = :category",
				ExpressionAttributeValues: {
					":fiscalYear": fiscalYear,
					":category": eachCategory
				},
			};

			try {
				const command = new QueryCommand(queryItemParams);
				const fetchedData = await ddbDocClient.send(command);
				const data = fetchedData.Items;

				// アクセス日に開催される試合であり、試合パスワードmatch_passwordが一致する試合のみを抽出
				// ある大会が一つも速報対象試合を持たない場合、その大会自体をspliceする。
				data.forEach(item => {
					if (item['item_type'] === 'championship') {
						for (const round in item['matches']) {
							for (const match in item['matches'][round]) {
								// round_idは文字列なので、それ以外の場合のみmatch_dateについて判定
								if (typeof item['matches'][round][match] !== 'string') {
									if (!canAccess(item['matches'][round][match]['match_date'])) {
										delete item['matches'][round][match];
									}
								}
							}
						}
					}
				});

				// 各大会の各ラウンドの各試合の中身を走査して、一つでもdeleteされていない試合があれば。trueとしてfilteredDataに追加
				// round_idはdeleteされないので、必ず一つはキー・バリューが残っている。二つ以上のキー・バリュがあれば、一つ以上の試合が残っていると判定
				const filteredData = data.filter(item =>
					item['item_type'] === 'championship' && Object.values(item.matches).some(match => Object.keys(match).length >= 2)
				);
				
				passingData.push(filteredData);
			} catch (err) {
				console.error('Error getting data:', err);
				res.status(500).json({ success: false, error: 'Error getting data' });
			}
		}

		res.status(200).json(passingData);
	}
});

/************************************
* HTTP Get method 対象の一試合のみを取得 *
************************************/
app.get(path + '/target-championship', async function (req, res) {
	const championshipId = req.query.championshipId;
	const fiscalYear = req.query.fiscalYear;

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

		res.status(200).json(data);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}
});

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

		if (data['item_type'] === 'championship') {
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
		}

		res.status(200).json(passingData);
	} catch (err) {
		console.error('Error getting data:', err);
		res.status(500).json({ success: false, error: 'Error getting data' });
	}
});

/************************************
* HTTP Get method 対象の一大会の試合日のみを取得 *
************************************/
app.get(path + '/match-dates', async function (req, res) {
	const championshipId = req.query.championshipId;
	const fiscalYear = req.query.fiscalYear

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

		// Set で重複を除外しつつ抽出
		const dateSet = new Set();
		Object.values(data.matches).forEach(division => {
			Object.values(division).forEach(item => {
				if (item.match_date) {
					dateSet.add(item.match_date);
				}
			});
		});

		// 結果を配列に変換
		const uniqueDates = Array.from(dateSet);

		// YYYY-MM-DD形式からMM/DD形式にして返却
		// 最新日付が先頭に来るよう降順ソート
		// M/D 形式に変換（先頭ゼロ削除）
		const formattedDatesDesc = uniqueDates
			.sort((a, b) => new Date(b) - new Date(a))
			.map(date => {
				const [, month, day] = date.split('-');
				const m = parseInt(month, 10);  // "04" → 4
				const d = parseInt(day, 10);    // "03" → 3
				return `${m}/${d}`;
			});

		res.status(200).json(formattedDatesDesc);
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
	const match = req.body.match;
	const round = req.body.round;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const gameStatus = req.body.gameStatus;

	// 証跡用出力
	console.log('得点追加', req.body);

	// homeかawayのクラブを選択
	const whichClub = selectClub(homeOrAway);

	// first/second/extra_first/extra_second/のいずれかの_scoreを選択
	const timeZoneScore = formatTimeZone(gameStatus);

	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: `SET matches.#round.#match.#which_club.#time_zone_score = matches.#round.#match.#which_club.#time_zone_score + :increment, 
									matches.#round.#match.#which_club.final_score = matches.#round.#match.#which_club.final_score + :increment`,
			ExpressionAttributeNames: {
                "#match": match,
                "#round": round,
				"#which_club": whichClub,
				"#time_zone_score": timeZoneScore
            },
			ExpressionAttributeValues: {
				':increment': 1
			},
			ReturnValues: 'UPDATED_NEW'
		};
		console.log(JSON.stringify(params));

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
	const match = req.body.match;
	const round = req.body.round;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const gameStatus = req.body.gameStatus;

	// 証跡用出力
	console.log('得点取り消し', req.body);

	// homeかawayのクラブを選択
	const whichClub = selectClub(homeOrAway);

	// first/second/extra_first/extra_second/のいずれかの_scoreを選択
	const timeZoneScore = formatTimeZone(gameStatus);

	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: `SET matches.#round.#match.#which_club.#time_zone_score = matches.#round.#match.#which_club.#time_zone_score + :decrement, 
									matches.#round.#match.#which_club.final_score = matches.#round.#match.#which_club.final_score + :decrement`,
			ExpressionAttributeNames: {
                "#match": match,
                "#round": round,
				"#which_club": whichClub,
				"#time_zone_score": timeZoneScore,
            },
			ExpressionAttributeValues: {
				':decrement': -1
			},
			ReturnValues: 'UPDATED_NEW'
		};
		console.log(JSON.stringify(params));

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
	const match = req.body.match;
	const round = req.body.round;
	const fiscalYear = req.body.fiscalYear;
	const homeOrAway = req.body.homeOrAway;
	const index = req.body.index;
	const result = req.body.result;

	// 証跡用出力
	console.log('PK戦得点操作', req.body);

	// homeかawayのクラブを選択
	const whichClub = selectClub(homeOrAway);

	// DynamoDBから既存のpk_listを取得 (GetCommandに修正)
	const getParams = {
		TableName: tableName,
		Key: {
			"championship_id": championshipId,
			"fiscal_year": fiscalYear
		},
		ProjectionExpression: "matches.#round.#match.#which_club.pk_score_list",
		ExpressionAttributeNames: {
			"#round": round,
			"#match": match,
			"#which_club": whichClub
		}
	};

	const command = new GetCommand(getParams);
	const fetchedData = await ddbDocClient.send(command);
	const pkScoreList = fetchedData.Item?.matches?.[round]?.[match]?.[whichClub]?.pk_score_list || [];

	// 更新処理
	if (result === "success") {
		pkScoreList.push("success");
	} else if (result === "failure") {
		pkScoreList.push("failure");
	} else if (result === "cancel" && pkScoreList.length > 0) {
		pkScoreList.pop();
	}

	// successの数をカウントしてpk_scoreに代入
	const pkScore = pkScoreList.filter(item => item === "success").length;

	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches.#round.#match.#which_club.pk_score_list = :pk_score_list, matches.#round.#match.#which_club.pk_score = :pk_score',
			ExpressionAttributeNames: {
                "#match": match,
                "#round": round,
				"#which_club": whichClub,
            },
			ExpressionAttributeValues: {
                ":pk_score_list": pkScoreList,
                ":pk_score": pkScore
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const command = new UpdateCommand(params);
		const result = await ddbDocClient.send(command);
		console.log('Update successful:', JSON.stringify(result));
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
	const fiscalYear = req.body.fiscalYear;
	const matchId = req.body.matchId;
	const match = req.body.match;
	const round = req.body.round;
	const changingGameStatus = req.body.changingGameStatus;

	// 証跡用出力
	console.log('試合状態遷移先', req.body);
	
	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: 'SET matches.#round.#match.game_status = :changingGameStatus',
			ExpressionAttributeNames: {
                "#match": match,
                "#round": round,
            },
			ExpressionAttributeValues: {
				':changingGameStatus': changingGameStatus
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const command = new UpdateCommand(params);
		const result = await ddbDocClient.send(command);
		console.log('Update successful:', JSON.stringify(result));
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

	// 証跡用出力
	console.log('延長戦開始・取り消し操作', req.body);
	
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


	if (data['item_type'] === 'championship') {
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

	// 証跡用出力
	console.log('PK戦開始・取り消し操作', req.body);

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
					}
					
					if (action === 'cancel') {
						data.matches[round][match]['has_pk'] = false;

						// 強制的に後半（延長後半があれば延長後半）に戻す
						if (data.matches[round][match]['has_extra_halves']) {
							data.matches[round][match]['game_status'] = '延長後半';
						} else {
							data.matches[round][match]['game_status'] = '後半';
						}

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
	const fiscalYear = req.body.fiscalYear;
	const matchId = req.body.matchId;
	const match = req.body.match;
	const round = req.body.round;
	const actualMatchStartTime = req.body.actualMatchStartTime;

	// 証跡用出力
	console.log('試合結果登録開始', req.body);

	// 勝敗の判定に使うための現在の得点等を取得
	const getParams = {
		TableName: tableName,
		Key: {
			"championship_id": championshipId,
			"fiscal_year": fiscalYear
		},
		ProjectionExpression: "matches.#round.#match",
		ExpressionAttributeNames: {
			"#round": round,
			"#match": match,
		}
	};

	const command = new GetCommand(getParams);
	const fetchedData = await ddbDocClient.send(command);

	const homeClubFinalScore = fetchedData.Item?.matches?.[round]?.[match]?.home_club.final_score;
	const homeClubPkScore = fetchedData.Item?.matches?.[round]?.[match]?.home_club.pk_score;
	const awayClubFinalScore = fetchedData.Item?.matches?.[round]?.[match]?.away_club.final_score;
	const awayClubPkScore = fetchedData.Item?.matches?.[round]?.[match]?.away_club.pk_score;
	let homeClubResult = '';
	let awayClubResult = '';

	// 前後半（と延長戦前後半）の得点の合計またはPK戦の最終結果により勝敗を登録
	if (fetchedData.Item?.matches?.[round]?.[match]?.has_pk) {
		if (homeClubPkScore > awayClubPkScore) {
			homeClubResult = 'win';
			awayClubResult = 'lose';	
		} else if (homeClubPkScore < awayClubPkScore) { // PK戦の最終得点が同じになることはない
			homeClubResult = 'lose';
			awayClubResult = 'win';
		}
	} else {
		if (homeClubFinalScore > awayClubFinalScore) {
			homeClubResult = 'win';
			awayClubResult = 'lose';
		} else if (homeClubFinalScore < awayClubFinalScore) {
			homeClubResult = 'lose';
			awayClubResult = 'win';
		} else { // 同点
			homeClubResult = 'draw';
			awayClubResult = 'draw';
		}
	}

	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: {
				'championship_id': championshipId,
				'fiscal_year': fiscalYear
			},
			UpdateExpression: `SET matches.#round.#match.is_result_registered = :isResultRegistered, 
									matches.#round.#match.actual_match_start_time = :actualMatchStartTime,
									matches.#round.#match.home_club.#result = :homeClubResult,
									matches.#round.#match.away_club.#result = :awayClubResult
							  `,
			ExpressionAttributeNames: {
                "#match": match,
                "#round": round,
				"#result": 'result'
            },
			ExpressionAttributeValues: {
				":homeClubResult": homeClubResult,
				":awayClubResult": awayClubResult,
				":actualMatchStartTime": actualMatchStartTime, 
                ":isResultRegistered": true
			},
			ReturnValues: 'UPDATED_NEW'
		};

		const command = new UpdateCommand(params);
		const result = await ddbDocClient.send(command);
		console.log('Update successful:', JSON.stringify(result));
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});

/************************************
* HTTP Put method to register match result *
************************************/
app.put(path + '/register-edited-match-result', async function (req, res) {
	// フロントから渡されるリクエストボディの内容
	const championshipId = req.body.championshipId;
	const matchId = req.body.matchId;
	const fiscalYear = req.body.fiscalYear;
	const actualMatchStartTimeEdit = req.body.actualMatchStartTimeEdit;
	const hasExtraHalvesEdit = req.body.hasExtraHalvesEdit;
	const hasPkEdit = req.body.hasPkEdit;

	const homeClubFirstHalfScoreEdit = req.body.homeClubExtraFirstHalfScoreEdit;
	const homeClubSecondHalfScoreEdit = req.body.homeClubExtraSecondHalfScoreEdit;
	const homeClubExtraFirstHalfScoreEdit = req.body.homeClubExtraFirstHalfScoreEdit;
	const homeClubExtraSecondHalfScoreEdit = req.body.homeClubExtraSecondHalfScoreEdit;
	const homeClubFinalScoreEdit = req.body.homeClubFinalScoreEdit;
	const homeClubPkScoreEdit = req.body.homeClubPkScoreEdit;
	const homeClubPkScoreListEdit = req.body.homeClubPkScoreListEdit;

	const awayClubFirstHalfScoreEdit = req.body.awayClubFirstHalfScoreEdit;
	const awayClubSecondHalfScoreEdit = req.body.awayClubSecondHalfScoreEdit;
	const awayClubExtraFirstHalfScoreEdit = req.body.awayClubExtraFirstHalfScoreEdit;
	const awayClubExtraSecondHalfScoreEdit = req.body.awayClubExtraSecondHalfScoreEdit;
	const awayClubFinalScoreEdit = req.body.awayClubFinalScoreEdit;
	const awayClubPkScoreEdit = req.body.awayClubPkScoreEdit;
	const awayClubPkScoreListEdit = req.body.awayClubPkScoreListEdit;

	// 証跡用出力
	console.log('試合結果修正', req.body);

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

	if (data['item_type'] === 'championship') {
		try {
			// match_idで該当の試合を検索しデータを追加
			let updated = false;
			for (const round in data.matches) {
				for (const match in data.matches[round]) {
					if (data.matches[round][match]['match_id'] === matchId) {
						const targetMatchInfo = data.matches[round][match];
						console.log('修正前', targetMatchInfo);

						targetMatchInfo['actual_match_start_time'] = actualMatchStartTimeEdit;
						targetMatchInfo['has_extra_halves'] = hasExtraHalvesEdit;
						targetMatchInfo['has_pk'] = hasPkEdit;

						targetMatchInfo['home_club']['first_half_score'] = homeClubFirstHalfScoreEdit;
						targetMatchInfo['home_club']['second_half_score'] = homeClubSecondHalfScoreEdit;
						targetMatchInfo['away_club']['first_half_score'] = awayClubFirstHalfScoreEdit;
						targetMatchInfo['away_club']['second_half_score'] = awayClubSecondHalfScoreEdit;
	
						if (targetMatchInfo['has_extra_halves']) {
							targetMatchInfo['home_club']['extra_first_half_score'] = homeClubExtraFirstHalfScoreEdit;
							targetMatchInfo['home_club']['extra_second_half_score'] = homeClubExtraSecondHalfScoreEdit;
							targetMatchInfo['away_club']['extra_first_half_score'] = awayClubExtraFirstHalfScoreEdit;
							targetMatchInfo['away_club']['extra_second_half_score'] = awayClubExtraSecondHalfScoreEdit;
						}

						targetMatchInfo['home_club']['final_score'] = homeClubFinalScoreEdit;
						targetMatchInfo['away_club']['final_score'] = awayClubFinalScoreEdit;

						if (targetMatchInfo['has_pk']) {
							targetMatchInfo['home_club']['pk_score'] = homeClubPkScoreEdit;
							targetMatchInfo['home_club']['pk_score_list'] = homeClubPkScoreListEdit;
							targetMatchInfo['away_club']['pk_score'] = awayClubPkScoreEdit;
							targetMatchInfo['away_club']['pk_score_list'] = awayClubPkScoreListEdit;
						}
						

						// 前後半（と延長戦前後半）の得点の合計またはPK戦の最終結果により勝敗を登録
						if (targetMatchInfo['has_pk']) {
							if (targetMatchInfo['home_club']['pk_score'] > targetMatchInfo['away_club']['pk_score']) {
								targetMatchInfo['home_club']['result'] = 'win';
								targetMatchInfo['away_club']['result'] = 'lose';	
							} 
							if (targetMatchInfo['home_club']['pk_score'] < targetMatchInfo['away_club']['pk_score']) {
								targetMatchInfo['home_club']['result'] = 'lose';
								targetMatchInfo['away_club']['result'] = 'win';	
							}
							// 通常、PK戦の得点が同じなることはない
							if (targetMatchInfo['home_club']['pk_score'] === targetMatchInfo['away_club']['pk_score']) {
								targetMatchInfo['home_club']['result'] = 'draw';
								targetMatchInfo['away_club']['result'] = 'draw';	
							}
						} else {
							if (targetMatchInfo['home_club']['final_score'] > targetMatchInfo['away_club']['final_score']) {
								targetMatchInfo['home_club']['result'] = 'win';
								targetMatchInfo['away_club']['result'] = 'lose';
							}
							
							if (targetMatchInfo['home_club']['final_score'] < targetMatchInfo['away_club']['final_score']) {
								targetMatchInfo['home_club']['result'] = 'lose';
								targetMatchInfo['away_club']['result'] = 'win';
							}
							
							if (targetMatchInfo['home_club']['final_score'] === targetMatchInfo['away_club']['final_score']) {
								targetMatchInfo['home_club']['result'] = 'draw';
								targetMatchInfo['away_club']['result'] = 'draw';
							}
						}

						targetMatchInfo['game_status'] = '試合終了';
						targetMatchInfo['is_result_registered'] = true;
						targetMatchInfo['is_edited'] = true;

						console.log('修正後', targetMatchInfo)
						updated = true;
					}
				}
			}

			if (!updated) {
				res.status(500).json({ message: 'Edit failed' });
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
	}
});

/************************************
* HTTP Put method to register 試合延期 *
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


	if (data['item_type'] === 'championship') {
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
	}
});

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app