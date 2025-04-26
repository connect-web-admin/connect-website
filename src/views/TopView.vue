<script setup>
import { computed, onMounted, ref } from 'vue';
import PickupNewsCompForTop from '@/components/PickupNewsCompForTop.vue';
import MediaCompForTop from '@/components/MediaCompForTop.vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';
import ChampionshipNamesComp from '@/components/ChampionshipNamesComp.vue';
import BannersComp from '@/components/BannersComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');

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
        <div>
            <h1 class="text-xl pt-2">今週の大会<span class="text-sm text-gray-400">（タップで結果速報へ移動）</span></h1>
            <p class="text-sm text-red-500">毎週火曜日更新</p>
            <ChampionshipNamesComp :match-info="matchInfo" />
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