const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

// DynamoDB クライアント初期化
const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME;

// SQSクライアント初期化
const sqsClient = new SQSClient({ region: process.env.REGION });
const queueUrl = process.env.SQS_QUEUE_URL;

// 今日の日付（月初の処理なので、実質当月の1日）
const { today, dateTimeCompact } = getJSTDateTime();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
	let successCount = 0;
    let failureCount = 0;
    const failedMembers = [];

	try {
        // 月払い決済のアクティブな会員の未取得
        const scanParams = {
            TableName: tableName,
			FilterExpression: "can_login = :trueVal AND is_free_account = :falseVal AND deleted_at = :emptyVal AND payment_plan = :paymentPlan",
			ExpressionAttributeValues: {
				":trueVal": true,
				":falseVal": false,
				":emptyVal": "",
				":paymentPlan": 'monthly'
			}
        };
        const scanResult = await ddbDocClient.send(new ScanCommand(scanParams));
        const members = scanResult.Items || [];

		// ② 各会員をSQSに投入
		for (const member of members) {
			const message = {
				member_id: member.member_id,
				membership_type: member.membership_type,
				cust_code: member.cust_code,
				order_id: member.member_id + today, // order_id として member_id を流用。年月日を付与してユニーク化
				payment_plan: member.payment_plan,
				memberEmail: member.email,
				memberFullName: `${member.last_name} ${member.first_name}`
			};

			await sqsClient.send(
				new SendMessageCommand({
					QueueUrl: queueUrl,
					MessageBody: JSON.stringify(message),
					MessageGroupId: member.member_id + 'MGID' + today,
					MessageDeduplicationId : member.member_id + 'MDID' + today
				})
			);

			successCount++;
			console.log(`キューを追加しました。： ${member.member_id}, ${member.membership_type}, ${member.payment_plan}`);
		}

		// 全件投入後に集計ログを出力
		console.log(`SQS投入成功件数: ${successCount}件, 失敗件数: ${failureCount}件`);
		if (failedMembers.length > 0) {
			console.log(`投入に失敗したmember_idリスト: ${failedMembers.join(', ')}`);
		} else {
			console.log('全件成功');
		}
    } catch (error) {
		failureCount++;
		console.error(`キュー追加失敗：`, error);
    }
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