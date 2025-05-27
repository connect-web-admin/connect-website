const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const iconv = require("iconv-lite");
const { parseStringPromise } = require("xml2js");
const CryptoJS = require("crypto-js");

// DynamoDB クライアント初期化
const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const tableName = process.env.TABLE_NAME;

// 今日の日付（月初の処理なので、実質当月の1日）
const { today, dateTimeCompact } = getJSTDateTime();
// todayが属する月の末尾
const expirationDay = getJSTLastDayOfMonth();

// 決済システム接続先／認証情報
const sbpsApiEndPoint = process.env.SBPS_API_END_POINT;
const basicAuthId = process.env.BASIC_AUTH_ID;
const basicAuthPwd = process.env.BASIC_AUTH_PWD;
const credentials = Buffer.from(`${basicAuthId}:${basicAuthPwd}`).toString('base64'); // POST時のAuthorizationヘッダーに使用

// 共通の決済要求送信用パラメータ
const merchant_id = process.env.MERCHANT_ID;
const service_id = process.env.SERVICE_ID;
const request_date = dateTimeCompact;
const paymentPlan = process.env.FREE_1;
const amount = '10'; // レギュラー会員月払い額
const encodedPaymentPlan = btoa(decodeURIComponent(paymentPlan)); // free1項目はBase64にエンコードが必要
const item_id = paymentPlan
const encrypted_flg = '0'; // 暗号化フラグ。暗号化しない

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {

	try {
        // ① can_login = true の有料会員を一括取得
        const scanParams = {
            TableName: tableName,
			FilterExpression: "can_login = :trueVal AND email = :email",
			ExpressionAttributeValues: {
				":trueVal": true,
				":email": 'pkpkggl@gmail.com'
			}
        };
        const scanResult = await ddbDocClient.send(new ScanCommand(scanParams));
        const members = scanResult.Items || [];

        // ② 取得した会員ごとに決済ループ
        for (const member of members) {
            const member_id = member.member_id;
            const membership_type = member.membership_type;
            const cust_code = member.cust_code; // 顧客ID
            const order_id = member_id; // order_id として member_id を流用

            // チェックサム作成
            const paymentElementsForHash = [
                merchant_id,
                service_id,
                cust_code,
                order_id,
                item_id,
                amount,
                paymentPlan, // ハッシュ値作成時にはエンコード前
                encrypted_flg,
                request_date
            ];
            const sbps_hashcode = generateHash(paymentElementsForHash);

            try {
                //////////////////
				// 決済要求を送信 //
				//////////////////
				const paymentResult = await paymentRequest(merchant_id, service_id, cust_code, order_id, item_id, amount, encodedPaymentPlan, encrypted_flg, request_date, sbps_hashcode);
				if (paymentResult['sps-api-response'].res_result !== 'OK') {
					return res.status(404).json({ error: '決済に失敗しました。' });
				};

				//////////////////
				// 確定要求を送信 //
				//////////////////
				const resSpsTransactionId = paymentResult['sps-api-response'].res_sps_transaction_id;
				const confirmElementsForHash = [merchant_id, service_id, resSpsTransactionId, request_date];
				const res_sps_hashcode = generateHash(confirmElementsForHash);
				await confirmPayment(merchant_id, service_id, resSpsTransactionId, request_date, res_sps_hashcode)

                // 成功時 DynamoDB 更新
                await updateMemberInfoBySuccess(member_id, membership_type, today, expirationDay);
            } catch (err) {
                console.error(`Member ${member_id} payment error:`, err);
                // 失敗時 DynamoDB 更新
                await updateMemberInfoByFailure(member_id, membership_type, today, expirationDay);
            }
        }

    } catch (error) {
        console.error('全体処理でエラー発生:', error);
        // 必要に応じて管理者通知などを追加
    }
};

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
 * メンバー情報を更新（決済成功時）
 */
async function updateMemberInfoBySuccess(member_id, membership_type, today, newExpirationDay) {
	try {
		const updateParams = {
			TableName: tableName,
			Key: {
				member_id,
				membership_type
			},
			UpdateExpression: `SET , 
								expires_at = :expirationDay,
								payment_success_history = list_append(
									if_not_exists(payment_success_history, :empty_list),
									:historyEntry
								)`,
			ExpressionAttributeValues: {
				':expirationDay': newExpirationDay,
				':empty_list': [],
				':historyEntry': [ today ] 
			}
		};

		const commandForUpdate = new UpdateCommand(updateParams);
		const updateResult = await ddbDocClient.send(commandForUpdate);
		console.log('DynamoDB更新結果', updateResult);
		return updateResult;
	} catch (err) {
		console.error('更新エラー:', err);
		return res.status(500).json({ error: 'サーバーエラーが発生しました' });
	}
}

/**
 * メンバー情報を更新（決済失敗時）
 */
async function updateMemberInfoByFailure(member_id, membership_type, today, expirationDay) {
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
								payment_failure_history = list_append(
									if_not_exists(payment_success_history, :empty_list),
									:historyEntry
								)`,
			ExpressionAttributeValues: {
				':trueVal': false,
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
* 日本時間の日時情報をオブジェクトで返す関数
* ・dateTime         : "YYYY-MM-DDThh:mm:ss"
* ・date             : "YYYY-MM-DD"
* ・dateTimeCompact  : "YYYYMMDDhhmmss"
*/
function getJSTDateTime() {
	// 1) 現在の UTC ミリ秒に +9h して JST のタイムスタンプを作成
	const jstMs    = Date.now() + 9 * 60 * 60 * 1000;
	const jstDate  = new Date(jstMs);

	// 2) 各パーツを UTC 扱いで取得（+9h 済みなので UTC 表示＝JST 表示）
	const YYYY = jstDate.getUTCFullYear();
	const MM   = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
	const DD   = String(jstDate.getUTCDate()).padStart(2, '0');
	const hh   = String(jstDate.getUTCHours()).padStart(2, '0');
	const mm_  = String(jstDate.getUTCMinutes()).padStart(2, '0');
	const ss   = String(jstDate.getUTCSeconds()).padStart(2, '0');

	// 3) それぞれのフォーマットを組み立て
	const dateOnly        = `${YYYY}-${MM}-${DD}`;           // "YYYY-MM-DD"
	const dateTimeFull    = `${dateOnly}T${hh}:${mm_}:${ss}`;// "YYYY-MM-DDThh:mm:ss"
	const dateTimeCompact = `${YYYY}${MM}${DD}${hh}${mm_}${ss}`; // "YYYYMMDDhhmmss"

	return {
	today:            dateOnly,
	dateTimeCompact:  dateTimeCompact
	};
}

/**
 * 今日の日本時間を基に、当月の末日を "YYYY-MM-DD" 形式で返す
 */
function getJSTLastDayOfMonth() {
	// 1) 現在の UTC ミリ秒に +9h して JST のタイムスタンプを作成
	const jstMs = Date.now() + 9 * 60 * 60 * 1000;
	const jstDate = new Date(jstMs);

	// 2) JST の年・月を UTC 扱いで取得
	const year  = jstDate.getUTCFullYear();
	const month = jstDate.getUTCMonth(); // 0 (1月) ～ 11 (12月)

	// 3) 翌月の 0 日目を指定すると、当月の末日になる（Date.UTC は UTC ベース）
	const lastDayUtcMs   = Date.UTC(year, month + 1, 0);
	const lastDayJstDate = new Date(lastDayUtcMs);

	// 4) ゼロ埋めして文字列を組み立て
	const YYYY = lastDayJstDate.getUTCFullYear();
	const MM   = String(lastDayJstDate.getUTCMonth() + 1).padStart(2, '0');
	const DD   = String(lastDayJstDate.getUTCDate()).padStart(2, '0');

	return `${YYYY}-${MM}-${DD}`;
}