<script setup>
import { computed, onMounted, ref } from 'vue';
import PickupNewsCompForTop from '@/components/PickupNewsCompForTop.vue';
import MediaCompForTop from '@/components/MediaCompForTop.vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';
import ChampionshipNamesComp from '@/components/ChampionshipNamesComp.vue';
import BannersComp from '@/components/BannersComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(true);

/**
 * 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
 */
const getMatchesInThisWeek = async () => {
    const queryUrl = new URL(`${MATCH_API_URL}/matches-in-this-week`);
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
            noThisWeekMatchesMsg.value = '今週開催予定の試合はありません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    await getMatchesInThisWeek();
    // // データが読み込まれた後に少し待ってからスクロール
    // setTimeout(scrollToTodayMatch, 500);

    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>

<template>
    <div class="px-2 pt-2">
        <div class="font-bold">
            <h1 class="text-xl pt-2">☆お知らせ☆</h1>
            <p>【重要】5月12日（月）システムメンテナンスに伴う一時閉鎖とログアウトのお知らせ<br><router-link to="/pickup-news/article/2025/1202505092002" class="text-blue-500">→こちら</router-link></p>
            <p>北海道カブスリーグの試合結果速報につきまして<br><a href="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/notion/%E3%80%90%E3%81%8A%E7%9F%A5%E3%82%89%E3%81%9B%E3%80%91%E5%8C%97%E6%B5%B7%E9%81%93%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E3%81%AE%E8%A9%A6%E5%90%88%E7%B5%90%E6%9E%9C%E9%80%9F%E5%A0%B1%E3%81%AB%E3%81%A4%E3%81%8D%E3%81%BE%E3%81%97%E3%81%A6.jpg" target="_blank" class="text-blue-500">→こちら</a></p>
            <p>結果速報につきまして<br><a href="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/notion/%E3%80%90%E3%81%8A%E7%9F%A5%E3%82%89%E3%81%9B%E3%80%91%E7%B5%90%E6%9E%9C%E9%80%9F%E5%A0%B1%E3%81%AB%E3%81%A4%E3%81%8D%E3%81%BE%E3%81%97%E3%81%A6.jpg" target="_blank" class="text-blue-500">→こちら</a></p>
        </div>
        <div>
            <h1 class="text-xl pt-2">今週の大会<span class="text-sm text-gray-400">（タップで結果速報へ移動）</span></h1>
            <p class="text-sm text-red-500">毎週火曜日更新</p>
            <div v-if="isLoading" class="flex justify-center items-center py-8">
                <img src="../assets/icons/loading.gif" alt="loading" class="w-10 h-10">
            </div>
            <ChampionshipNamesComp v-else :match-info="matchInfo" />
        </div>

        <div class="my-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">ピックアップニュース</h1>
            <PickupNewsCompForTop />
            <router-link to="/pickup-news" class="flex justify-end mt-5">
                <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg">もっと読む</button>
            </router-link>
        </div>

        <div class="mb-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">メディア</h1>
            <MediaCompForTop />
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