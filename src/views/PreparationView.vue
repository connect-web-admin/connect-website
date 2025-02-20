<script setup>
import { ref } from 'vue';

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

/** パスワードの表示 */
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

/** モーダルの開閉 */
// モーダルの表示状態を管理
const isTermsModalOpen = ref(false)
const isPrivacyModalOpen = ref(false)

// モーダルの開閉を制御する関数
const openTermsModal = () => {
    isTermsModalOpen.value = true
}

const closeTermsModal = () => {
    isTermsModalOpen.value = false
}

const openPrivacyModal = () => {
    isPrivacyModalOpen.value = true
}

const closePrivacyModal = () => {
    isPrivacyModalOpen.value = false
}

/** 新規登録 */
const registerNewAccount = async () => {
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        alert("reCAPTCHAを完了してください");
        return;
    }

    const url = new URL(`${MATCH_API_URL}/register_scores`)

    // HTTPリクエスト送信時のボディに共通する部分 match_idで対象試合を特定
    const requestBody = {
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        recaptchaToken: recaptchaResponse,
    }

    try {


        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            },
            body: JSON.stringify(requestBody)
        })

        if (response.ok) {
            // 
            alert('OK')
        } else {
            alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
        }
    } catch (error) {
        alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
        console.error('得点の登録に失敗しました。')
    } finally {
        isProceeding.value = false
    }
}

// CSSクラス
const commercialMessage = "w-full mx-auto mt-5";
const eachInputContainer = "w-full flex flex-col gap-1 mb-2";
const eachInput = "px-2 border-1 border-gray-400 rounded-sm";
</script>

<template>
    <div class="w-full h-full px-4 py-10 bg-sky-50">
        <div class="w-full h-full bg-white rounded-lg p-4">
            <div>
                <img class="mx-auto" src="../assets/connect_title_logo.png" alt="札幌市アマチュアサッカー総合情報サイトconnect">
                <p :class="commercialMessage">
                    ★ ココだけの取材記録、各種大会の試合速報、札幌市内クラブチーム紹介、写真や動画などのコンテンツが満載！<br>
                    ★ オープンにあたり、4月と5月の会費無料！<br>
                    （6月より、決済登録のある会員様限定のサービスに移行いたします。決済登録のご案内を5月1日以降に行います。）
                </p>
            </div>

            <div class="w-full mt-5">
                <div>
                    <h2 class="text-xl text-center mt-5 mb-5 py-1 font-bold border-b-1 bg-cyan-50">事前新規会員登録</h2>
                </div>
                <div class="mt-5">
                    <form @submit.prevent="registerNewAccount">
                        <!-- 会員登録情報入力フォーム-->
                        <div :class="eachInputContainer">
                            <label for="email">メールアドレス</label>
                            <input :class="eachInput" type="email" id="email" name="email">
                        </div>
                        <div :class="eachInputContainer">
                            <div class="flex items-center">
                                <label for="password">パスワード（半角英数字8文字以上）</label>
                                <input type="checkbox" id="show-password" v-model="showPassword" class="mr-1 ml-4">
                                <label for="show-password" class="text-sm text-gray-600">表示</label>
                            </div>
                            <input :class="eachInput" type="password" id="password" name="password">
                        </div>
                        <div :class="eachInputContainer">
                            <div class="flex items-center">
                                <label for="password-confirm">パスワード（確認）</label>
                                <input type="checkbox" id="show-password-confirm" v-model="showPasswordConfirm"
                                    class="mr-1 ml-4">
                                <label for="show-password-confirm" class="text-sm text-gray-600">表示</label>
                            </div>
                            <input :class="eachInput" type="password" id="password-confirm" name="password-confirm">
                        </div>
                        <div>
                            <div>
                                <a href="#" @click.prevent="openTermsModal"
                                    class="text-red-500 font-medium underline">利用規約</a>
                                及び
                                <a href="#" @click.prevent="openPrivacyModal"
                                    class="text-red-500 font-medium underline">プライバシーポリシー</a>
                                に同意の上、新規会員登録をお願いいたします。
                            </div>

                            <!-- reCAPTCHA
                            <div class="g-recaptcha" data-sitekey="6LdrudUqAAAAADqwDxiK9s9VtppvPUuVwaUr6ko0"></div> -->


                            <button class="w-full mt-5 mb-5 py-2 bg-blue-500 text-white rounded-md">
                                新規登録
                            </button>
                            <ul class="text-gray-400 list-inside">
                                <li>
                                    ※ ご登録いただいたメールアドレス宛に、connect-goals.comより確認メールをお送りいたしますので、あらかじめ受信許可設定をしてください。
                                    1時間経過してもメールが届かない場合は、迷惑メールフォルダをご確認ください。それでも見当たらない場合は
                                    <a href="mailto:info@connect-goals.com"
                                        class="text-blue-500 font-medium underline">info@connect-goals.com</a>
                                    までお問い合わせください。
                                </li>
                                <li>
                                    ※ ご登録いただいたメールアドレス宛に、4月1日の正式オープンのお知らせをお送りする予定です。
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 利用規約モーダル -->
        <div v-if="isTermsModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full mx-4">
                <h2 class="text-xl font-bold mb-4">利用規約</h2>
                <div class="max-h-96 overflow-y-auto">
                    <p>利用規約の内容をここに記載します。</p>
                </div>
                <button @click="closeTermsModal" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    閉じる
                </button>
            </div>
        </div>

        <!-- プライバシーポリシーモーダル -->
        <div v-if="isPrivacyModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full mx-4">
                <h2 class="text-xl font-bold mb-4">プライバシーポリシー</h2>
                <div class="max-h-96 overflow-y-auto">
                    <p>プライバシーポリシーの内容をここに記載します。</p>
                </div>
                <button @click="closePrivacyModal" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    閉じる
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>