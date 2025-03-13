<script setup>
import { ref, onMounted } from 'vue';
import { PICKUP_NEWS_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
import dayjs from 'dayjs';

const latestFourNews = ref([]);
const failedMsg = ref('');

// dayjsを使用して日付が14日以内かどうかを判定する関数
const isNew = (publishedDate) => {
    const today = dayjs();
    const publishDate = dayjs(publishedDate);
    const diffDays = today.diff(publishDate, 'day');
    return diffDays <= 14;
};

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
        <div v-for="news in latestFourNews" :key="news.id" class="border-b-1 border-gray-200 pb-2">
            <div class="flex items-center">
                <p>{{ news['published_at'] }}</p>
                <span v-if="isNew(news['published_at'])" class="ml-2">
                    <img src="@/assets/icons/new-notion.svg" alt="new" />
                </span>
            </div>
            <div class="flex items-center">
                <p>{{ news['title'] }}</p>
                <img src="@/assets/icons/arrow-right.png" alt="new" class="w-4 h-4 ml-2" />
            </div>
        </div>
    </div>
</template>
<style></style>