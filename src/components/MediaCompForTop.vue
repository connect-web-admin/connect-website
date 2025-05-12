<script setup>
import { ref, onMounted } from 'vue';
import { MEDIA_API_URL, THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from '@/utils/constants';
import dayjs from 'dayjs';

const latestFourArticles = ref([]);
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

/**
 * 最新の4件のメディア記事を取得する
 */
const getLatestFourArticles = async () => {
    const queryUrl = new URL(`${MEDIA_API_URL}/latest-four-articles`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    if (!idToken) {
        failedMsg.value = '認証が無効です。再度ログインしてください。';
        console.error('認証トークンが見つかりません。');
        return;
    }

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        if (response.status === 401) {
            failedMsg.value = '認証が無効です。ログインしてから再度ログインしてください。';
            console.error('認証が無効です。');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        latestFourArticles.value = await response.json();
        // article_idで降順ソート（新しい記事を上に表示）
        latestFourArticles.value.sort((a, b) => b.article_id.localeCompare(a.article_id));
    } catch (error) {
        failedMsg.value = 'メディア記事の取得に失敗しました。';
        console.error('メディア記事の取得に失敗しました。', error);
    }
}

onMounted(async () => {
    // 最新の4件のメディア記事を取得する
    await getLatestFourArticles();
});
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