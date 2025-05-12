<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
    latestFourArticles: {
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
            <div v-for="article in latestFourArticles" :key="article.id" class="flex flex-row justify-between items-center gap-2 border-b-1 border-gray-200 py-1">
                <div class="w-1/5 h-auto">
                    <img :src="article['thumbnail']" alt="サムネイル" class="w-full h-full object-cover" />
                </div>
                <div class="w-4/5 h-full flex flex-col items-start">
                    <div class="flex items-center">
                        <p>{{ article['published_at'] }}</p>
                        <span v-if="isNew(article['published_at'])" class="ml-2">
                            <img src="@/assets/icons/new-notion.svg" alt="new" />
                        </span>
                    </div>
                    <div class="flex items-center">
                        <!-- 40文字超過分は省略 -->
                        <router-link :to="`/media/article/${article.fiscal_year}/${article.article_id}`">
                            <p class="pl-4">{{ article['title'].length > 40 ? article['title'].substring(0, 40) + '……' : article['title'] }}</p>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>