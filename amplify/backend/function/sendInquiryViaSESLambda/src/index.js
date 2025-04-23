const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses")
const senderEmail = "info@connect-goals.com" // SESで確認済みの送信元メールアドレス
const sesClient = new SESClient({ region: 'ap-northeast-1' })

exports.handler = async (event) => {
    try {
        console.log('メール送信開始');
        const body = JSON.parse(event.body);

        // バリデーション
        const requiredFields = ["category", "message", "name", "furigana", "email"]
        for (const field of requiredFields) {
            if (!body[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `必須の項目が送信されていません。: ${field}` }),
                }
            }
        }

        const { category, message, name, furigana, email, phoneNum } = body;

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
        
        console.log('メール送信パラメータ', JSON.stringify(params));
        
        const command = new SendEmailCommand(params);
        const sendResult = await sesClient.send(command);

        console.log('sendResult', sendResult);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: "お問い合わせを正常に送信しました。" }),
        }
    } catch (error) {
        console.error("SES送信エラー:", error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "メール送信に失敗しました。" }),
        }
    }
}