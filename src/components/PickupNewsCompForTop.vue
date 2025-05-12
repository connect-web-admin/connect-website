<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
    latestTwoNews: {
        type: Array,
        required: true,
    },
});

const failedMsg = ref('');

/**
 * dayjsを使用して日付が14日以内かどうかを判定する関数
 */
const isNew = (publishedDate) => {
    const today = dayjs();
    const publishDate = dayjs(publishedDate);
    const diffDays = today.diff(publishDate, 'day');
    return diffDays <= 14;
};
</script>
<template>
    <div>
        <div v-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <div v-for="news in latestTwoNews" :key="news.id" class="border-b-1 border-gray-200 pb-2">
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
        </div>
    </div>
</template>
<style></style>