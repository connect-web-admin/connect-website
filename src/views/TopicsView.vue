<script setup>
import { ref, onMounted, computed } from 'vue'
import { THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from '@/utils/constants'

const TOPICS_API_URL = 'https://bvic1wpra8.execute-api.ap-northeast-1.amazonaws.com/dev/items'
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

// 読み込み中表示のオンオフ
const isLoading = ref(false)

const topics = ref([])

// 当年度のお知らせすべてを取得する
const getTopics = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ TOPICS_API_URL }/objects/${ THIS_FISCAL_YEAR }`)

    try {
        // トピックス取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        });

        const originalData = await response.json()
        topics.value = originalData
    } catch(error) {
        console.error('トピックスの取得に失敗しました。', error)
    } finally {
        isLoading.value = false
    }
}

onMounted( async () => {
    await getTopics()
})
</script>

<template>
<div class="topics-wrapper">
    <div v-if="isLoading">
        <p>読み込み中</p>
    </div>
    <div v-else>
        <div v-for="item in topics">
            <h1>{{ item.category }}</h1>
            <div v-for="item2 of item.articles">
                {{ item2['title'] }}
                {{ item2['content'] }}
            </div>
        </div>


    </div>
</div>
</template>


<style scoped></style>