<script setup>
import { ref } from 'vue';
import CryptoJS from 'crypto-js';

// 購入要求の日時
const requestDate = ref('');
// ハッシュコード
const spsHashcode = ref('');

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

// 購入要求
// const formData = {
//     pay_method: 'credit',
//     merchant_id: '19788',
//     service_id: '001',
//     cust_code: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
//     order_id: 'YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY',
//     item_id: '1',
//     item_name: 'テスト商品名',
//     amount: '1',
//     pay_type: '0',
//     service_type: '0',
//     success_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url',
//     cancel_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url',
//     error_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url',
//     pagecon_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url'
// }
const formData = {
    pay_method: 'credit3d2',
    merchant_id: '58913',
    service_id: '001',
    cust_code: 'ekekekekekekekekekekekekekekekekeke3',
    success_url: 'https://connect-goals.com/archive', // クレカ情報を入力して、支払いが完了しましたまで到達した場合の遷移先
    cancel_url: 'https://connect-goals.com/media', // クレカ情報を入力して、支払いがキャンセルされた場合の遷移先
    error_url: 'https://connect-goals.com/pickup-news', // クレカ情報を入力して、支払いに失敗した場合の遷移先
    pagecon_url: 'https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items/pagecon_url' // memberLambdaで決済システムからの処理受け取り
}

/**
 * ハッシュコードを生成
 * @returns {string} ハッシュコード
 */
const generateHash = () => {
    // ハッシュキー
    // const hashKey = '628779fb3044932486354ca601169f2bbab32660';
    const hashKey = '398a58952baf329cac5efbae97ea84ba17028d02';
    // 全ての値を連結（値の前後のスペースを削除）
    const concatenatedValues = Object.values(formData)
        .map(value => String(value).trim())
        .join('')

    // ハッシュキーを結合
    const stringToHash = concatenatedValues + requestDate.value + hashKey;

    // UTF-8でエンコードしてSHA1ハッシュを生成
    const hash = CryptoJS.SHA1(stringToHash).toString().toUpperCase();

    return hash
}

/**
 * フォーム送信時の処理 
 */
const handleSubmit = (event) => {
    // フォーム送信時に最新の日時を設定
    requestDate.value = generateRequestDate()
    // ハッシュコードを生成
    spsHashcode.value = generateHash()
}
</script>

<template>
    <form method="POST" action="https://stbfep.sps-system.com/f04/FepPayInfoReceive.do" accept-charset="Shift_JIS"
        @submit="handleSubmit">
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
        <input type="hidden" name="request_date" :value="requestDate">
        <input type="hidden" name="limit_second" value="">
        <input type="hidden" name="sps_hashcode" :value="spsHashcode">
        <!-- <input type="hidden" name="service_type" :value="formData.service_type">
        <input type="hidden" name="order_id" :value="formData.order_id">
        <input type="hidden" name="item_id" :value="formData.item_id">
        <input type="hidden" name="item_name" :value="formData.item_name">
        <input type="hidden" name="tax" value="">
        <input type="hidden" name="amount" :value="formData.amount">
        <input type="hidden" name="pay_type" :value="formData.pay_type"> -->
        <input type="submit" value="submit">
    </form>
</template>
