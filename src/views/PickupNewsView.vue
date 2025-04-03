<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { PICKUP_NEWS_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';

const failedMsg = ref('');
const isLoading = ref(false);
const allNews = ref([]);

/**
 * dayjsを使用して日付が14日以内かどうかを判定する関数
 */
const isNew = (publishedDate) => {
    const today = dayjs();
    const publishDate = dayjs(publishedDate);
    const diffDays = today.diff(publishDate, 'day');
    return diffDays <= 14;
};

/**
 * 当年度のすべてのピックアップニュースを取得する
 */
const getAllNews = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/all-news`);

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
        console.log(allNews.value);
        // news_idで降順ソート（新しい記事を上に表示）
        allNews.value.sort((a, b) => a.news_id.localeCompare(b.news_id));
    } catch (error) {
        failedMsg.value = '記事の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。';
        console.error('記事の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    await getAllNews();
});
</script>
<template>
    <div class="p-5">
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-xl font-bold mb-5 border-b-1 border-gray-200 pb-2">ピックアップニュース</h1>
            <div v-for="news in allNews" :key="news.id" class="border-b-1 border-gray-200 pb-2">
                <div class="flex flex-row items-center">
                    <p>{{ news['published_at'] }}</p>
                    <span v-if="isNew(news['published_at'])" class="ml-2">
                        <img src="@/assets/icons/new-notion.svg" alt="new" />
                    </span>
                </div>
                <div>
                    <!-- 40文字超過分は省略 -->
                    <router-link :to="`/pickup-news/article/${news.fiscal_year}/${news.news_id}`" class="flex flex-row justify-between items-center">
                        <p class="pl-4">{{ news['title'].length > 40 ? news['title'].substring(0, 40) + '……' : news['title'] }}</p>
                        <img src="@/assets/icons/arrow-right.png" alt="new" class="w-4 h-4 ml-2" />
                    </router-link>
                </div>
            </div>
            <div class="mt-20"></div>
        </div>
    </div>
</template>
<style></style>