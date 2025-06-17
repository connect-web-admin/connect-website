<script setup>
import { ref, onMounted } from 'vue';
import { MATCH_API_URL, THIS_FISCAL_YEAR, USER_ATTR_EMAIL } from '@/utils/constants';
import ChampionshipNamesComp from '@/components/ChampionshipNamesComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(false);

/**
* アクセス日から次の月曜日までに開催予定の試合を取得（火曜日始まり月曜終わり）
*/
const getMatchesInThisWeek = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${MATCH_API_URL}/matches-in-this-week-for-top`);
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
    await getMatchesInThisWeek();
});
</script>

<template>
    <div class="p-4">
        <div class="flex flex-col justify-between items-center">
            <div v-if="isLoading" class="flex justify-center items-center mt-10">
                <img src="../assets/icons/loading.gif" alt="loading" class="w-10 h-10">
            </div>
            <div v-else>
                <p class="pl-1 mt-1">
                    ■ U-18プリンスリーグの大会詳細結果→<a href="https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/"
                        target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">こちら</a>
                </p>
                <p class="pl-1 mb-1">
                    ■ 高校総体北海道大会結果→<a href="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/notion/%E3%82%A4%E3%83%B3%E3%83%8F%E3%82%A4%E7%B5%90%E6%9E%9C0617.pdf" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">こちら</a> <span class="text-red-500">New!</span>
                </p>
                <p class="text-sm text-red-500">毎週火曜日更新<br>会場の状況や天候により、定刻通りの速報とならない場合があります。</p>
                <ChampionshipNamesComp :match-info="matchInfo" />
            </div>
        </div>
    </div>
</template>

<style></style>