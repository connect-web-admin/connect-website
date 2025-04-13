<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
    const tokenJson = sessionStorage.getItem('sbps_token_data')

    if (!tokenJson) {
        alert('トークン情報が取得できませんでした')
        return
    }

    const { token, tokenKey, cardBrandCode } = JSON.parse(tokenJson)

    // ✅ 不要になったら削除（セキュリティ的に良い）
    sessionStorage.removeItem('sbps_token_data')

    try {
        const response = await fetch('/start-3ds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, tokenKey, brand: cardBrandCode })
        })

        if (response.ok) {
            alert('カード登録が完了しました')
            router.push('/dashboard')
        } else {
            alert('登録に失敗しました')
        }
    } catch (e) {
        alert('通信エラーが発生しました')
    }
})
</script>

<template>
    <div class="p-4">
        <h2 class="text-lg font-bold">クレジットカード登録完了処理中...</h2>
    </div>
</template>
