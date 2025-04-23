<script setup>
import { ref, onMounted } from "vue"
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
                "Content-Type": "application/json"
                // 'Authorization': `Bearer ${ idTokenForAuth }`
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
        
        // ページ遷移時に最上部へスクロール
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });
    } catch (error) {
        console.error("送信エラー", error)
        alert("送信に失敗しました。時間をおいて再度お試しください。")
    }
}

const toggleConfirmView = () => {
    isConfirmView.value = !isConfirmView.value
}

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>

<template>
<div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">お問い合わせ</h1>
        <div class="bg-white shadow rounded-lg p-6 sm:p-8">
            <form @submit.prevent="sendInquiry" class="space-y-6">
                <div v-if="!isConfirmView">
                    <!-- お問い合わせ種別 -->
                    <div class="space-y-2 mb-4">
                        <label for="category" class="block text-sm font-medium text-gray-700">
                            お問い合わせ種別<span class="text-red-500">*</span>
                        </label>
                        <select 
                            v-model="inquiryData.category" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            required
                            id="category"
                            name="category"
                        >
                            <option disabled selected value=''>選択してください</option>
                            <option value="試合結果について">試合結果について</option>
                            <option value="チーム紹介について">チーム紹介について</option>
                            <option value="写真・動画について">写真・動画について</option>
                            <option value="お知らせについて">お知らせについて</option>
                            <option value="プレミアム会員について">プレミアム会員について</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <!-- お問い合わせ内容 -->
                    <div class="space-y-2 mb-4">
                        <label for="message" class="block text-sm font-medium text-gray-700">
                            お問い合わせ内容<span class="text-red-500">*</span>
                            <span class="text-sm text-gray-500">（1000字以内。現在{{ inquiryData.message.length }}字）</span>
                        </label>
                        <textarea 
                            v-model="inquiryData.message" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            rows="6"
                            required
                            id="message"
                            name="message"
                        ></textarea>
                    </div>

                    <!-- お名前 -->
                    <div class="space-y-2 mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">
                            お名前<span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            v-model="inquiryData.name" 
                            placeholder="（例）山田太郎"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            required
                            id="name"
                            name="name"
                            autocomplete="name"
                        />
                    </div>

                    <!-- ふりがな -->
                    <div class="space-y-2 mb-4">
                        <label for="furigana" class="block text-sm font-medium text-gray-700">
                            お名前（ふりがな）<span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            v-model="inquiryData.furigana" 
                            placeholder="（例）やまだたろう"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            required
                            id="furigana"
                            name="furigana"
                        />
                    </div>

                    <!-- メールアドレス -->
                    <div class="space-y-2 mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            メールアドレス<span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="email" 
                            v-model="inquiryData.email" 
                            placeholder="（例）yamada@toiawase.com"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            required
                            id="email"
                            name="email"
                            autocomplete="email"
                        />
                    </div>

                    <!-- 電話番号 -->
                    <div class="space-y-2 mb-4">
                        <label for="phoneNum" class="block text-sm font-medium text-gray-700">
                            電話番号(ハイフンなし)
                        </label>
                        <input 
                            type="tel" 
                            v-model="inquiryData.phoneNum" 
                            placeholder="（例）090123456"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
                            id="phoneNum"
                            name="phoneNum"
                        />
                    </div>

                    <button 
                        type="submit" 
                        @click="toggleConfirmView"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        確認画面
                    </button>
                </div>

                <!-- 確認画面 -->
                <div v-else class="space-y-6">
                    <p class="text-lg font-medium text-gray-900">記入内容は下記のとおりです。</p>
                    <div class="space-y-4">
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">お問い合わせ種別</p>
                            <p class="mt-1 text-gray-900">{{ inquiryData.category }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">お問い合わせ内容</p>
                            <p class="mt-1 text-gray-900 whitespace-pre-line">{{ inquiryData.message }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">お名前</p>
                            <p class="mt-1 text-gray-900">{{ inquiryData.name }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">お名前（ふりがな）</p>
                            <p class="mt-1 text-gray-900">{{ inquiryData.furigana }}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">メールアドレス</p>
                            <p class="mt-1 text-gray-900">{{ inquiryData.email }}</p>
                            <input type="hidden" v-model="inquiryData.email" required/>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-md">
                            <p class="text-sm font-medium text-gray-500">電話番号</p>
                            <p class="mt-1 text-gray-900">
                                <span v-if="inquiryData.phoneNum">{{ inquiryData.phoneNum }}</span>
                                <span v-else class="text-gray-500">未記入</span>
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col space-y-4">
                        <button 
                            type="submit" 
                            @click="toggleConfirmView"
                            class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            修正画面
                        </button>

                        <p class="text-sm text-gray-500 text-center">
                            <a href="https://connect-goals.com/site-info/terms-of-service" target="_blank" class="text-blue-500 hover:text-blue-600">利用規約</a>・<a href="https://connect-goals.com/site-info/privacy-policy" target="_blank" class="text-blue-500 hover:text-blue-600">プライバシーポリシー</a>に同意のうえ送信してください。3営業日以内に返信いたします。
                        </p>

                        <button 
                            type="submit"
                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            送信
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<style></style>