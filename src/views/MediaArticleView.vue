<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DOMPurify from 'dompurify';
import { MEDIA_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants';

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const fiscalYear = route.params.fiscalYear;
const articleId = route.params.articleId;

// 記事取得中のローディング
const isLoading = ref(false);

// 記事取得失敗時のエラーメッセージ
const failedMsg = ref('');

// 記事の内容
const singleArticle = ref([]);

/**
 * 一覧でクリックされたメディア記事を取得
 */
const getSingleArticle = async () => {
    isLoading.value = true;

    const queryUrl = new URL(`${MEDIA_API_URL}/article/${fiscalYear}/${articleId}`);

    const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    if (!idToken) {
        failedMsg.value = '認証が無効です。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
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
            failedMsg.value = '認証が無効です。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
            console.error('認証が無効です。');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        singleArticle.value = await response.json();
    } catch (error) {
        failedMsg.value = '記事の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。';
        console.error('記事の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

/**
 * メディア記事の内容をHTMLに変換　念のためサニタイズ
 */
const sanitizedHtml = (content) => {
    return DOMPurify.sanitize(content);
};

onMounted(async () => {
    // 一覧でクリックされたメディア記事を取得
    await getSingleArticle();

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
            <h1 class="text-xl font-bold mb-5">{{ singleArticle.title }}</h1>
            <div v-html="sanitizedHtml(singleArticle.content)"></div>
        </div>
    </div>
</template>
<style></style>