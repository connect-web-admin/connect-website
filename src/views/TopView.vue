<script setup>
import { computed, onMounted, ref } from 'vue';
import PickupNewsCompForTop from '@/components/PickupNewsCompForTop.vue';
import MediaCompForTop from '@/components/MediaCompForTop.vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR, PICKUP_NEWS_API_URL, MEDIA_API_URL } from '@/utils/constants';
import ChampionshipNamesComp from '@/components/ChampionshipNamesComp.vue';
import BannersComp from '@/components/BannersComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(true);
const latestTwoNews = ref([]);
const latestFourArticles = ref([]);
const failedMsgPickupNews = ref('');
const failedMsgMedia = ref('');

/**
 * 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
 */
const getMatchesInThisWeekForTop = async () => {
    const queryUrl = new URL(`${MATCH_API_URL}/matches-in-this-week-for-top`);
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

        matchInfo.value = await response.json();
        if (matchInfo.value.length > 0) {
            return true;
        } else {
            noThisWeekMatchesMsg.value = '今週開催予定の試合がないか、まだ更新されていません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

/**
 * 最新の4件のピックアップニュースを取得する
 */
const getLatestTwoNews = async () => {
    const queryUrl = new URL(`${PICKUP_NEWS_API_URL}/latest-four-news`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    // const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    // if (!idToken) {
    //     failedMsgPickupNews.value = '認証トークンが見つかりません。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
    //     console.error('認証トークンが見つかりません。');
    //     return;
    // }
    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            failedMsgPickupNews.value = '認証が無効です。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
            console.error('認証が無効です。');
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        latestTwoNews.value = await response.json();
        // news_idで降順ソート（新しい記事を上に表示）
        latestTwoNews.value.sort((a, b) => b.news_id.localeCompare(a.news_id));
    } catch (error) {
        failedMsgPickupNews.value = 'ピックアップニュースの取得に失敗しました。';
        console.error('ピックアップニュースの取得に失敗しました。');
    }
}

/**
 * 最新の4件のメディア記事を取得する
 */
const getLatestFourArticles = async () => {
    const queryUrl = new URL(`${MEDIA_API_URL}/latest-four-articles`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    // const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    // if (!idToken) {
    //     failedMsgMedia.value = '認証トークンが見つかりません。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
    //     console.error('認証トークンが見つかりません。');
    //     return;
    // }

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            failedMsgMedia.value = '認証が無効です。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
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
        failedMsgMedia.value = 'メディア記事の取得に失敗しました。';
        console.error('メディア記事の取得に失敗しました。', error);
    }
}

onMounted(async () => {
    await getMatchesInThisWeekForTop();
    await getLatestTwoNews();
    await getLatestFourArticles();

    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>

<template>
    <div class="px-2 pt-2">
        <div>
            <h1 class="text-xl pt-2">今週の大会</h1>
            <p class="text-sm text-red-500">毎週金曜日更新</p>
            <div v-if="isLoading" class="flex justify-center items-center py-8">
                <img src="../assets/icons/loading.gif" alt="loading" class="w-10 h-10">
            </div>
            <ChampionshipNamesComp v-else :match-info="matchInfo" />
        </div>

        <div class="my-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">ピックアップニュース</h1>
            <PickupNewsCompForTop :latest-two-news="latestTwoNews" />
            <router-link to="/pickup-news" class="flex justify-end mt-5">
                <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg">もっと読む</button>
            </router-link>
        </div>

        <div class="mb-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">メディア</h1>
            <MediaCompForTop :latest-four-articles="latestFourArticles" />
            <router-link to="/media" class="flex justify-end mt-5">
                <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg">もっと読む</button>
            </router-link>
        </div>

        <div>
            <BannersComp />
        </div>
    </div>
</template>

<style></style>