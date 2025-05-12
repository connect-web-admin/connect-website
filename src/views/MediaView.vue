<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { MEDIA_API_URL, THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from '@/utils/constants';

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

        allArticles.value = await response.json();

        // article_idで降順ソート（新しい記事を上に表示）
        allArticles.value.sort((a, b) => b.article_id.localeCompare(a.article_id));
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

    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
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
            <div class="flex flex-row justify-between items-end mb-8 gap-10 border-b-1 border-gray-200 pb-2">
                <h1 class="text-xl font-bold w-[200px]">メディア</h1>
                <a href="https://www.sponichi.co.jp" target="_blank" class="w-fulll">
                    <img 
                        src="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/banner-link-img/sponichi.png" 
                        alt="スポニチアネックスバナー" 
                        class="w-[200px] h-auto py-1 px-2 border-1 border-[#070e85] rounded-sm" 
                    />
                </a>
            </div>
            <div v-for="article in allArticles" :key="article.id" class="border-b-1 border-gray-200 py-1 flex flex-row justify-between items-center gap-2">
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
            <div class="mt-20"></div>
        </div>
    </div>
</template>
<style></style>