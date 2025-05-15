const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');

/**
 * @type {import('http').Server}
 */
const server = awsServerlessExpress.createServer(app);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' }); // リージョンを指定
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient); 

let tableName = 'MemberDDB'; // テーブル名を指定
if (process.env.ENV && process.env.ENV !== "NONE") {
    tableName = tableName + '-' + process.env.ENV;
}

exports.handler = async (event, context) => {
  try {
    // 1. すべてのアイテムを取得
    const scanParams = {
      TableName: tableName,
      ProjectionExpression: 'member_id, membership_type' // 必要な属性のみ取得
    };

    const scanCommand = new ScanCommand(scanParams)
    const scanResult = await ddbDocClient.send(scanCommand);
    const items = scanResult.Items;

    // 2. 更新リクエストを作成
    for (const item of items) {
      const params = {
        TableName: tableName,
        Key: {
          member_id: item.member_id,
          membership_type: item.membership_type,
        },
        // 先頭インデックス（古い順）を一件だけ削除
        UpdateExpression: 'REMOVE session_id[0]',
        // session_id が存在し、要素数が1以上ある場合のみ実行
        ConditionExpression: 'attribute_exists(session_id) AND size(session_id) >= :min',
        ExpressionAttributeValues: {
          ':min': 1
        },
      };
    
      try {
        await ddbDocClient.send(new UpdateCommand(params));
        console.log(`${item.member_id}/${item.membership_type} の最も古い session_id を削除しました`);
      } catch (err) {
        if (err.name === 'ConditionalCheckFailedException') {
          // session_id がなかった or 空だったのでスキップ
          console.log(`${item.member_id}/${item.membership_type} には session_id がありません`);
        } else {
          throw err;
        }
      }
    }

    console.log('All session_ids updated successfully.');
  } catch (error) {
    console.error('Error updating session_ids:', error);
    throw error;
  }
};