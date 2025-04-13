<!-- <script setup>
import { ref, onMounted } from 'vue';
import CryptoJS from 'crypto-js';

// フォームへの参照
const paymentForm = ref(null);

/**
 * 購入要求の日時を生成
 * @returns {number} 購入要求の日時
 */
const generateRequestDate = () => {
    const now = new Date();

    // 日本時間に調整
    const jpTime = new Date(now.getTime() + (now.getTimezoneOffset() + 9 * 60) * 60000);

    // YYYYMMDDHHmmss 形式にフォーマット
    const expetedDateAndTime = jpTime.getFullYear() +
        ('0' + (jpTime.getMonth() + 1)).slice(-2) +
        ('0' + jpTime.getDate()).slice(-2) +
        ('0' + jpTime.getHours()).slice(-2) +
        ('0' + jpTime.getMinutes()).slice(-2) +
        ('0' + jpTime.getSeconds()).slice(-2);

    return Number(expetedDateAndTime)
}

/**
 * 顧客IDを生成
 * @returns {string} 顧客ID
 */
const generateCustCode = () => {
    const now = new Date();
    const random = Math.random().toString(36).substring(2, 15);
    return `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${random}`;
}

const formData = ref({
    pay_method: 'credit3d2',
    merchant_id: '58913',
    service_id: '001',
    cust_code: '',
    success_url: 'https://connect-goals.com/', // クレカ情報を入力して、支払いが完了しましたまで到達した場合の遷移先
    cancel_url: 'https://connect-goals.com/media', // クレカ情報を入力して、支払いがキャンセルされた場合の遷移先
    error_url: 'https://connect-goals.com/pickup-news', // クレカ情報を入力して、支払いに失敗した場合の遷移先
    pagecon_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url', // memberLambdaで決済システムからの処理受け取り
    request_date: '',
    sps_hashcode: ''
})

/**
 * ハッシュコードを生成
 * @returns {string} ハッシュコード
 */
const generateHash = () => {
    // ハッシュキー
    const hashKey = '628779fb3044932486354ca601169f2bbab32660';
    // const hashKey = '398a58952baf329cac5efbae97ea84ba17028d02';
    
    // 指定された順序で値を連結
    const concatenatedValues = [
        formData.value.pay_method,
        formData.value.merchant_id,
        formData.value.service_id,
        formData.value.cust_code,
        formData.value.success_url,
        formData.value.cancel_url,
        formData.value.error_url,
        formData.value.pagecon_url,
        formData.value.request_date
    ].map(value => String(value).trim()).join('');

    // ハッシュキーを結合
    const stringToHash = concatenatedValues + hashKey;

    // UTF-8でエンコードしてSHA1ハッシュを生成
    const hash = CryptoJS.SHA1(stringToHash).toString().toUpperCase();

    return hash
}

onMounted(() => {
    // 日時とハッシュを生成
    formData.value.cust_code = generateCustCode();
    formData.value.request_date = generateRequestDate();
    formData.value.sps_hashcode = generateHash();

    // フォームを自動送信
    setTimeout(() => {
        if (paymentForm.value) {
            paymentForm.value.submit();
        }
    }, 150);
});
</script>

<template>
    <form method="POST" action="https://stbfep.sps-system.com/f04/FepPayInfoReceive.do" accept-charset="Shift_JIS"
        ref="paymentForm">
        <input type="hidden" name="pay_method" :value="formData.pay_method">
        <input type="hidden" name="merchant_id" :value="formData.merchant_id">
        <input type="hidden" name="service_id" :value="formData.service_id">
        <input type="hidden" name="cust_code" :value="formData.cust_code">
        <input type="hidden" name="sps_cust_no" value="">
        <input type="hidden" name="sps_payment_no" value="">
        <input type="hidden" name="terminal_type" value="">
        <input type="hidden" name="success_url" :value="formData.success_url">
        <input type="hidden" name="cancel_url" :value="formData.cancel_url">
        <input type="hidden" name="error_url" :value="formData.error_url">
        <input type="hidden" name="pagecon_url" :value="formData.pagecon_url">
        <input type="hidden" name="free1" value="">
        <input type="hidden" name="free2" value="">
        <input type="hidden" name="free3" value="">
        <input type="hidden" name="free_csv" value="">
        <input type="hidden" name="request_date" :value="formData.request_date">
        <input type="hidden" name="limit_second" value="">
        <input type="hidden" name="sps_hashcode" :value="formData.sps_hashcode">
    </form>
</template> -->

<script setup>
import { ref, onMounted } from 'vue';

const card = ref({
    card_number: '',
    card_valid_term: '',
    security_code: ''
});

const message = ref('');

// SBPSのトークンJSを動的に読み込む
onMounted(() => {
    if (!window.SbpsToken) {
        const script = document.createElement('script');
        script.src = 'https://stbtoken.sps-system.com/sbpstoken/com_sbps_system_tds2infotoken.js';
        script.async = true;
        document.body.appendChild(script);
    }
})

const handleSubmit = () => {
    if (!window.SbpsToken) {
        message.value = 'トークンライブラリが読み込まれていません。';
        return;
    }

    window.SbpsToken.getToken(card.value, async (res) => {
        if (res.result === 'OK') {
            const token = res.token;
            const payload = {
                token: token,
                cardValidTerm: card.value.card_valid_term,
                amount: 440, // 課金額
                currency: 'JPY',
                orderId: 'order_2025040001' // 購入ID
            };

            try {
                const response = await fetch('/start-3ds', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.acs_url) {
                        // 3Dセキュア認証画面にリダイレクト
                        window.location.href = data.acs_url;
                    } else {
                        message.value = '認証URLの取得に失敗しました。';
                    }
                } else {
                    message.value = 'サーバーエラーが発生しました。';
                }
            } catch (error) {
                message.value = '通信エラーが発生しました。';
            }
        } else {
            message.value = `トークン発行エラー: ${res.error_message}`;
        }
    })
}
</script>


<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">クレジットカード情報の入力</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">カード番号</label>
                <input 
                    v-model="card.card_number" 
                    type="text" 
                    required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">有効期限（YYMM）</label>
                <input 
                    v-model="card.card_valid_term" 
                    type="text" 
                    maxlength="4" 
                    required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2405"
                />
            </div>
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">セキュリティコード</label>
                <input 
                    v-model="card.security_code" 
                    type="text" 
                    maxlength="4" 
                    required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                />
            </div>
            <button 
                type="submit" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
                支払う
            </button>
        </form>
        <p v-if="message" class="mt-4 text-sm text-red-600">{{ message }}</p>
    </div>
</template>

<style></style>