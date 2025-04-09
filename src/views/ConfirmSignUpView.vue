<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MEMBER_API_URL } from '../utils/constants';

const router = useRouter();
const route = useRoute();

const verificationCode = ref('');
const inputEmail = ref(route.query.inputEmail || '');
const isProcessing = ref(false);
const errorMessage = ref('');
const isConfirmSuccess = ref(false);
const isResendSuccess = ref(false);

const confirmSignUp = async () => {
    if (!verificationCode.value) {
        errorMessage.value = '認証コードを入力してください';
        return;
    }

    isProcessing.value = true;
    errorMessage.value = '';

    try {
        console.log('認証コード確認リクエスト送信:', {
            inputEmail: inputEmail.value,
            verificationCode: verificationCode.value
        });
        
        const response = await fetch(`${MEMBER_API_URL}/confirm-signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                inputEmail: inputEmail.value,
                verificationCode: verificationCode.value
            })
        });

        const data = await response.json();
        console.log('認証コード確認レスポンス:', data);

        if (!response.ok) {
            throw new Error(data.message || '認証に失敗しました');
        }

        isConfirmSuccess.value = true;
        setTimeout(() => {
            router.push('/');
        }, 20000);
    } catch (error) {
        console.error('認証エラー:', error);
        errorMessage.value = error.message || '認証に失敗しました。時間をおいて再度お試しください。';
    } finally {
        isProcessing.value = false;
    }
};

const resendCode = async () => {
    if (!inputEmail.value) {
        errorMessage.value = 'メールアドレスが見つかりません';
        return;
    }

    isProcessing.value = true;
    errorMessage.value = '';

    try {
        console.log('認証コード再送信リクエスト送信:', {
            inputEmail: inputEmail.value
        });
        
        const response = await fetch(`${MEMBER_API_URL}/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                inputEmail: inputEmail.value
            })
        });

        const data = await response.json();
        console.log('認証コード再送信レスポンス:', data);

        if (!response.ok) {
            throw new Error(data.message || '認証コードの再送信に失敗しました');
        }

        isResendSuccess.value = true;
    } catch (error) {
        console.error('認証コード再送信エラー:', error);
        errorMessage.value = error.message || '認証コードの再送信に失敗しました';
    } finally {
        isProcessing.value = false;
    }
};
</script>

<template>
    <div class="max-w-2xl mx-auto p-8">
        <h1 class="text-xl font-bold mb-6">メールアドレスの認証</h1>
        
        <div v-if="isProcessing" class="flex justify-center items-center">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>

        <div v-else>
            <div v-if="isConfirmSuccess" class="text-black">
                メールアドレスの認証が完了しました。ご登録いただいたメールアドレスとパスワードでログインすることができます。<br><br>
                20秒後に自動でログインページへ移動します。移動しない場合は、
                <router-link to="/" class="text-blue-600 underline">ログインページ</router-link>
                をタップしてください。
            </div>
            <div v-else>
                <p class="mb-4">
                    {{ inputEmail }} 宛に送信された６ケタの認証コードを入力してください。<br>
                    認証コードが届くまで１分以上かかることがあります。
                </p>

                <form @submit.prevent="confirmSignUp" class="space-y-6">
                    <div class="space-y-2">
                        <label for="verificationCode" class="block text-sm font-medium text-gray-700">
                            認証コード <span class="text-red-500">*必須</span>
                        </label>
                        <input
                            type="text"
                            id="verificationCode"
                            v-model="verificationCode"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="認証コードを入力"
                        >
                    </div>

                    <div v-if="errorMessage" class="text-red-600 text-sm">
                        {{ errorMessage }}
                    </div>

                    <div v-if="isResendSuccess" class="text-green-600 text-sm">
                        認証コードを再送信しました
                    </div>

                    <div class="flex flex-col space-y-4">
                        <button
                            type="submit"
                            class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            認証
                        </button>

                        <button
                            type="button"
                            @click="resendCode"
                            class="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            認証コードを再送信
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template> 