<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import { PICKUP_NEWS_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants';

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const router = useRouter();
const fiscalYear = route.params.fiscalYear;
const newsId = route.params.newsId;

// 記事取得中のローディング
const isLoading = ref(false);

// 記事取得失敗時のエラーメッセージ
const failedMsg = ref('');

// 記事の内容
const singleNews = ref([]);

/**
 * 一覧でクリックされたピックアップニュースを取得
 */
const getSingleNews = async () => {
    isLoading.value = true;

    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/article/${fiscalYear}/${newsId}`);

    const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    if (!idToken) {
        failedMsg.value = '認証が無効です。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
        console.error('認証トークンが見つかりません。');
        isLoading.value = false;
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
            isLoading.value = false;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        singleNews.value = await response.json();
    } catch (error) {
        failedMsg.value = '記事の取得に失敗しました。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。または、ブラウザを更新するか、時間を置いてからアクセスしてください。';
        console.error('記事の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

/**
 * ピックアップニュースの内容をHTMLに変換　念のためサニタイズ
 */
const sanitizedHtml = (content) => {
    // contentが存在しない場合は空文字を返す
    if (!content) return '';
    
    // router-linkをaタグに変換
    const convertedContent = content.replace(
        /<router-link\s+to="([^"]+)"[^>]*>(.*?)<\/router-link>/g,
        '<a href="#" class="router-link" data-to="$1">$2</a>'
    );
    
    return DOMPurify.sanitize(convertedContent, {
        ADD_TAGS: ['a'],
        ADD_ATTR: ['href', 'data-to', 'class']
    });
};

onMounted(async () => {
    // 一覧でクリックされたピックアップニュースを取得
    await getSingleNews();

    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });

    // コンテンツ内のリンクにクリックイベントを追加
    document.querySelectorAll('.router-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const to = link.getAttribute('data-to');
            router.push(to);
        });
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
            <h1 class="text-xl font-bold mb-5">{{ singleNews.title }}</h1>
            <div v-html="sanitizedHtml(singleNews.content)"></div>
        </div>
    </div>
</template>
<style></style>