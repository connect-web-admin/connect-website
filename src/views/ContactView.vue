<script setup>
import { ref } from "vue"
import { INQUIRY_API_URL, ID_TOKEN_FOR_AUTH } from "@/utils/constants"


const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

// フォームデータの初期値
const inquiryData = ref({
    category: '',
    message: '',
    name: '',
    furigana: '',
    email: '',
    phoneNum: ''
})

const isConfirmView = ref(false)

const sendInquiry = async () => {
    // バリデーション
    if (!inquiryData.value.category || !inquiryData.value.message || !inquiryData.value.name ||
        !inquiryData.value.furigana) {
        alert("必須項目をすべて入力してください。")
        return
    }

    if (inquiryData.value.category !== '試合結果について' && inquiryData.value.category !== 'チーム紹介について' &&
            inquiryData.value.category !== '写真・動画について' && inquiryData.value.category !== 'お知らせについて' &&
            inquiryData.value.category !== 'プレミアム会員について' && inquiryData.value.category !== 'その他') {
        alert("お問い合わせを選択肢よりお選びください。")
        return
    }

    if (inquiryData.value.message.length > 1000) {
        alert("お問い合わせ内容は1000字以下でご記入ください。")
        return
    }

    if (inquiryData.value.name.length > 30) {
        alert("お名前は30字以下でご記入ください。")
        return
    }

    if (inquiryData.value.furigana.length > 30) {
        alert("お名前（ふりがな）は30字以下でご記入ください。")
        return
    }

    if (inquiryData.value.phoneNum.length > 20) {
        alert("電話番は20桁以下でご記入ください。")
        return
    }

    // API URLの組み立て
    const url = new URL(`${ INQUIRY_API_URL }`)

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${ idTokenForAuth }`
            },
            body: JSON.stringify(inquiryData.value),
        })

        if (response.ok) {
            alert("お問い合わせを正常に送信しました。")
            // フォームをリセット
            inquiryData.value = {
                category: '',
                message: '',
                name: '',
                furigana: '',
                email: '',
                phoneNum: '',
            }

            isConfirmView.value = false
        } else {
            alert("送信に失敗しました。必須項目が入力されていても失敗する場合は、時間をおいて再度お試しください。")
        }
    } catch (error) {
        console.error("送信エラー", error)
        alert("送信に失敗しました。時間をおいて再度お試しください。")
    }
}

const toggleConfirmView = () => {
    isConfirmView.value = !isConfirmView.value
}

</script>

<template>
<div class="contents-wrapper">
    <h1>お問い合わせ</h1>
    <div class="forms-wrapper">
        <form @submit.prevent="sendInquiry">
            <div v-if="!isConfirmView">
                <div class="each-block-container contact-category">
                    <p>お問い合わせ種別<span class="hissu">必須</span></p>
                    <select v-model="inquiryData.category" required>
                        <option disabled selected value=''>選択してください</option>
                        <option value="試合結果について">試合結果について</option>
                        <option value="チーム紹介について">チーム紹介について</option>
                        <option value="写真・動画について">写真・動画について</option>
                        <option value="お知らせについて">お知らせについて</option>
                        <option value="プレミアム会員について">プレミアム会員について</option>
                        <option value="その他">その他</option>
                    </select>
                </div>
                <div class="each-block-container">
                    <p>お問い合わせ内容<span class="hissu">必須</span>（1000字以内。現在{{ inquiryData.message.length }}字）</p>
                    <textarea v-model="inquiryData.message" required></textarea>
                </div>
                <div class="each-block-container">
                    <p>お名前<span class="hissu">必須</span></p>
                    <input type="text" v-model="inquiryData.name" placeholder="（例）山田太郎" required/>
                </div>
                <div class="each-block-container">
                    <p>お名前（ふりがな）<span class="hissu">必須</span></p>
                    <input type="text" v-model="inquiryData.furigana" placeholder="（例）やまだたろう" required/>
                </div>
                <div class="each-block-container">
                    <p>メールアドレス<span class="hissu">必須</span></p>
                    <input type="email" v-model="inquiryData.email" placeholder="（例）yamada@toiawase.com" required/>
                </div>
                <div class="each-block-container">
                    <p>電話番号(ハイフンなし)</p>
                    <input type="tel" v-model="inquiryData.phoneNum" placeholder="（例）090123456" required/>
                </div>
                <button type="submit" @click="toggleConfirmView">確認画面</button>
            </div>
            <div v-else>
                <p>記入内容は下記のとおりです。</p>
                <div class="sending-contents">
                    <div class="each-sending-content">
                        お問い合わせ種別：<br>
                        {{ inquiryData.category }}<br>
                    </div>
                    <div class="each-sending-content">
                        お問い合わせ内容：<br>
                        {{ inquiryData.message }}
                    </div>
                    <div class="each-sending-content">
                        お名前：<br>
                        {{ inquiryData.name }}
                    </div>
                    <div class="each-sending-content">
                        お名前（ふりがな）：<br>
                        {{ inquiryData.furigana }}
                    </div>
                    <div class="each-sending-content">
                        メールアドレス：<br>
                        {{ inquiryData.email }}
                        <input type="hidden" v-model="inquiryData.email" required/>
                    </div>
                    <div class="each-sending-content">
                        電話番号：<br>
                        <span v-if="inquiryData.phoneNum">{{ inquiryData.phoneNum }}</span>
                        <span v-else>未記入</span>
                    </div>
                </div>
                <div class="btn-to-edit">
                    <button type="submit" @click="toggleConfirmView">修正画面</button>
                </div>
                <div>
                    <p class="notice-before-sending">
                        利用規約・プライバシーポリシーに同意のうえ送信してください。3営業日以内に返信いたします。
                    </p>
                    <button type="submit">送信</button>
                </div>
            </div>
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

    .btn-to-edit {
        margin-bottom: 2em;
    }

    .sending-contents {
        text-align: left;
    }

    .each-sending-content {
        margin-top: 1em;
    }

    .notice-before-sending {
        text-align: left;
    }
}
</style>