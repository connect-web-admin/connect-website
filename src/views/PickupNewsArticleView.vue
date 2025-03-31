<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { PICKUP_NEWS_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const router = useRouter();
const newsId = route.params.newsId;

const failedMsg = ref('');
const isLoading = ref(false);

const singleNews = ref([]);
const content = ref('');
/**
 * 最新の4件のピックアップニュースを取得する
 */
const getSingleNews = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/article/${THIS_FISCAL_YEAR}/${newsId}`);

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

        singleNews.value = await response.json();
        content.value = singleNews.value.content;
    } catch (error) {
        failedMsg.value = '記事の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。';
        console.error('記事の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

const sanitizedMarkdown = () => {
    return DOMPurify.sanitize(marked(content.value));
};

onMounted(async () => {
    await getSingleNews();
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
            <h1 class="text-xl font-bold mb-5">{{ singleNews.title }}</h1>
            <div v-html="sanitizedMarkdown()"></div>
        </div>
    </div>
</template>
<style></style>