import { SendEmailCommand } from "@aws-sdk/client-ses"
import { sesClient } from "./libs/sesClient.js"

const senderEmail = "espina.soccer@gmail.com" // SESで確認済みの送信元メールアドレス

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body)

        // バリデーション
        const requiredFields = ["category", "message", "name", "furigana", "email"]
        for (const field of requiredFields) {
            if (!body[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Missing required field: ${field}` }),
                }
            }
        }

        const { category, message, name, furigana, email, phoneNum } = body

        const params = {
            Source: senderEmail,
            Destination: {
                ToAddresses: [senderEmail], // 自分宛にメールを送信
            },
            Message: {
                Subject: { Data: `お問い合わせ: ${category}` },
                Body: {
                    Text: {
                        Data: `
                            お問い合わせ種別: ${category}
                            お名前: ${name}
                            ふりがな: ${furigana}
                            メールアドレス: ${email}
                            電話番号: ${phoneNum || "未記入"}
                            お問い合わせ内容:
                            ${message}
                        `,
                    },
                },
            },
        }

        const command = new SendEmailCommand(params)
        await sesClient.send(command)

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "お問い合わせを送信しました。" }),
        }
    } catch (error) {
        console.error("SES送信エラー:", error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "メール送信に失敗しました。" }),
        }
    }
}

// /**
//  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
//  */
// exports.handler = async (event) => {
//     console.log(`EVENT: ${JSON.stringify(event)}`);
//     return {
//         statusCode: 200,
//     //  Uncomment below to enable CORS requests
//     //  headers: {
//     //      "Access-Control-Allow-Origin": "*",
//     //      "Access-Control-Allow-Headers": "*"
//     //  },
//         body: JSON.stringify('Hello from Lambda!'),
//     };
// };
