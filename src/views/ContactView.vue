<script setup>
import { ref } from "vue"
import { INQUIRY_API_URL } from "@/utils/constants"

// フォームデータの初期値
const inquiryData = ref({
    category: '',
    message: '',
    name: '',
    furigana: '',
    email: '',
    phoneNum: ''
})

const sendInquiry = async () => {
    // バリデーション
    if (!inquiryData.value.category || !inquiryData.value.message || !inquiryData.value.name ||
        !inquiryData.value.furigana || !inquiryData.value.email) {
        alert("必須項目をすべて入力してください。")
        return
    }


    // API URLの組み立て
    const url = new URL(`${ INQUIRY_API_URL }`)

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inquiryData.value),
        })

        if (response.ok) {
            alert("お問い合わせを送信しました。")
            // フォームをリセット
            inquiryData.value = {
                category: '',
                message: '',
                name: '',
                furigana: '',
                email: '',
                phoneNum: '',
            }
        } else {
            alert("送信に失敗しました。時間をおいて再度お試しください。")
        }
    } catch (error) {
        console.error("送信エラー")
        alert("通信エラーが発生しました。")
    }
}

</script>

<template>
<div class="contents-wrapper">
    <h1>お問い合わせ</h1>
    <p>こちらのお問い合わせフォームよりご連絡ください。</p>
    <div class="forms-wrapper">
        <form @submit.prevent="sendInquiry">
            <div class="each-block-container contact-category">
                <p>お問い合わせ種別<span class="hissu">必須</span></p>
                <select v-model="inquiryData.category" required>
                    <option disabled selected value=''>選択してください</option>
                    <option value="製品について">製品について</option>
                    <option value="サービスについて">サービスについて</option>
                    <option value="サポートについて">サポートについて</option>
                    <option value="その他">その他</option>
                </select>
            </div>
            <div class="each-block-container">
                <p>お問い合わせ内容<span class="hissu">必須</span></p>
                <textarea v-model="inquiryData.message"></textarea>
            </div>
            <div class="each-block-container">
                <p>お名前<span class="hissu">必須</span></p>
                <input type="text" v-model="inquiryData.name" placeholder="（例）山田太郎" />
            </div>
            <div class="each-block-container">
                <p>お名前（ふりがな）<span class="hissu">必須</span></p>
                <input type="text" v-model="inquiryData.furigana" placeholder="（例）やまだたろう" />
            </div>
            <div class="each-block-container">
                <p>メールアドレス<span class="hissu">必須</span></p>
                <input type="email" v-model="inquiryData.email" placeholder="（例）yamada@connect" />
            </div>
            <div class="each-block-container">
                <p>電話番号(ハイフンなし)</p>
                <input type="text" v-model="inquiryData.phoneNum" placeholder="（例）090123456" />
            </div>
            <p class="notice-before-sending">
                利用規約・プライバシーポリシーに同意のうえ送信してください。3営業日以内に返信いたします。
            </p>
            <button type="submit">送信</button>
        </form>
    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .contents-wrapper {
        width: 100%;
        text-align: center;
    }

    .forms-wrapper {
        min-width: 350px;
        width: 90%;
        margin: 2em auto;
    }

    .forms-wrapper button {
        width: 100%;
        margin-top: 1em;
        padding: 0.2em 0;
    }

    .contact-category {
        display: flex;
        flex-direction: row;
    }

    .contact-category select {
        margin-left: 1em;
    }

    .each-block-container {
        margin-bottom: 1em;
        text-align: left;
    }

    .each-block-container>p {
        margin-bottom: 0.5em;
    }

    .each-block-container>input,
    .each-block-container textarea {
        width: 100%;
    }

    .hissu {
        font-size: 8px;
        color: #ff0000;
        vertical-align: top;
        margin-left: 4px;
    }

    .notice-before-sending {
        text-align: left;
    }
}
</style>