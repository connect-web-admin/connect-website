/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
  http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, SignUpCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-northeast-1' });
const USER_POOL_ID = 'ap-northeast-1_nziYUPFda';
const CLIENT_ID = '2l2tg8i2d5ncdo8sdmdtu1o4hn'; // CognitoのApp Client ID

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "MemberDDB";
if (process.env.ENV && process.env.ENV !== "NONE") {
	tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "member_id";
const partitionKeyType = "S";
const sortKeyName = "membership_type";
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

// convert url string param to expected Type
const convertUrlType = (param, type) => {
	switch (type) {
		case "N":
			return Number.parseInt(param);
		default:
			return param;
	}
}

/************************************
* HTTP post method for ユーザー状態確認 *
*************************************/
app.post(path + '/check-user-status', async function (req, res) {
	const inputEmail = req.body.inputEmail;

	if (!inputEmail) {
		return res.status(400).json({ error: 'メールアドレスは必須です' });
	}

	try {
		// DynamoDBでメールアドレスの存在確認（GSI使用）
		const params = {
			TableName: tableName,
			IndexName: 'gsiByEmail',
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			}
		};

		const data = await ddbDocClient.send(new QueryCommand(params));

		// メールアドレスが存在し、アクティブな場合
		if (data.Items && data.Items.length > 0 && data.Items[0].isActive === true) {
			return res.status(400).json({
				status: 'ALREADY_REGISTERED',
				message: '登録済みのメールアドレスです'
			});
		}

		// メールアドレスが存在し、非アクティブな場合
		if (data.Items && data.Items.length > 0 && data.Items[0].isActive === false) {
			// Cognitoでユーザーの状態確認
			try {
				const getUserCommand = new AdminGetUserCommand({
					UserPoolId: USER_POOL_ID,
					Username: inputEmail
				});

				const userData = await cognitoClient.send(getUserCommand);

				// ユーザーが存在し、認証済みの場合
				if (userData.UserStatus === 'CONFIRMED') {
					return res.status(400).json({
						status: 'ALREADY_REGISTERED',
						message: '登録済みのメールアドレスです'
					});
				}

				// ユーザーが存在し、未認証または無効な場合
				if (userData.UserStatus === 'UNCONFIRMED' || userData.UserStatus === 'FORCE_CHANGE_PASSWORD') {
					// 認証コードを再送信
					const resendCommand = new ResendConfirmationCodeCommand({
						ClientId: CLIENT_ID,
						Username: inputEmail
					});
					await cognitoClient.send(resendCommand);

					return res.status(200).json({
						status: 'PENDING_CONFIRMATION',
						message: '認証コードを再送信しました'
					});
				}
			} catch (error) {
				// ユーザーが存在しない場合は、新規登録可能
				if (error.name === 'UserNotFoundException' || error.name === 'ResourceNotFoundException') {
					return res.status(200).json({
						status: 'NEW_USER',
						message: '新規登録可能です'
					});
				}
				throw error;
			}
		}

		// メールアドレスが存在しない場合は、新規登録可能
		return res.status(200).json({
			status: 'NEW_USER',
			message: '新規登録可能です'
		});
	} catch (error) {
		console.error("Error checking user status:", error);
		return res.status(500).json({ error: 'ユーザー状態の確認に失敗しました' });
	}
});

/************************************
* HTTP post method for insert object *
*************************************/
app.post(path + '/signup', async function (req, res) {
	// フロントエンドから渡されるリクエスト
	const inputEmail = req.body.inputEmail;
	const inputPassword = req.body.inputPassword;
	const ageGroup = req.body.ageGroup;
	const gender = req.body.gender;
	const favoriteTeam = req.body.favoriteTeam;
	const membershipType = req.body.membershipType;

	try {
		// まずDynamoDBでメールアドレスの存在確認
		const queryParams = {
			TableName: tableName,
			IndexName: 'gsiByEmail',
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			}
		};

		const existingUser = await ddbDocClient.send(new QueryCommand(queryParams));

		// メールアドレスが存在し、アクティブな場合
		if (existingUser.Items && existingUser.Items.length > 0 && existingUser.Items[0].isActive === true) {
			return res.status(400).json({
				status: 'ALREADY_REGISTERED',
				message: '登録済みのメールアドレスです'
			});
		}

		// メールアドレスが存在し、非アクティブな場合
		if (existingUser.Items && existingUser.Items.length > 0 && existingUser.Items[0].isActive === false) {
			// 既存のユーザー情報を更新
			const updateItemParams = {
				TableName: tableName,
				Key: {
					'member_id': existingUser.Items[0].member_id
				},
				UpdateExpression: 'SET age_group = :ageGroup, gender = :gender, favorite_team = :favoriteTeam, membership_type = :membershipType',
				ExpressionAttributeValues: {
					':ageGroup': ageGroup,
					':gender': gender,
					':favoriteTeam': favoriteTeam,
					':membershipType': membershipType
				}
			};

			await ddbDocClient.send(new UpdateCommand(updateItemParams));
		} else {
			// 全アイテムをスキャンして最大のmember_idを取得
			const scanParams = {
				TableName: tableName,
				ProjectionExpression: 'member_id'
			};
			const scanResult = await ddbDocClient.send(new ScanCommand(scanParams));

			// member_idの最大値を取得
			let maxMemberId = 0;
			if (scanResult.Items && scanResult.Items.length > 0) {
				maxMemberId = Math.max(...scanResult.Items.map(item => parseInt(item.member_id)));
			}

			// 新しいmember_idを生成（10桁の文字列）
			const newMemberId = (maxMemberId + 1).toString().padStart(10, '0');

			// DynamoDBにユーザー情報を保存（isActive: false）
			const putItemParams = {
				TableName: tableName,
				Item: {
					'member_id': newMemberId,
					'email': inputEmail,
					'membership_type': membershipType,
					'age_group': ageGroup,
					'favorite_team': favoriteTeam,
					'gender': gender,
					'isActive': false,
					'deleted_at': ''
				}
			};

			await ddbDocClient.send(new PutCommand(putItemParams));
		}

		// Cognitoにユーザーを登録
		try {
			const signUpCommand = new SignUpCommand({
				ClientId: CLIENT_ID,
				Username: inputEmail,
				Password: inputPassword,
				UserAttributes: [
					{ Name: 'email', Value: inputEmail }
				]
			});

			await cognitoClient.send(signUpCommand);

			// 認証コードを送信
			const resendCommand = new ResendConfirmationCodeCommand({
				ClientId: CLIENT_ID,
				Username: inputEmail
			});
			await cognitoClient.send(resendCommand);

			res.status(200).json({
				status: 'PENDING_CONFIRMATION',
				message: '認証コードを送信しました'
			});
		} catch (error) {
			// Cognitoでユーザーが既に存在する場合
			if (error.name === 'UsernameExistsException') {
				// ユーザーの状態を確認
				try {
					const getUserCommand = new AdminGetUserCommand({
						UserPoolId: USER_POOL_ID,
						Username: inputEmail
					});

					const userData = await cognitoClient.send(getUserCommand);

					// ユーザーが存在し、認証済みの場合
					if (userData.UserStatus === 'CONFIRMED') {
						return res.status(400).json({
							status: 'ALREADY_REGISTERED',
							message: '登録済みのメールアドレスです'
						});
					}

					// ユーザーが存在し、未認証または無効な場合
					if (userData.UserStatus === 'UNCONFIRMED' || userData.UserStatus === 'FORCE_CHANGE_PASSWORD') {
						// 認証コードを再送信
						const resendCommand = new ResendConfirmationCodeCommand({
							ClientId: CLIENT_ID,
							Username: inputEmail
						});
						await cognitoClient.send(resendCommand);

						return res.status(200).json({
							status: 'PENDING_CONFIRMATION',
							message: '認証コードを再送信しました'
						});
					}
				} catch (innerError) {
					throw innerError;
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error in signup:", error);
		return res.status(500).json({ error: 'ユーザー登録に失敗しました' });
	}
});

/************************************
* HTTP post method for 認証コード確認 *
*************************************/
app.post(path + '/confirm-signup', async (req, res) => {
	const inputEmail = req.body.inputEmail;
	const verificationCode = req.body.verificationCode;

	try {
		// 入力値の検証
		if (!inputEmail || !verificationCode) {
			return res.status(400).json({
				message: 'メールアドレスと認証コードは必須です'
			});
		}

		console.log(`認証コード確認開始: ${inputEmail}`);

		// 認証コード検証コマンドの作成
		const command = new ConfirmSignUpCommand({
			ClientId: CLIENT_ID,
			Username: inputEmail,
			ConfirmationCode: verificationCode
		});

		// 認証コードの検証
		await cognitoClient.send(command);
		console.log(`Cognito認証コード確認成功: ${inputEmail}`);

		// GSIを使用してユーザー情報を取得
		const queryParams = {
			TableName: tableName,
			IndexName: 'gsiByEmail',
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			}
		};

		const userData = await ddbDocClient.send(new QueryCommand(queryParams));
		console.log(`DynamoDBユーザー情報取得: ${JSON.stringify(userData)}`);

		if (!userData.Items || userData.Items.length === 0) {
			console.error(`ユーザー情報が見つかりません: ${inputEmail}`);
			return res.status(404).json({
				message: 'ユーザー情報が見つかりません'
			});
		}

		const memberId = userData.Items[0].member_id;
		console.log(`ユーザーID: ${memberId}`);

		// DynamoDBのユーザー情報を更新（isActive: true）
		const updateItemParams = {
			TableName: tableName,
			Key: {
				'member_id': memberId
			},
			UpdateExpression: 'SET isActive = :isActive',
			ExpressionAttributeValues: {
				':isActive': true
			}
		};

		await ddbDocClient.send(new UpdateCommand(updateItemParams));
		console.log(`DynamoDB更新成功: ${memberId}`);

		res.status(200).json({
			message: 'メールアドレスの認証が完了しました'
		});
	} catch (error) {
		console.error('認証コード検証エラー:', error);

		// エラーメッセージの日本語化
		let errorMessage = '認証に失敗しました';
		if (error.name === 'UserNotFoundException') {
			errorMessage = '指定されたメールアドレスのユーザーが見つかりません';
		} else if (error.name === 'CodeMismatchException') {
			errorMessage = '認証コードが正しくありません';
		} else if (error.name === 'ExpiredCodeException') {
			errorMessage = '認証コードの有効期限が切れています。新しい認証コードを再送信してください';
		} else if (error.name === 'NotAuthorizedException') {
			errorMessage = 'ユーザーは既に認証済みです';
		} else if (error.name === 'InvalidParameterException') {
			errorMessage = '無効なパラメータが指定されました';
		}

		res.status(400).json({
			message: errorMessage
		});
	}
});

/************************************
* HTTP post method for 認証コード再送信 *
*************************************/
app.post(path + '/resend-code', async (req, res) => {
	const inputEmail = req.body.inputEmail

	try {
		if (!inputEmail) {
			return res.status(400).json({
				message: 'メールアドレスは必須です'
			});
		}

		// 認証コード再送信コマンドの作成
		const command = new ResendConfirmationCodeCommand({
			ClientId: CLIENT_ID,
			Username: inputEmail
		});

		// 認証コードの再送信
		await cognitoClient.send(command);

		res.status(200).json({
			message: '認証コードを再送信しました'
		});
	} catch (error) {
		console.error('認証コード再送信エラー:', error);

		// エラーメッセージの日本語化
		let errorMessage = '認証コードの再送信に失敗しました';
		if (error.name === 'UserNotFoundException') {
			errorMessage = '指定されたメールアドレスのユーザーが見つかりません';
		} else if (error.name === 'InvalidParameterException') {
			errorMessage = '無効なパラメータが指定されました';
		} else if (error.name === 'LimitExceededException') {
			errorMessage = '試行回数が制限を超えました。しばらく時間をおいて再度お試しください';
		}

		res.status(400).json({
			message: errorMessage
		});
	}
});

/************************************
* HTTP post method for  *
*************************************/
app.post(path + '/success_url', async (req, res) => {
	console.log('success_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「OK,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(200).send('OK,');
});

/************************************
* HTTP post method for  *
*************************************/
app.post(path + '/cancel_url', async (req, res) => {
	console.log('cancel_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「OK,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(200).send('OK,');
});

/************************************
* HTTP post method for  *
*************************************/
app.post(path + '/error_url', async (req, res) => {
	console.log('error_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「NG,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(500).send('NG,');
});

/************************************
* HTTP post method for  *
*************************************/
app.post(path + '/pagecon_url', async (req, res) => {
	console.log('pagecon_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「OK,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(200).send('OK,');
});


app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
