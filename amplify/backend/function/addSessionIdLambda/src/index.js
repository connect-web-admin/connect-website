const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
	DynamoDBDocumentClient,
	UpdateCommand, QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.REGION;
const TABLE_NAME = process.env.TABLE_NAME;
const GSI_BY_EMAIL = process.env.GSI_BY_EMAIL;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
	console.log('認証後トリガー event:', JSON.stringify(event, null, 2));

	// 1. メールアドレス取得
	const email = event.request.userAttributes.email;
	if (!email) {
		throw new Error('ユーザーのメールアドレスが取得できませんでした');
	}

	// 2. GSI で DynamoDB から member_id と membership_type を取得
	const queryResult = await ddbDocClient.send(
		new QueryCommand({
			TableName: TABLE_NAME,
			IndexName: GSI_BY_EMAIL,
			KeyConditionExpression: 'email = :email',
			ExpressionAttributeValues: { ':email': email }
		})
	);

	if (!queryResult.Items || queryResult.Items.length === 0) {
		console.warn('DynamoDB に該当ユーザーが見つかりません:', email);
		return event;
	}

	const { member_id, membership_type } = queryResult.Items[0];

	// 3. Tokyo時間でのセッションID生成
	const now = new Date();
	const tokyo = new Date(
		now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
	);
	const z2 = v => String(v).padStart(2, '0');
	const datetime = [
		tokyo.getFullYear(),
		z2(tokyo.getMonth() + 1),
		z2(tokyo.getDate()),
		z2(tokyo.getHours()),
		z2(tokyo.getMinutes()),
		z2(tokyo.getSeconds())
	].join('');
	const rand4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
	const newSessionId = datetime + rand4;
	console.log('生成した session_id:', newSessionId);

	// 4. session_id リストに追加
	await ddbDocClient.send(
		new UpdateCommand({
			TableName: TABLE_NAME,
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
		})
	);
	console.log('DynamoDB を更新しました:', { member_id, membership_type, newSessionId });

	// 5. 終了時は必ず event を返す
	return event;
};