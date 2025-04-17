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
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const bodyParser = require('body-parser');

const express = require('express');
const iconv = require('iconv-lite');
const CryptoJS = require('crypto-js');
const { parseStringPromise } = require('xml2js');
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
const gsiByEmail = 'gsiByEmail';
const gsiByCustCode = 'gsiByCustCode';

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
			IndexName: gsiByEmail,
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

		res.status(200).json(queryResult.Items[0]);
	} catch (err) {
		res.statusCode = 500;
		res.json({ error: 'Could not load items: ' + err.message })
	}
});


/************************************
* HTTP post method for DynamoDBにすでにメールアドレスが存在するか確認 *
*************************************/
app.post(path + '/check-for-duplicate-email-in-database', async function (req, res) {
	const inputEmail = req.body.inputEmail;

	console.log('登録試行メールアドレス', inputEmail);

	if (!inputEmail) {
		return res.status(400).json({ error: 'メールアドレスは必須です' });
	}

	try {
		// DynamoDBでメールアドレスの存在確認（GSI使用）
		const queryParams = {
			TableName: tableName,
			IndexName: gsiByEmail,
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: {
				':email': inputEmail
			}
		};

		console.log('登録試行パラメータ', queryParams);

		const command = new QueryCommand(queryParams);
		const data = await ddbDocClient.send(command);

		// メールアドレスが存在する場合
		if (data.Count !== 0) {
			console.log('重複メールアドレス検出');
			return res.status(400).json({
				status: 'ALREADY_REGISTERED_IN_DATABASE',
				message: '登録済みのメールアドレスです'
			});
		}

		console.log('重複メールアドレスなし、登録可能');
		// メールアドレスが存在しない場合は、新規登録可能
		return res.status(200).json({
			status: 'NEW_USER',
			message: '新規登録可能です'
		});
	} catch (error) {
		console.error("Error checking user status:", error);
		return res.status(500).json({ error: 'すでに同じメールアドレスが登録されています。ほかのメールアドレスでお試しください。' });
	}
});

/************************************
* HTTP post method for DynamoDBにユーザー登録 *
*************************************/
app.post(path + '/register-user-to-database', async function (req, res) {
	const lastName = req.body.lastName;
	const firstName = req.body.firstName;
	const lastNameKana = req.body.lastNameKana;
	const firstNameKana = req.body.firstNameKana;
	const phoneNumber = req.body.phoneNumber;
	const postalCode = req.body.postalCode;
	const address = req.body.address;
	const inputEmail = req.body.inputEmail;
	const membershipType = req.body.membershipType;
	const paymentPlan = req.body.paymentPlan;
	const isTermsAgreed = req.body.isTermsAgreed;
	const custCode = req.body.custCode;
	console.log(req.body)
	console.log('DynamoDB登録試行メールアドレス', inputEmail);

	// 連番のmember_idを作成する
	// 全アイテムをスキャンして最大のmember_idを取得
	const scanParams = {
		TableName: tableName,
		ProjectionExpression: 'member_id'
	};

	const commandForScan = new ScanCommand(scanParams);
	const scanResult = await ddbDocClient.send(commandForScan);

	// member_idの最大値を取得
	let maxMemberId = 0;
	if (scanResult.Items && scanResult.Items.length > 0) {
		maxMemberId = Math.max(...scanResult.Items.map(item => parseInt(item.member_id)));
	}

	// 新しいmember_idを生成（10桁の文字列）
	const newMemberId = (maxMemberId + 1).toString().padStart(10, '0');

	//　created_atとupdated_atのために登録日を作成
	const today = new Date().toLocaleDateString("ja-JP", {
		year: "numeric", month: "2-digit",
		day: "2-digit"
	}).replaceAll('/', '-')

	// DynamoDBにユーザー情報を保存（isActive: false）
	const putItemParams = {
		TableName: tableName,
		Item: {
			'member_id': newMemberId,
			'can_login': false,
			'email': inputEmail,
			'membership_type': membershipType,
			'last_name': lastName,
			'first_name': firstName,
			'last_name_kana': lastNameKana,
			'first_name_kana': firstNameKana,
			'phone_number': phoneNumber,
			'postal_code': postalCode,
			'address': address,
			'deleted_at': '',
			'updated_at': today,
			'update_reason': '新規登録',
			'created_at': today,
			'is_credit_card_valid': false,
			'cust_code': custCode,
			'payment_plan': paymentPlan, // yearly, monthly
			'expires_at': '',
			'payment_success_history': [],
			'payment_failure_history': [],
			'is_terms_agreed': isTermsAgreed,
			'is_free_account': false
		}
	};

	console.log('登録試行パラメータ', putItemParams);

	try {
		const commandForPuttingData = new PutCommand(putItemParams);
		const data = await ddbDocClient.send(commandForPuttingData);

		res.status(200).json({
			status: 'USER_SUCCESSFULLY_REGISTERED_TO_DATABASE',
			message: 'ユーザー情報を正常にデータベースに登録しました。'
		});
	} catch (error) {
		console.error("Error in signup:", error);
		return res.status(500).json({ error: 'ユーザー登録に失敗しました。登録内容を確認してもう一度ご登録いただくか、時間を空けてお試しください。' });
	}
});

/************************************
* HTTP post method for insert object *
*************************************/
app.post(path + '/register-user-to-cognito', async function (req, res) {
	const inputEmail = req.body.inputEmail;
	const inputPassword = req.body.inputPassword;

	console.log('Cognito登録試行メールアドレス', inputEmail);

	try {
		const signUpParams = {
			ClientId: CLIENT_ID,
			Username: inputEmail,
			Password: inputPassword,
			UserAttributes: [
				{ Name: 'email', Value: inputEmail }
			]
		}
		console.log('sign up params for Cognito', signUpParams)

		const commandForSignUp = new SignUpCommand(signUpParams);
		const signUpResponse = await cognitoClient.send(commandForSignUp);

		console.log('Cognito登録レスポンス', signUpResponse);

		// ResendCommandは削除
		res.status(200).json({
			status: 'SUCCESSFULLY_REGISTERED_TO_COGNITO_AND_PENDING_CONFIRMATION',
			message: '認証コードを送信しました（最初のコード）'
		});
	} catch (error) {
		console.error("Error in signup:", error);
		console.log('DynamoDBへの登録は成功しましたがCognitoへの登録は失敗しましたので、DynamoDBの当該メールアドレスのアイテムを削除します。')

		try {
			const queryParams = {
				TableName: tableName,
				IndexName: gsiByEmail,
				KeyConditionExpression: 'email = :email',
				ExpressionAttributeValues: {
					':email': inputEmail
				},
				Limit: 1 // 重複を防ぐために1件だけ取得
			};

			console.log('DynamoDBのアイテム削除パラメタ', queryParams);

			const commandForQuery = new QueryCommand(queryParams);
			const queryResult = await ddbDocClient.send(commandForQuery);

			if (!queryResult.Items || queryResult.Items.length === 0) {
				return {
					statusCode: 404,
					body: JSON.stringify({ message: '対象のアイテムが見つかりませんでした' })
				};
			}

			// 2. 取得したアイテムのパーティションキーとソートキー（ある場合）で削除
			const itemToDelete = queryResult.Items[0];

			const deleteParams = {
				TableName: tableName,
				Key: {
					member_id: itemToDelete.member_id, // 実際のパーティションキー名に置き換えてください
					...(itemToDelete.membership_type && {
						membership_type: itemToDelete.membership_type // ソートキーがある場合
					})
				}
			};

			const commandForDeletion = new DeleteCommand(deleteParams);
			await ddbDocClient.send(commandForDeletion);

			return {
				statusCode: 200,
				body: JSON.stringify({ message: 'データベースへのユーザー登録に失敗しました。（エラー１）' })
			};
		} catch (err) {
			console.error('削除エラー', err);
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'データベースへのユーザー登録に失敗しました。（エラー２）' })
			};
		}

		return res.status(500).json({ error: 'データベースへのユーザー登録に失敗しました。（エラー３）' });
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
app.post(path + '/pay-for-one-year', async (req, res) => {
	console.log('success_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「OK,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(200).send('OK,');
});



/************************************
* HTTP post method for  *
*************************************/
app.post(path + '/start-3ds', async (req, res) => {
	console.log('success_url 受け取ったデータ:', req.body);

	// ここでデータの精査処理をしてもOK（今回は何もせず）

	// 結果にかかわらず「OK,」を返す
	res.set('Content-Type', 'text/plain');
	res.status(200).send('OK,');
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
	const {
		merchant_id,
		service_id,
		cust_code,
		free1,
		request_date
	} = req.body;
	const paymentPlan = req.body.free1;
	const item_id = free1 === 'yearly' ? '1' : '2' // yearlyは1、monthlyは2

	let queryFetchedItem;
	try {
		// 取得した結果はupdateParamsでも使う
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// GSIで対象アイテムを取得
		const queryParams = {
			TableName: tableName,
			IndexName: gsiByCustCode,
			KeyConditionExpression: 'cust_code = :cust_code',
			ExpressionAttributeValues: {
				':cust_code': cust_code
			}
		};

		const commandForQuery = new QueryCommand(queryParams);
		const queryResult = await ddbDocClient.send(commandForQuery);

		if (!queryResult.Items || queryResult.Items.length === 0) {
			return res.status(404).json({ error: '指定されたemailのアイテムが見つかりませんでした' });
		}

		// 最初の一致アイテムのみ処理（通常はユニークemailの前提）
		queryFetchedItem = queryResult.Items[0];
		console.log('queryFetchedItem', queryFetchedItem)
		const order_id = queryFetchedItem.member_id;
		const { member_id, membership_type } = queryFetchedItem;
		//////////////////////////////////////////////////////////////////////////////////////////////////////////

		// 日本時間を取得
		const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000); // UTC + 9時間
		// 表示確認（例：2025-04-14 22:30:00）
		const formatDate = (date) => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			const h = String(date.getHours()).padStart(2, '0');
			const min = String(date.getMinutes()).padStart(2, '0');
			const s = String(date.getSeconds()).padStart(2, '0');
			return `${y}-${m}-${d} ${h}:${min}:${s}`;
		};
		// 比較対象の日付（日本時間として扱う）
		const targetDate = new Date(Date.UTC(nowJST.getFullYear(), 4, 1)); // 月は0始まり（4 = 5月）
		// 比較結果を出力
		const amount = (nowJST < targetDate) ? '3960' : '4840';

		// 暗号化フラグ
		const encrypted_flg = '0'; // 暗号化しない

		// チェックサム
		const paymentElementsForHash = [merchant_id, service_id, cust_code, order_id, item_id, amount, free1, encrypted_flg, request_date];
		const sbps_hashcode = generateHash(paymentElementsForHash);

		// 年払い用の決済要求をキック
		if (paymentPlan === 'yearly') {
			// // トークンサービス接続先情報(ワンタイムトークン)接続先
			// const sbpsTokenServiceEndPoint = 'https://stbtoken.sps-system.com/sbpstoken/com_sbps_system_token.js';

			// // 接続先
			const sbpsApiEndPoint = 'https://stbfep.sps-system.com/api/xmlapi.do';
			// // ハッシュキー
			const sbpsHashKey = '628779fb3044932486354ca601169f2bbab32660';
			// // 3DES 暗号化キー
			// const threeDesKey = '628779fb3044932486354ca6';
			// // 3DES 初期化キー
			// const threeDesInitKey = '01169f2b';
			// 3DES Padding設定（※）
			// NoPadding
			// ※自動Paddingなしの為、最後の8バイトブロックに対し補完文字列が必要となります。Padding文字列：半角スペース

			// Basic認証ID
			const basicAuthId = '58913001';
			// Basic認証パスワード
			const basicAuthPwd = '628779fb3044932486354ca601169f2bbab32660';
			// POST時のAuthorizationヘッダーに使用
			const credentials = Buffer.from(`${basicAuthId}:${basicAuthPwd}`).toString('base64');

			// free1項目はBase64にエンコードが必要
			const encodedPaymentPlan = btoa(unescape(encodeURIComponent(paymentPlan)));

			// 送信用XMLデータ整形
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
			const response = await fetch(sbpsApiEndPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/xml; charset=Shift_JIS',
					'Authorization': `Basic ${credentials}`
				},
				body: encodedXml
			});

			const buffer = await response.arrayBuffer();
			const decodedBody = iconv.decode(Buffer.from(buffer), 'Shift_JIS');

			// レスポンスを XML → JSON に変換
			const resultJson = await parseStringPromise(decodedBody, { explicitArray: false });

			// 確定要求リクエスト
			const resSpsTransactionId = resultJson['sps-api-response'].res_sps_transaction_id;
			// const resTrackingId = resultJson['sps-api-response'].res_tracking_id;
			const confirmElementsForHash = [merchant_id, service_id, resSpsTransactionId, request_date];
			const res_sps_hashcode = generateHash(confirmElementsForHash);

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
			const confirmReqResut = await fetch(sbpsApiEndPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/xml; charset=Shift_JIS',
					'Authorization': `Basic ${credentials}`
				},
				body: encodedXmlForConfirm
			});

			const confirmReqBuffer = await confirmReqResut.arrayBuffer();
			const confirmReqDecodedBody = iconv.decode(Buffer.from(confirmReqBuffer), 'Shift_JIS');

			// レスポンスを XML → JSON に変換
			const confirmResultJson = await parseStringPromise(confirmReqDecodedBody, { explicitArray: false });
			console.log(confirmResultJson)

			// 購入要求・確定要求が成功したら、DynamoDBのアトリビュート変更（GSI使用）
			// can_loginをtrueに更新
			const updateParams = {
				TableName: tableName,
				Key: {
					member_id,
					membership_type
				},
				UpdateExpression: 'SET can_login = :trueVal',
				ExpressionAttributeValues: {
					':trueVal': true
				}
			};

			const commandForUpdate = new UpdateCommand(updateParams);
			await ddbDocClient.send(commandForUpdate);

			res.set('Content-Type', 'text/plain');
			res.status(200).send('OK,');
		} else if(paymentPlan === 'monthly') {

		}
	} catch (err) {
		console.error('更新エラー:', err);
		return res.status(500).json({ error: 'サーバーエラーが発生しました' });
	}


	/**
	 * チェックサム（ハッシュコード）生成
	 */
	function generateHash(inputs) {
		const hashKey = '628779fb3044932486354ca601169f2bbab32660';
		// 各要素の前後のスペースを取り除いて結合
		const concatenatedValues = inputs.map(input => input.trim()).join('');
		const stringToHash = concatenatedValues + hashKey;
		const hash = CryptoJS.SHA1(stringToHash).toString().toUpperCase();

		return hash;
	};
});

app.listen(3000, function () {
	console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app