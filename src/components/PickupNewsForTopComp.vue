<script setup>
import { ref, onMounted } from 'vue';
import { PICKUP_NEWS_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';

const latestFourNews = ref([]);
const failedMsg = ref('');

const getPickupNews = async () => {
    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/get-latest-four-news`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        latestFourNews.value = await response.json();
        console.log(latestFourNews.value);
    } catch (error) {
        failedMsg.value = 'ピックアップニュースの取得に失敗しました。';
        console.error('ピックアップニュースの取得に失敗しました。');
    }
}

onMounted(async () => {
    await getPickupNews();
});
</script>
<template> 
<div v-if="failedMsg">
    <p>{{ failedMsg }}</p>
</div>
<div v-else>
    <div>
        <h1>ピックアップニュース</h1>
        <div v-for="news in latestFourNews" :key="news.id">
            <h2>{{ news.title }}</h2>
            <p>{{ news.content }}</p>
        </div>
    </div>
</div>
</template>
<style></style>