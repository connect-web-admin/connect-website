<script setup>
import { ref, onMounted } from 'vue';
import { PICKUP_NEWS_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
import dayjs from 'dayjs';

const allNews = ref([]);
const failedMsg = ref('');

// dayjsを使用して日付が14日以内かどうかを判定する関数
const isNew = (publishedDate) => {
    const today = dayjs();
    const publishDate = dayjs(publishedDate);
    const diffDays = today.diff(publishDate, 'day');
    return diffDays <= 14;
};

/**
 * 最新の4件のピックアップニュースを取得する
 */
const getAllNews = async () => {
    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/get-all-news`);

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

        allNews.value = await response.json();
    } catch (error) {
        failedMsg.value = 'ピックアップニュースの取得に失敗しました。';
        console.error('ピックアップニュースの取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。');
    }
}

onMounted(async () => {
    // 最新の4件のピックアップニュースを取得する
    await getAllNews();
});
</script>
<template>
    <div>
        <div v-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>


        </div>
    </div>
</template>
<style></style>