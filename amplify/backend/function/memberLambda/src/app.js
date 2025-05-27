/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
  http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, SignUpCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const bodyParser = require('body-parser');
const validator = require('validator'); 

const express = require('express');
const iconv = require('iconv-lite');
const CryptoJS = require('crypto-js');
const { parseStringPromise } = require('xml2js');
const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-northeast-1' });

const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;

const GSI_BY_EMAIL = process.env.GSI_BY_EMAIL;
const GSI_BY_CUST_CODE = process.env.GSI_BY_CUST_CODE;
const GSI_BY_EMAIL_PHONE = process.env.GSI_BY_EMAIL_PHONE;

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = process.env.TABLE_NAME;
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
app.use(express.json());
app.use(awsServerlessExpressMiddleware.eventContext())
// カスタムURLエンコードパーサの設定
app.use((req, res, next) => {
	const contentType = req.headers['content-type'] || '';
	const isUrlEncoded = /^application\/x-www-form-urlencoded/i.test(contentType);
	const isShiftJIS = /charset\s*=\s*shift_jis/i.test(contentType);

	if (isUrlEncoded && isShiftJIS) {
		let rawData = [];

		req.on('data', chunk => rawData.push(chunk));
		req.on('end', () => {
			try {
				const buffer = Buffer.concat(rawData);
				const decodedText = iconv.decode(buffer, 'shift_jis');
				const parsedBody = Object.fromEntries(new URLSearchParams(decodedText));

				req.body = parsedBody;
				next();
			} catch (err) {
				console.error('Shift_JIS処理エラー:', err);
				res.status(400).send('デコードに失敗しました');
			}
		});

		req.on('error', err => {
			console.error('データ受信エラー:', err);
			res.status(500).send('システムエラー');
		});
	} else {
		// Shift_JIS以外は標準パーサーを使用
		express.urlencoded({ extended: true })(req, res, next);
	}
});

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
 * HTTP Get method to 会員情報を取得 *
 ************************************/
app.get(path + '/member-info', async function (req, res) {
	const inputEmail = req.query.email;

	try {
		const queryParams = {
			TableName: tableName,
			IndexName: GSI_BY_EMAIL,
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			},
		};

		console.log('会員情報取得パラメタ', queryParams);

		const commandForQuery = new QueryCommand(queryParams);
		const queryResult = await ddbDocClient.send(commandForQuery);

		if (!queryResult.Items || queryResult.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: '対象のアイテムが見つかりませんでした' })
			};
		}

		console.log('取得されたアイテム', queryResult)
		res.status(200).json(queryResult.Items[0]);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message })
	}
});

/************************************
 * HTTP Get method to sess_idをDynamoDBに保存 *
 ************************************/
app.put(path + '/add-session-id', async function (req, res) {
	const inputEmail = req.body.email;
	const newSessionId = req.body.sessionId;

	try {
		const queryParams = {
			TableName: tableName,
			IndexName: GSI_BY_EMAIL,
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			},
		};

		console.log('セッションID追加用会員情報取得パラメタ', queryParams);

		const commandForQuery = new QueryCommand(queryParams);
		const queryResult = await ddbDocClient.send(commandForQuery);

		if (!queryResult.Items || queryResult.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: '対象のアイテムが見つかりませんでした' })
			};
		}

		const fetchedMemberInfo = queryResult.Items[0];
		const { member_id, membership_type } = fetchedMemberInfo;

		// 更新したアイテムを保存
		const updateParams = {
			TableName: tableName,
			Key: {
				member_id,
				membership_type
			},
			UpdateExpression: `
					SET session_id = list_append(
						if_not_exists(session_id, :empty_list),
						:new_vals
					)
				`,
			ExpressionAttributeValues: {
				':empty_list': [],
				':new_vals': [newSessionId]
			}
		};

		const command = new UpdateCommand(updateParams);
		const result = await ddbDocClient.send(command);
		console.log('Update successful:', JSON.stringify(result));
		res.status(200).send();
	} catch (err) {
		console.error('Error updating data:', err);
		res.status(500).json({ success: false, error: 'Error adding data' });
	}
});


/************************************
 * HTTP Get method to sess_idをDynamoDBに保存 *
 ************************************/
app.put(path + '/remove-session-id', async function (req, res) {
	const inputEmail = req.body.email;
	const targetSessionId = req.body.sessionId;
  
	try {
	  // 1. email からアイテム取得
	  const queryParams = {
		TableName: tableName,
		IndexName: GSI_BY_EMAIL,
		KeyConditionExpression: 'email = :email',
		ExpressionAttributeValues: {
		  ':email': inputEmail
		},
	  };
	  console.log('セッションID削除用会員情報取得パラメタ', queryParams);
  
	  const commandForQuery = new QueryCommand(queryParams);
	  const queryResult = await ddbDocClient.send(commandForQuery);
  
	  if (!queryResult.Items || queryResult.Items.length === 0) {
		console.log('指定のメールアドレスが見つかりませんでした', inputEmail)
		return res.status(404).json({ message: '対象のアイテムが見つかりませんでした' });
	  }
  
	  const fetchedMemberInfo = queryResult.Items[0];
	  const { member_id, membership_type } = fetchedMemberInfo;
	  // session_id がない場合は空配列にフォールバック
	  const sessionList = Array.isArray(fetchedMemberInfo.session_id)
		? fetchedMemberInfo.session_id
		: [];
  
	  // 2. targetSessionId が含まれているか確認
	  if (!sessionList.includes(targetSessionId)) {
		console.log('指定のセッションIDが見つかりませんでした', inputEmail)
		return res.status(404).json({ message: '指定のセッションIDが見つかりませんでした' });
	  }
  
	  // 3. 見つかった要素を除外
	  const filteredSessionIds = sessionList.filter(id => id !== targetSessionId);
  
	  // 4. フィルタ済みリストで上書き更新
	  const updateParams = {
		TableName: tableName,
		Key: { member_id, membership_type },
		UpdateExpression: 'SET session_id = :new_list',
		ExpressionAttributeValues: {
		  ':new_list': filteredSessionIds
		}
	  };
  
	  const commandForUpdate = new UpdateCommand(updateParams);
	  const result = await ddbDocClient.send(commandForUpdate);
	  console.log('セッションID削除成功:', JSON.stringify(result));
  
	  res.status(200).json({ success: true });
	} catch (err) {
	  console.error('Error updating data:', err);
	  res.status(500).json({ success: false, error: 'Error removing session ID' });
	}
  });  

/************************************
 * HTTP Get method to 既存のアイテムのcust_codeに上書き *
 ************************************/
app.put(path + '/put-cust-code', async function (req, res) {
	const memberId = req.body.memberId;
	const email = req.body.email;
	const custCode = req.body.custCode;

	try {
		// 更新したアイテムを保存
		const params = {
			TableName: tableName,
			Key: { member_id: memberId, membership_type: 'regular' },
			UpdateExpression: 'SET cust_code = :cust_code',
			ExpressionAttributeValues: {
                ":cust_code": custCode
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
 * HTTP Get method to 会員情報を取得 *
 ************************************/
app.get(path + '/member-info-to-register-card', async function (req, res) {
	const inputEmail = req.query.email;
	const inputPhoneNumber = req.query.phoneNumber;

	try {
		const queryParams = {
			TableName: tableName,
			IndexName: GSI_BY_EMAIL_PHONE,
			KeyConditionExpression: 'email = :email AND phone_number = :phoneNumber',
			ExpressionAttributeValues: {
				':email': inputEmail,
				':phoneNumber': inputPhoneNumber
			},
		};

		console.log('会員情報取得パラメタ', queryParams);

		const commandForQuery = new QueryCommand(queryParams);
		const queryResult = await ddbDocClient.send(commandForQuery);
		if (!queryResult.Items || queryResult.Items.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: '対象のアイテムが見つかりませんでした' })
			};
		}

		console.log('取得されたアイテム', queryResult);

		const memberInfo = queryResult.Items[0];

		// Cognito で email_verified を確認
		const getUserCmd = new AdminGetUserCommand({
			UserPoolId: USER_POOL_ID,
			Username: inputEmail // Usernameはメールアドレスと同じ
		});
		const userResp = await cognitoClient.send(getUserCmd);
		// 'email_verified' は "true" / "false" 文字列で返る
		const emailVerifiedAttr = userResp.UserAttributes?.find(
		  (attr) => attr.Name === 'email_verified'
		);
		// アイテムにCognitoのメアド認証状態をつけて返却
		const isEmailVerified = emailVerifiedAttr?.Value === 'true';
		memberInfo.is_email_verified = isEmailVerified;
		console.log('決済情報登録画面へ遷移するmemberInfo', memberInfo)

		// // ここでは「未承認なら emailVerified=false を付けて返す」だけにしている。
		// console.log('memberInfo', ...memberInfo);
		// console.log('emailverified', emailVerified)
		// res.status(200).json({
		// 	...memberInfo,
		// 	emailVerified: isEmailVerified,
		// });

		res.status(200).json(memberInfo);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message })
	}
});

/************************************
* HTTP post method for DynamoDBにすでにメールアドレスが存在するか確認 *
*************************************/
app.post(path + '/check-for-duplicate-email-in-database', async function (req, res) {
	try {
        const inputEmail = req.body?.inputEmail?.trim();

        console.log('登録試行メールアドレス:', inputEmail);

        // 1. 入力バリデーション
        if (!inputEmail || !validator.isEmail(inputEmail)) {
            return res.status(400).json({
                status: 'INVALID_EMAIL_FORMAT',
                message: '有効なメールアドレスを正しく入力してください。'
            });
        }

        // 2. DynamoDBクエリ準備
        const queryParams = {
            TableName: tableName,
            IndexName: GSI_BY_EMAIL,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': inputEmail
            }
        };

        console.log('DynamoDBクエリパラメータ:', queryParams);

        // 3. DynamoDBクエリ実行
        const command = new QueryCommand(queryParams);
        const result = await ddbDocClient.send(command);

        // 4. 結果チェック
        if (result.Count && result.Count > 0) {
            console.log('重複メールアドレス検出');
            return res.status(409).json({ // 409 Conflict
                status: 'ALREADY_REGISTERED_IN_DATABASE',
                message: 'このメールアドレスはすでに登録されています。'
            });
        }

        console.log('重複なし、新規登録可能');
        return res.status(200).json({
            status: 'NEW_USER',
            message: '新規登録が可能です。'
        });

    } catch (error) {
        console.error('重複チェックエラー:', error);

        return res.status(500).json({
            status: 'SERVER_ERROR',
            message: 'サーバー内部エラーが発生しました。時間を置いて再度お試しください。'
        });
    }
});

/************************************
* HTTP post method for DynamoDBにユーザー登録 *
*************************************/
app.post(path + '/register-user-to-database', async (req, res) => {
	const COUNTER_TABLE = process.env.COUNTER_TABLE;
	const maxRetries    = 3;
  
	try {
		const {
			lastName, firstName, lastNameKana, firstNameKana,
			phoneNumber, postalCode, address,
			inputEmail, membershipType, paymentPlan,
			isTermsAgreed, custCode
		} = req.body || {};
	
		// 1. バリデーション（省略）
		if (!lastName || !firstName || !lastNameKana || !firstNameKana ||
			!phoneNumber || !postalCode || !address ||
			!inputEmail || !membershipType || !paymentPlan || isTermsAgreed === undefined) {
			return res.status(400).json({
				status: 'INVALID_REQUEST',
				message: '入力必須項目が不足しています。'
			});
		}
		if (!validator.isEmail(inputEmail)) {
			return res.status(400).json({
				status: 'INVALID_EMAIL_FORMAT',
				message: '有効なメールアドレスを入力してください。'
			});
		}
		// 2〜4 をリトライループで実行
		let newMemberId;
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				// --- ステップ 2: カウンタ更新 ---
				const counterResult = await ddbDocClient.send(new UpdateCommand({
					TableName: COUNTER_TABLE,
					Key: { counter_id: 'member_id' },
					UpdateExpression: 'ADD #val :inc',
					ExpressionAttributeNames: { '#val': 'current_value' },
					ExpressionAttributeValues: { ':inc': 1 },
					ReturnValues: 'UPDATED_NEW'
				}));
				const newCounterValue = counterResult.Attributes.current_value;
				console.log('新しく作成されたmember_id', newCounterValue);
				newMemberId = String(newCounterValue).padStart(10, '0');
		
				// --- ステップ 3: 日付生成 ---
				const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
								.toISOString()
								.slice(0, 10);
		
				// --- ステップ 4: トランザクション実行 ---
				const transactParams = {
					TransactItems: [
					{
						ConditionCheck: {
						TableName: COUNTER_TABLE,
						Key: { counter_id: 'member_id' },
						ConditionExpression: '#val = :expected',
						ExpressionAttributeNames: { '#val': 'current_value' },
						ExpressionAttributeValues: { ':expected': newCounterValue }
						}
					},
					{
						Put: {
						TableName: tableName,
						Item: {
							member_id:             newMemberId,
							membership_type:       membershipType,
							email:                 inputEmail,
							last_name:             lastName,
							first_name:            firstName,
							last_name_kana:        lastNameKana,
							first_name_kana:       firstNameKana,
							postal_code:           postalCode,
							phone_number:          phoneNumber,
							address:               address,
							is_credit_card_valid:  false,
							can_login:             false,
							cust_code:             custCode,
							payment_plan:          paymentPlan,
							payment_success_history: [],
							payment_failure_history: [],
							is_terms_agreed:       isTermsAgreed,
							is_free_account:       false,
							update_reason:         '新規登録',
							expires_at:            '',
							created_at:            today,
							updated_at:            today,
							deleted_at:            ''
						},
						ConditionExpression: 'attribute_not_exists(member_id)'
						}
					}
					]
				};
				await ddbDocClient.send(new TransactWriteCommand(transactParams));
		
				// 成功したらループを抜ける
				break;
	
			} catch (error) {
				// トランザクションの条件失敗時のみリトライ
				const isTxnCancel = error.name === 'TransactionCanceledException'
					&& error.CancellationReasons?.some(r => r.Code === 'ConditionalCheckFailed');
		
				if (isTxnCancel && attempt < maxRetries) {
					// エクスポネンシャル＆ランダムバックオフ
					const backoffMs = Math.pow(2, attempt) * 100 + Math.random() * 100;
					await new Promise(r => setTimeout(r, backoffMs));
					continue;  // 次の attempt へ
				}
				// それ以外、またはリトライ上限に達したら throw
				throw error;
			}
	 	}
  
		// 5. 成功レスポンス
		return res.status(200).json({
			status:  'USER_SUCCESSFULLY_REGISTERED_TO_DATABASE',
			message: 'ユーザー情報をトランザクションで登録しました。',
			memberId: newMemberId
		});
	} catch (error) {
		console.error('登録処理エラー:', error);
		if (error.name === 'TransactionCanceledException') {
			console.error('CancellationReasons:', error.CancellationReasons);
		}
		return res.status(500).json({
			status:  'SERVER_ERROR',
			message: 'サーバー内部エラーが発生しました。再度お試しください。'
		});
	}
});
  
/************************************
* HTTP post method for insert object *
*************************************/
app.post(path + '/register-user-to-cognito', async function (req, res) {
    const inputEmail = req.body?.inputEmail?.trim();
    const inputPassword = req.body?.inputPassword;

    console.log('Cognito登録試行メールアドレス:', inputEmail);

    // 1. 入力バリデーション
    if (!inputEmail || !validator.isEmail(inputEmail) || !inputPassword) {
        return res.status(400).json({
            status: 'INVALID_REQUEST',
            message: '有効なメールアドレスとパスワードを入力してください。'
        });
    }

    try {
        // 2. Cognitoに新規登録
        const signUpParams = {
            ClientId: CLIENT_ID,
            Username: inputEmail,
            Password: inputPassword,
            UserAttributes: [
                { Name: 'email', Value: inputEmail }
            ]
        };
        console.log('Cognito SignUpパラメータ:', signUpParams);

        const signUpCommand = new SignUpCommand(signUpParams);
        const signUpResponse = await cognitoClient.send(signUpCommand);

        console.log('Cognito登録成功レスポンス:', signUpResponse);

        return res.status(200).json({
            status: 'SUCCESSFULLY_REGISTERED_TO_COGNITO_AND_PENDING_CONFIRMATION',
            message: '認証コードを送信しました。'
        });

    } catch (error) {
        console.error('Cognito登録エラー:', error);

        // 3. Cognito登録に失敗したらDynamoDBに仮登録されたデータを削除する
        try {
            const queryParams = {
                TableName: tableName,
                IndexName: GSI_BY_EMAIL,
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': inputEmail
                }
            };

            console.log('DynamoDB削除対象クエリパラメータ:', queryParams);

            const queryCommand = new QueryCommand(queryParams);
            const queryResult = await ddbDocClient.send(queryCommand);

            if (!queryResult.Items || queryResult.Items.length === 0) {
                console.warn('削除対象データが存在しませんでした');
            } else {
                const itemToDelete = queryResult.Items[0];

                const deleteParams = {
                    TableName: tableName,
                    Key: {
                        member_id: itemToDelete.member_id,
                        ...(itemToDelete.membership_type && {
                            membership_type: itemToDelete.membership_type
                        })
                    }
                };

                console.log('DynamoDB削除実行パラメータ:', deleteParams);

                const deleteCommand = new DeleteCommand(deleteParams);
                await ddbDocClient.send(deleteCommand);

                console.log('仮登録データ削除成功');
            }
        } catch (deleteError) {
            console.error('DynamoDB仮登録データ削除失敗:', deleteError);
        }

        return res.status(500).json({
            status: 'COGNITO_SIGNUP_FAILED',
            message: 'ユーザー登録に失敗しました。時間を置いて再度お試しください。'
        });
    }
});

/************************************
* HTTP post method for 認証コード確認 *
*************************************/
app.post(path + '/confirm-signup', async (req, res) => {
	const inputEmail = req.body?.inputEmail?.trim();
    const verificationCode = req.body?.verificationCode?.trim();

    // 1. 入力チェック
    if (!inputEmail || !validator.isEmail(inputEmail) || !verificationCode) {
        return res.status(400).json({
            status: 'INVALID_REQUEST',
            message: '有効なメールアドレスと認証コードを入力してください。'
        });
    }

    try {
        console.log(`認証コード確認開始: ${inputEmail}`);

        // 2. Cognito 認証確認
        const command = new ConfirmSignUpCommand({
            ClientId: CLIENT_ID,
            Username: inputEmail,
            ConfirmationCode: verificationCode
        });

        await cognitoClient.send(command);

        console.log(`Cognito認証コード確認成功: ${inputEmail}`);



        return res.status(200).json({
            status: 'EMAIL_CONFIRMED',
            message: 'メールアドレスの認証が完了しました。'
        });

    } catch (error) {
        console.error('認証コード確認エラー:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // エラー種類ごとにメッセージとステータスを分岐
        let errorMessage = '認証に失敗しました。';
        let statusCode = 400; // 基本はBad Requestとする

        switch (error.name) {
            case 'UserNotFoundException':
                errorMessage = '指定されたメールアドレスのユーザーが見つかりません。';
                break;
            case 'CodeMismatchException':
                errorMessage = '認証コードが正しくありません。';
                break;
            case 'ExpiredCodeException':
                errorMessage = '認証コードの有効期限が切れています。新しいコードをリクエストしてください。';
                break;
            case 'NotAuthorizedException':
                errorMessage = 'ユーザーはすでに認証済みです。';
                statusCode = 409; // すでに認証済みならConflictが適切
                break;
            case 'InvalidParameterException':
                errorMessage = '無効なパラメータが指定されました。';
                break;
            default:
                statusCode = 500; // 未知エラーはサーバーエラー
                errorMessage = '内部エラーが発生しました。時間を置いて再度お試しください。';
                break;
        }

        return res.status(statusCode).json({
            status: 'CONFIRM_SIGNUP_FAILED',
            message: errorMessage
        });
    }
});

/************************************
* HTTP post method for 認証コード再送信 *
*************************************/
app.post(path + '/resend-code', async (req, res) => {
	const inputEmail = req.body?.inputEmail?.trim();

    // 1. 入力バリデーション
    if (!inputEmail || !validator.isEmail(inputEmail)) {
        return res.status(400).json({
            status: 'INVALID_REQUEST',
            message: '有効なメールアドレスを正しく入力してください。'
        });
    }

    try {
        console.log('認証コード再送信開始:', inputEmail);

        // 2. 認証コード再送信コマンド
        const command = new ResendConfirmationCodeCommand({
            ClientId: CLIENT_ID,
            Username: inputEmail
        });

        await cognitoClient.send(command);

        console.log('認証コード再送信成功:', inputEmail);

        return res.status(200).json({
            status: 'RESEND_CODE_SUCCESS',
            message: '認証コードを再送信しました。'
        });

    } catch (error) {
        console.error('認証コード再送信エラー:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        let errorMessage = '認証コードの再送信に失敗しました。';
        let statusCode = 400; // デフォルトはBad Request

        switch (error.name) {
            case 'UserNotFoundException':
                errorMessage = '指定されたメールアドレスのユーザーが見つかりません。';
                break;
            case 'InvalidParameterException':
                errorMessage = '無効なパラメータが指定されました。';
                break;
            case 'LimitExceededException':
                errorMessage = '試行回数制限を超えました。しばらく時間を空けてから再試行してください。';
                statusCode = 429; // リクエスト制限
                break;
            default:
                statusCode = 500; // その他はサーバーエラー
                errorMessage = '内部エラーが発生しました。時間を置いて再度お試しください。';
                break;
        }

        return res.status(statusCode).json({
            status: 'RESEND_CODE_FAILED',
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
	console.log('結果通知された', req.body);
	// 決済システム接続先
	const sbpsApiEndPoint = process.env.SBPS_API_END_POINT;
	// Basic認証ID
	const basicAuthId = process.env.BASIC_AUTH_ID;
	// Basic認証パスワード
	const basicAuthPwd = process.env.BASIC_AUTH_PWD;
	// POST時のAuthorizationヘッダーに使用
	const credentials = Buffer.from(`${basicAuthId}:${basicAuthPwd}`).toString('base64');

	// 決済システムから受け取ったデータ。XMLファイルをパース済み
	const {
		merchant_id,
		service_id,
		cust_code,
		free1,
		request_date
	} = req.body;
	const paymentPlan = req.body.free1;
	// free1項目はBase64にエンコードが必要
	const encodedPaymentPlan = btoa(decodeURIComponent(paymentPlan));
	const item_id = paymentPlan

	// 課金額は2025年4月中は3,960円、5月以降は4,840円にする
	// 日本時間を取得
	// const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000); // UTC+9時間。YYYY-MM-DDThh:mm:ssZ表記
	// // 比較対象の日付（日本時間として扱う。本日との比較に使うのはtodayだけであり、todayは日本時間（UTC+9時間）にしてある）
	// const mayFirst2025 = new Date('2025-05-01T00:00:00');
	// 1. 今の日本時間を表す Date オブジェクトを作成
	const now = new Date();
	const nowUTC = now.getTime() + now.getTimezoneOffset() * 60000; // UTC へ変換
	const nowJST = new Date(nowUTC + 9 * 60 * 60000); // UTC → JST (＋9時間)
	const today = nowJST.toISOString().slice(0, 10); // YYYY-MM-DD表記
	const mayFirst2025 = new Date('2025-05-01T00:00:00+09:00');

	// 課金額
	// const amountOfYearly = (nowJST < mayFirst2025) ? '3960' : '4840';
	const amountOfYearly = '4840';
	const amountOfMonthly = '440';

	// 暗号化フラグ
	const encrypted_flg = '0'; // 暗号化しない

	let queryFetchedItem;
	try {
		// 取得した結果はupdateParamsでも使う
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// GSIで対象アイテムを取得
		const queryParams = {
			TableName: tableName,
			IndexName: GSI_BY_CUST_CODE,
			KeyConditionExpression: 'cust_code = :cust_code',
			ExpressionAttributeValues: {
				':cust_code': cust_code
			}
		};
console.log('queryParams',queryParams)
		const commandForQuery = new QueryCommand(queryParams);
		const queryResult = await ddbDocClient.send(commandForQuery);
console.log('queryResult', queryResult)
		if (!queryResult.Items || queryResult.Items.length === 0) {
			return res.status(404).json({ error: '指定されたemailのアイテムが見つかりませんでした' });
		}

		// 最初の一致アイテムのみ処理（通常はユニークemailの前提）
		queryFetchedItem = queryResult.Items[0];
		console.log('queryFetchedItem', queryFetchedItem)
		const order_id = queryFetchedItem.member_id; // member_idをorder_idとして使用
		const { member_id, membership_type } = queryFetchedItem; // membership_typeはupdateParamsのソートキーとして使う
		//////////////////////////////////////////////////////////////////////////////////////////////////////////

		// 年払い用の決済要求・確定要求を送信
		if (paymentPlan === 'yearly') {
			// チェックサム作成
			const paymentElementsForHash = [merchant_id, service_id, cust_code, order_id, item_id, amountOfYearly, free1, encrypted_flg, request_date];
			const sbps_hashcode = generateHash(paymentElementsForHash);

			//////////////////
			// 決済要求を送信 //
			//////////////////
			const paymentResult = await paymentRequest(merchant_id, service_id, cust_code, order_id, item_id, amountOfYearly, encodedPaymentPlan, encrypted_flg, request_date, sbps_hashcode);
			if (paymentResult['sps-api-response'].res_result !== 'OK') {
				return res.status(404).json({ error: '会員登録には成功しましたが、決済情報登録に失敗しました。' });
			}

			//////////////////
			// 確定要求を送信 //
			//////////////////
			const resSpsTransactionId = paymentResult['sps-api-response'].res_sps_transaction_id;
			const confirmElementsForHash = [merchant_id, service_id, resSpsTransactionId, request_date];
			const res_sps_hashcode = generateHash(confirmElementsForHash);
			// 決済要求が成功したら、確定要求を送信
			const confirmResult = await confirmPayment(merchant_id, service_id, resSpsTransactionId, request_date, res_sps_hashcode);
			// 購入要求・確定要求が成功したら、DynamoDBのアトリビュート変更（GSI使用）
			if (confirmResult['sps-api-response'].res_result !== 'OK') {
				return res.status(404).json({ error: '会員登録には成功しましたが、決済情報登録に失敗しました。' });
			}

			// can_loginをtrueに更新してログイン可能とする
			// 有効期限は、来年の登録日と同じ日の前日まで（2025-05-10に登録なら2026-05-09）
			const expirationDay = getTheDayBeforeInNextYear(nowJST);
			await updateMemberInfo(member_id, membership_type, today, expirationDay);

			res.set('Content-Type', 'text/plain');
			res.status(200).send('OK,');
		}

		// 本日の日付により、月払い用の決済要求・確定要求を送信
		if(paymentPlan === 'monthly') {
			// const juneFirst2025 = new Date('2025-06-01T00:00:00');
			// const juneFirst2025 = new Date('2025-06-01T00:00:00+09:00');
			const isBeforeJstJuneFirst2025 = checkIsBeforeJstJuneFirst2025();

			// 2025年5月いっぱいは決済しない。6月1日0時00分以降は決済を通す。
			if (isBeforeJstJuneFirst2025) {
				console.log('2025年5月以前の月払い加入者の処理')
				// can_loginをtrueに更新してログイン可能とする
				const expirationDay = '2025-05-31';
				await updateMemberInfo(member_id, membership_type, today, expirationDay);

				res.set('Content-Type', 'text/plain');
				res.status(200).send('OK,');
			}

			if (!isBeforeJstJuneFirst2025){
				console.log('2025年6月以降の月払い加入者の処理')
				// チェックサム作成	
				const paymentElementsForHash = [merchant_id, service_id, cust_code, order_id, item_id, amountOfMonthly, free1, encrypted_flg, request_date];
				const sbps_hashcode = generateHash(paymentElementsForHash);

				//////////////////
				// 決済要求を送信 //
				//////////////////
				const paymentResult = await paymentRequest(merchant_id, service_id, cust_code, order_id, item_id, amountOfMonthly, encodedPaymentPlan, encrypted_flg, request_date, sbps_hashcode);
				if (paymentResult['sps-api-response'].res_result !== 'OK') {
					return res.status(404).json({ error: '会員登録には成功しましたが、決済情報登録に失敗しました。' });
				}

				//////////////////
				// 確定要求を送信 //
				//////////////////
				const resSpsTransactionId = paymentResult['sps-api-response'].res_sps_transaction_id;
				const confirmElementsForHash = [merchant_id, service_id, resSpsTransactionId, request_date];
				const res_sps_hashcode = generateHash(confirmElementsForHash);
				// 決済要求が成功したら、確定要求を送信
				const confirmResult = await confirmPayment(merchant_id, service_id, resSpsTransactionId, request_date, res_sps_hashcode);
				// 購入要求・確定要求が成功したら、DynamoDBのアトリビュート変更（GSI使用）
				if (confirmResult['sps-api-response'].res_result !== 'OK') {
					return res.status(404).json({ error: '会員登録には成功しましたが、決済情報登録に失敗しました。' });
				}

				// can_loginをtrueに更新してログイン可能とする
				const expirationDay = getLastDayOfMonth(nowJST);
				await updateMemberInfo(member_id, membership_type, today, expirationDay);

				res.set('Content-Type', 'text/plain');
				res.status(200).send('OK,');
			}
		}
	} catch (err) {
		console.error('更新エラー:', err);
		return res.status(500).json({ error: 'サーバーエラーが発生しました' });
	}

	/**
	 * 決済要求を送信
	 */
	async function paymentRequest(merchant_id, service_id, cust_code, order_id, item_id, amount, encodedPaymentPlan, encrypted_flg, request_date, sbps_hashcode) {
		const xmlForPayment = `<?xml version="1.0" encoding="Shift_JIS"?>
			<sps-api-request id="ST01-00131-101">
				<merchant_id>${merchant_id}</merchant_id>
				<service_id>${service_id}</service_id>
				<cust_code>${cust_code}</cust_code>
				<order_id>${order_id}</order_id>
				<item_id>${item_id}</item_id>
				<item_name></item_name>
				<tax></tax>
				<amount>${amount}</amount>
				<free1>${encodedPaymentPlan}</free1>
				<free2></free2>
				<free3></free3>
				<order_rowno></order_rowno>
				<sps_cust_info_return_flg></sps_cust_info_return_flg>
				<dtls>
					<dtl_rowno></dtl_rowno>
					<dtl_item_id></dtl_item_id>
					<dtl_item_name></dtl_item_name>
					<dtl_item_count></dtl_item_count>
					<dtl_item_tax></dtl_item_tax>
					<dtl_item_amount></dtl_item_amount>
				</dtls>
				<pay_method_info>
					<dealings_type></dealings_type>
					<divide_times></divide_times>
				</pay_method_info>
				<pay_option_manage>
					<token></token>
					<token_key></token_key>
					<cust_manage_flg></cust_manage_flg>
					<cardbrand_return_flg></cardbrand_return_flg>
				</pay_option_manage>

				<encrypted_flg>${encrypted_flg}</encrypted_flg>
				<request_date>${request_date}</request_date>
				<limit_second></limit_second>
				<sps_hashcode>${sbps_hashcode}</sps_hashcode>
			</sps-api-request>`;

		console.log('決済要求送信xml', xmlForPayment)

		// Shift_JISへ変換してからSBPSに送信
		const encodedXml = iconv.encode(xmlForPayment, 'Shift_JIS');
		// 決済システムと接続
		const response = await fetch(sbpsApiEndPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/xml; charset=Shift_JIS',
				'Authorization': `Basic ${credentials}`
			},
			body: encodedXml
		});

		// レスポンスをデコード
		const buffer = await response.arrayBuffer();
		const decodedBody = iconv.decode(Buffer.from(buffer), 'Shift_JIS');
		// レスポンスを XML → JSON に変換
		const resultJson = await parseStringPromise(decodedBody, { explicitArray: false });
		console.log('決済要求結果JSON', resultJson)

		return resultJson;
	}

	/**
	 * 確定要求を送信
	 */
	async function confirmPayment(merchant_id, service_id, resSpsTransactionId, request_date, res_sps_hashcode) {
		// 送信用XMLデータ整形
		const xmlForConfirm = `<?xml version="1.0" encoding="Shift_JIS"?>
			<sps-api-request id="ST02-00101-101">
				<merchant_id>${merchant_id}</merchant_id>
				<service_id>${service_id}</service_id>
				<sps_transaction_id>${resSpsTransactionId}</sps_transaction_id>
				<tracking_id></tracking_id>
				<processing_datetime></processing_datetime>
				<request_date>${request_date}</request_date>
				<limit_second></limit_second>
				<sps_hashcode>${res_sps_hashcode}</sps_hashcode>
			</sps-api-request>`;

		console.log('送信確定要求xml', xmlForConfirm);

		// Shift_JISへ変換してからSBPSに送信
		const encodedXmlForConfirm = iconv.encode(xmlForConfirm, 'Shift_JIS');
		// 決済システムと接続
		const confirmReqResut = await fetch(sbpsApiEndPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/xml; charset=Shift_JIS',
				'Authorization': `Basic ${credentials}`
			},
			body: encodedXmlForConfirm
		});

		// レスポンスをデコード
		const confirmReqBuffer = await confirmReqResut.arrayBuffer();
		const confirmReqDecodedBody = iconv.decode(Buffer.from(confirmReqBuffer), 'Shift_JIS');

		// レスポンスを XML → JSON に変換
		const confirmResultJson = await parseStringPromise(confirmReqDecodedBody, { explicitArray: false });
		console.log('確定要求結果JSON', confirmResultJson)

		return confirmResultJson;
	}

	/**
	 * メンバー情報を更新
	 */
	async function updateMemberInfo(member_id, membership_type, today, expirationDay) {
		try {
			// can_loginをtrueに更新してログイン可能とする
			const updateParams = {
				TableName: tableName,
				Key: {
					member_id,
					membership_type
				},
				UpdateExpression: `SET can_login = :trueVal, 
									expires_at = :expirationDay,
									is_credit_card_valid = :trueVal,
									payment_success_history = list_append(
										if_not_exists(payment_success_history, :empty_list),
										:historyEntry
									)`,
				ExpressionAttributeValues: {
					':trueVal': true,
					':expirationDay': expirationDay,
					':empty_list': [],
					':historyEntry': [ today ] 
				}
			};

			const commandForUpdate = new UpdateCommand(updateParams);
			const updateResult = await ddbDocClient.send(commandForUpdate);
			console.log('更新結果', updateResult);
			return updateResult;
		} catch (err) {
			console.error('更新エラー:', err);
			return res.status(500).json({ error: 'サーバーエラーが発生しました' });
		}
	}
	
	/**
	 * チェックサム（ハッシュコード）生成
	 */
	function generateHash(inputs) {
		const hashKey = process.env.HASH_KEY;
		// 各要素の前後のスペースを取り除いて結合
		const concatenatedValues = inputs.map(input => input.trim()).join('');
		const stringToHash = concatenatedValues + hashKey;
		const hash = CryptoJS.SHA1(stringToHash).toString().toUpperCase();

		return hash;
	};

	/**
	 * 翌年の登録月と同じ日の前日を取得
	 */
	function getTheDayBeforeInNextYear (nowJST) {
		// 来年の同じ日
		const nextYearSameDay = new Date(nowJST);
		nextYearSameDay.setFullYear(nextYearSameDay.getFullYear() + 1);
		// 来年の同じ日の前日
		nextYearSameDay.setDate(nextYearSameDay.getDate() - 1);
		// YYYY-MM-DDに整形
		const yyyy = nextYearSameDay.getFullYear();
		const mm   = String(nextYearSameDay.getMonth() + 1).padStart(2, '0');
		const dd   = String(nextYearSameDay.getDate()).padStart(2, '0');
		const formattedDate = `${yyyy}-${mm}-${dd}`;

		return formattedDate;
	}

	/**
	 * 登録月の末尾を取得
	 */
	function getLastDayOfMonth(nowJST) {
		// 年と月を取得
		const year  = nowJST.getFullYear();
		const month = nowJST.getMonth();  // 0～11
		// 「来月の1日」の前日＝今月の末日 を取得
		// new Date(年, 月＋1, 0) で“月＋1”の0日目＝“当月末日”が得られる
		// 月の初日は当然1日なので、0日を指定すると1日の前日になる
		// new Date(year, month + 1, 0) は月・日付のオーバーフローを自動で正規化するので、12⽉→1⽉の跨ぎにも対応
		const lastDayOfMonth = new Date(year, month + 1, 0);
		// YYYY‑MM‑DDに整形
		const yyyy = lastDayOfMonth.getFullYear();
		const mm   = String(lastDayOfMonth.getMonth() + 1).padStart(2, '0');
		const dd   = String(lastDayOfMonth.getDate()).padStart(2, '0');
		const formattedLastDay = `${yyyy}-${mm}-${dd}`;

		return formattedLastDay;
	}

	/**
	 * 
	 * @returns 2025年6月1日より前かどうかを判定
	 */
	function checkIsBeforeJstJuneFirst2025() {
		// JST は UTC+9h なのでオフセットをミリ秒で用意
		const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
	  
		// 現在の UTC ミリ秒を取得
		const nowUtcMs = Date.now();
	  
		// Date.UTC(2025, 5, 1, 0, 0, 0) は「2025-06-01T00:00:00Z」のタイムスタンプ
		// これから JST の基準時刻との差（9h）を引くと、
		// 「2025-06-01T00:00:00 JST」に相当する UTC タイムスタンプになる
		const thresholdUtcMs = Date.UTC(2025, 5, 1, 0, 0, 0) - JST_OFFSET_MS;
	  
		return nowUtcMs < thresholdUtcMs;
	  }
});

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app