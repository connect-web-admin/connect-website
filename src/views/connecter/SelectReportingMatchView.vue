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

const router = useRouter();
const isLoading = ref(false);
const urlAccessToken = ref('');
const matchInfo = ref([]); // 試合情報

/**
 * 速報対象試合検索　アクセス日に開催予定の試合を取得
 */
const getCurrentMatches = async () => {
    isLoading.value = true

    const queryUrl = new URL(`${MATCH_API_URL_V2}/target-championship`);
    queryUrl.searchParams.append('championshipId', championshipId);

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

        const allMatchDates = await response.json();
        if (allMatchDates.length > 0) {
            matchInfo.value = allMatchDates;
            return true;
        } else {
            inaccessibleMsg.value = 'アクセスを許可されていません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

// ページ表示前にConnecterDDBから試合情報抽出
onMounted(async () => {
    // 速報対象試合検索画面に戻るためカテゴリーとアクセストークンをローカルストレージに保存
    urlAccessToken.value = props.urlAccessToken;
    localStorage.setItem('urlAccessToken', urlAccessToken.value);

    await getCurrentMatches();
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