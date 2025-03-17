<script setup>
import { ref, onMounted } from 'vue';
import { MATCH_API_URL } from '@/utils/constants';

const matchResults = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

const getMatchResults = async () => {
    isLoading.value = true
    errorMessage.value = '' // エラーメッセージをリセット

    // 試合情報取得用のURLを作成
    // 試合を絞り込むために年度とIDをクエリパラメータに含める
    const queryUrl = new URL(`${MATCH_API_URL}/target-match`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);
    queryUrl.searchParams.append('championshipId', championshipId);
    queryUrl.searchParams.append('matchId', matchId);

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        // レスポンスのステータスを確認
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        matchResults.value = data;
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合データの取得に失敗しました。';
    } finally {
        isLoading.value = false;
    }

};

onMounted(async () => {
    console.log('試合結果一覧');
    await getMatchResults();
});
</script>
<template>
    <div>
        <div v-if="isLoading">
            <img src="../../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            <p class="text-center">読み込み中……</p>
        </div>
        <div v-else>
            <h1>試合結果一覧</h1>
            <div v-for="matchResult in matchResults" :key="matchResult.id">
                <p>{{ matchResult.championship_name }}</p>
                <p>{{ matchResult.round }}</p>
                <p>{{ matchResult.match }}</p>
                
            </div>
        </div>
    </div>
</template>
<style></style>