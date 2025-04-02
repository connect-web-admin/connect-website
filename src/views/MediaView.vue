<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { MEDIA_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';

const failedMsg = ref('');
const isLoading = ref(false);
const allArticles = ref([]);

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
const getallArticles = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${MEDIA_API_URL}/all-articles`);

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

        allArticles.value = await response.json();
    } catch (error) {
        failedMsg.value = '記事の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。';
        console.error('記事の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

// const sanitizedMarkdown = () => {
//     return DOMPurify.sanitize(marked(content.value));
// };

onMounted(async () => {
    await getallArticles();
});
</script>
<template>
    <div class="p-5">
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            <p class="text-center">読み込み中</p>
        </div>
        <div v-else-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-xl font-bold mb-5 border-b-1 border-gray-200 pb-2">メディア</h1>
            <div v-for="article in allArticles" :key="article.id" class="border-b-1 border-gray-200 pb-2 flex flex-row justify-between items-center gap-2">
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
            <div class="mt-20">ページネーション未実装</div>
        </div>
    </div>
</template>
<style></style>