<script setup>
import { ref, onMounted } from 'vue';
import { MEDIA_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
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
    const queryUrl = new URL(`${MEDIA_API_URL}/get-latest-four-articles`);
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

        latestFourArticles.value = await response.json();
    } catch (error) {
        failedMsg.value = 'メディア記事の取得に失敗しました。';
        console.error('メディア記事の取得に失敗しました。');
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
            <div v-for="article in latestFourArticles" :key="article.id" class="flex flex-row h-[100px] justify-between items-center gap-2 border-b-1 border-gray-200 py-2">
                <div class="w-1/5 h-auto">
                    <img src="@/assets/top-sample/OishiRento_thumbnail.jpg" alt="大石蓮斗" class="w-full h-full" />
                </div>
                <div class="w-4/5 h-full flex flex-col items-start">
                    <div class="flex items-center">
                        <p>{{ article['published_at'] }}</p>
                        <span v-if="isNew(article['published_at'])" class="ml-2">
                            <img src="@/assets/icons/new-notion.svg" alt="new" />
                        </span>
                        <span class="block bg-red-400 text-white text-xs px-2 py-1 ml-4 rounded-md">クリック可能</span>
                    </div>
                    <div class="flex items-center">
                        <!-- 40文字超過分は省略 -->
                        <router-link :to="'/media'">
                            <!-- <router-link :to="`/media/${article.article_id}`"> -->
                                <p class="pl-4">{{ article['title'].length > 40 ? article['title'].substring(0, 40) + '……' : article['title'] }}</p>
                        </router-link>
                    </div>
                </div>
            </div>
            <div class="flex flex-row h-[100px] justify-between items-center gap-2 border-b-1 border-gray-200 py-2">
                <div class="w-1/5 h-auto">
                    <img src="@/assets/top-sample/sample1.jpg" alt="サムネ1" class="w-full h-full" />
                </div>
                <div class="w-4/5 h-full flex flex-col items-start">
                    <div class="flex items-center">
                        <p>2025-03-03</p>
                    </div>
                    <div class="flex items-center">
                        <!-- 40文字超過分は省略 -->
                        <!-- <router-link :to="`/media/${article.article_id}`"> -->
                            <p class="pl-4">【ダミーデータ】子どもたちがサッカーに触れる機会を確保するべき　若年層育成のリアルな現場の声</p>
                        <!-- </router-link> -->
                    </div>
                </div>
            </div>
            <div class="flex flex-row h-[100px] justify-between items-center gap-2 border-b-1 border-gray-200 py-2">
                <div class="w-1/5 h-auto">
                    <img src="@/assets/top-sample/sample2.jpg" alt="サムネ2" class="w-full h-full" />
                </div>
                <div class="w-4/5">
                    <div class="flex items-center">
                        <p>2025-03-02</p>
                    </div>
                    <div class="flex items-center">
                        <!-- 40文字超過分は省略 -->
                        <!-- <router-link :to="`/media/${article.article_id}`"> -->
                            <p class="pl-4">【ダミーデータ】「元プロサッカー選手にインタビュー」　選手時代も、引退してからも、楽しい！というところは全く変わっていません。</p>
                        <!-- </router-link> -->
                    </div>
                </div>
            </div>
            <div class="flex flex-row h-[100px] justify-between items-center gap-2 border-b-1 border-gray-200 py-2">
                <div class="w-1/5 h-auto">
                    <img src="@/assets/top-sample/sample3.jpg" alt="サムネ3" class="w-full h-full" />
                </div>
                <div class="w-4/5 h-full flex flex-col items-start">
                    <div class="flex items-center">
                        <p>2025-03-01</p>
                    </div>
                    <div class="flex items-center">
                        <!-- 40文字超過分は省略 -->
                        <!-- <router-link :to="`/media/${article.article_id}`"> -->
                            <p class="pl-4">【ダミーデータ】U-15　春の強化合宿に潜入取材！賢いカラダづくりとは？</p>
                        <!-- </router-link> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>