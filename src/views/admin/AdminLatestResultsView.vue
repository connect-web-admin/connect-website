<script setup>
import { ref, onMounted } from 'vue';
import { MATCH_API_URL, THIS_FISCAL_YEAR, USER_ATTR_EMAIL } from '@/utils/constants';
import AdminChampionshipNamesComp from '@/components/admin/AdminChampionshipNamesComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(false);

/**
* アクセス日から次の月曜日までに開催予定の試合を取得（火曜日始まり月曜終わり）
*/
const getMatchesInTwoWeeks = async () => {
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
    await getMatchesInTwoWeeks();
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
                <p class="pl-1 mb-1">
                    ■ 高校総体北海道大会結果→<a href="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/notion/%E5%8C%97%E6%B5%B7%E9%81%93%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A0611_%E7%B5%90%E6%9E%9C.pdf" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">こちら</a>
                </p>
                <p class="text-red-500">星取表作成用の試合結果表示</p>
                <AdminChampionshipNamesComp :match-info="matchInfo" />
            </div>
        </div>
    </div>
</template>

<style></style>