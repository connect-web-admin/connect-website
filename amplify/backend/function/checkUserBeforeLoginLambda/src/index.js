const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// メインハンドラー
exports.handler = async (event) => {
    console.log("認証前トリガー event:", JSON.stringify(event, null, 2));

    // ログイン情報（メールアドレス）を取得
    const inputEmail = event.request.userAttributes.email;
    console.log('ログイン試行メールアドレス', inputEmail);

    // メールアドレスが空の場合はエラーを投げる
    if (!inputEmail) {
        throw new Error("メールアドレスが空です");
    }

    // メールアドレスをキーにしてユーザー情報を取得
    // can_loginがfalseの場合はログインを拒否
    try {
        const queryParams = {
            TableName: 'MemberDDB-dev',
            IndexName: 'gsiByEmail',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': inputEmail
            }
        };

        console.log('登録試行パラメータ', queryParams);

        const command = new QueryCommand(queryParams);
        const result = await ddbDocClient.send(command);

        console.log("DynamoDBから取得したデータ:", result);

        const countSessionId = Array.isArray(result.Items[0].session_id) ? result.Items[0].session_id.length : 0;
        console.log('countSessionIdの数', countSessionId);

        // can_loginがfalseの場合はログインを拒否
        if (!result.Items || result.Items[0].can_login === false) {
            throw new Error("ログインできません");
        }

        // countSessionIdがすでに2以上の場合はログインを拒否
        if (countSessionId >= 2) {
            throw new Error("ログインできません");
        }

        console.log(inputEmail, 'ログインOK')
        // 問題なければログインを許可
        return event;
    } catch (err) {
        console.error("ログイン前チェックでエラー:", err);

        // エラーを投げると Cognito はログインをブロックする
        throw new Error("ログインできない場合は、同時ログイン可能デバイス数の上限を超えるログインか、認証コードで登録者本人確認がお済みでないか、クレジットカード決済情報が登録されていないなどの可能性があります.ご不明な点は、下部のコンタクトからお問い合わせください");
    }
};