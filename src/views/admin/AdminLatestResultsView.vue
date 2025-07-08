<script setup>
import { ref, onMounted } from 'vue';
import { MATCH_API_URL, THIS_FISCAL_YEAR, USER_ATTR_EMAIL } from '@/utils/constants';
import AdminChampionshipNamesComp from '@/components/admin/AdminChampionshipNamesComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(false);

/**
* アクセス日の属する年度の大会をすべて取得
*/
const getMatchesInPastAndPrevTwoWeeks = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${MATCH_API_URL}/matches-in-two-weeks-for-top`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);
    queryUrl.searchParams.append('tryingEmail', localStorage.getItem(USER_ATTR_EMAIL));

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
            noThisWeekMatchesMsg.value = '今週開催予定の試合が存在しないか、まだ更新されていません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    await getMatchesInPastAndPrevTwoWeeks();
});
</script>

<template>
    <div class="p-4">
        <div class="flex flex-col justify-between items-center">
            <div v-if="isLoading" class="flex justify-center items-center mt-10">
                <img src="../../assets/icons/loading.gif" alt="loading" class="w-10 h-10">
            </div>
            <div v-else>
                <p class="pl-1 mt-1">
                    ■ U-18プリンスリーグの大会詳細結果→<a href="https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/"
                        target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">こちら</a>
                </p>
                <p class="text-red-500">星取表作成用の試合結果表示</p>
                <AdminChampionshipNamesComp :match-info="matchInfo" />
            </div>
        </div>
    </div>
</template>

<style></style>