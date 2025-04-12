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


<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">クレジットカード情報の入力</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">カード番号</label>
          <input 
            v-model="card.card_number" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">有効期限（YYMM）</label>
          <input 
            v-model="card.card_valid_term" 
            type="text" 
            maxlength="4" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2405"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">セキュリティコード</label>
          <input 
            v-model="card.security_code" 
            type="text" 
            maxlength="4" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123"
          />
        </div>
        <button 
          type="submit" 
          :disabled="!isTokenLibReady"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          支払う
        </button>
      </form>
      <p v-if="message" class="mt-4 text-sm text-red-600 text-center">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const card = ref({
  card_number: '',
  card_valid_term: '',
  security_code: ''
})

const message = ref('')
const isTokenLibReady = ref(false)

const loadSbpsToken = () => {
  return new Promise((resolve, reject) => {
    // すでに読み込まれている場合
    if (window.SbpsToken) {
      resolve(window.SbpsToken)
      return
    }

    // moduleオブジェクトを事前に定義
    window.module = { exports: {} }
    
    const script = document.createElement('script')
    script.src = 'https://stbtoken.sps-system.com/sbpstoken/com_sbps_system_tds2infotoken.js'
    script.async = true
    script.type = 'text/javascript'
    
    script.onload = () => {
      // ライブラリの初期化を待つ
      const checkSbpsToken = setInterval(() => {
        if (window.SbpsToken) {
          clearInterval(checkSbpsToken)
          resolve(window.SbpsToken)
        }
      }, 100)

      // 10秒後にタイムアウト
      setTimeout(() => {
        clearInterval(checkSbpsToken)
        reject(new Error('トークンライブラリの初期化がタイムアウトしました'))
      }, 10000)
    }

    script.onerror = () => {
      reject(new Error('トークンライブラリの読み込みに失敗しました'))
    }

    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await loadSbpsToken()
    isTokenLibReady.value = true
  } catch (error) {
    message.value = error.message
    console.error('SbpsToken初期化エラー:', error)
  }
})

const handleSubmit = () => {
  if (!window.SbpsToken || !isTokenLibReady.value) {
    message.value = 'トークンライブラリが読み込まれていません。ページを再読み込みしてください。'
    return
  }

  window.SbpsToken.getToken(card.value, async (res) => {
    if (res.result === 'OK') {
      const token = res.token
      const payload = {
        token: token,
        cardValidTerm: card.value.card_valid_term,
        amount: 1000,
        currency: 'JPY',
        orderId: 'order_2025040001'
      }

      try {
        const response = await fetch('/api/start-3ds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          const data = await response.json()
          if (data.acs_url) {
            window.location.href = data.acs_url
          } else {
            message.value = '認証URLの取得に失敗しました。'
          }
        } else {
          message.value = 'サーバーエラーが発生しました。'
        }
      } catch (error) {
        message.value = '通信エラーが発生しました。'
      }
    } else {
      message.value = `トークン発行エラー: ${res.error_message}`
    }
  })
}
</script>

<style scoped>
/* 既存のスタイルを削除 */
</style>
  