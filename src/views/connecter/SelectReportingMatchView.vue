<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CopyrightComp from '@/components/CopyrightComp.vue';
import { ARCHIVE_API_URL, MATCH_API_URL_V2, THIS_FISCAL_YEAR } from '@/utils/constants';

// プラグインを設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

const route = useRoute();
// ルーティングで渡されたパラメータを取得。大会ID
const championshipId = route.params.championshipId;
// ルーティングで渡されたパラメータを取得。アクセストークン
const urlAccessToken = route.params.urlAccessToken;

const router = useRouter();
const isLoading = ref(false);
const championshipInfo = ref({}); // 試合情報
const matchesInfo = ref([]); // 速報対象試合情報

/**
 * 速報対象大会の情報を取得
 * カテゴリ、大会名をブラウザに表示するため
 */
const getTargetChampionshipInfo = async () => {
    const queryUrlArchive = new URL(`${ARCHIVE_API_URL}/target-championship`);
    queryUrlArchive.searchParams.append('championshipId', championshipId);

    try {
        const response = await fetch(queryUrlArchive, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        championshipInfo.value = await response.json();
    } catch (error) {
        console.error('速報対象大会の取得に失敗しました。');
    }
}

/**
 * 速報対象試合の情報を取得
 * 試合情報をブラウザに表示するため
 */
const getTargetMatchesInfo = async () => {
    const queryUrl = new URL(`${MATCH_API_URL_V2}/target-matches`);
    queryUrl.searchParams.append('urlAccessToken', urlAccessToken);

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

        matchesInfo.value = await response.json();
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    }
}

// ページ表示前にConnecterDDBから試合情報抽出
onMounted(async () => {
    isLoading.value = true;
    await getTargetChampionshipInfo();
    await getTargetMatchesInfo();
    isLoading.value = false;
});

// CSS
const eachMenuContainer = 'border-1 border-gray-300';
const menuHeading = 'px-2 py-1 bg-blue-200 border-b-1 border-gray-300';
const eachSelect = 'px-2 py-1 not-last:border-b-1 not-last:border-gray-300 not-last:cursor-pointer';
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
const selectBtn = 'mr-2 min-w-12 h-10';
</script>

<template>
    <div>
        <div class="mt-5">
            <img src="@/assets/connect-title-logo.svg" alt="コネクト" class="mx-auto">
        </div>
        <div v-if="isLoading" class="mt-20">
            <img src="@/assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else class="w-full h-full px-6 pt-4 pb-50">

        </div>
        <CopyrightComp />
    </div>
</template>
<style></style>