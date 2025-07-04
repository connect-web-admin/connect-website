<script setup>
import { ref, onMounted, computed } from 'vue';
import { MATCH_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';

const isLoading = ref(false);
const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');

/**
 * アクセス日から次の日曜日までに開催予定の試合を取得
 */
const getMatchesInThisWeek = async () => {
    isLoading.value = true;
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

const formattedData = computed(() => {
    const result = {};

    matchInfo.value.forEach(championship => {
        // matchesをround_idの昇順でソート
        const sortedMatches = Object.fromEntries(
            Object.entries(championship.matches).sort(([, a], [, b]) => {
                const roundIdA = a.round_id || '';
                const roundIdB = b.round_id || '';
                return roundIdA.localeCompare(roundIdB);
            })
        );

        Object.entries(sortedMatches).forEach(([matchKey, orders]) => {
            const round_id = orders.round_id;
            Object.entries(orders).forEach(([orderKey, match]) => {
                if (orderKey === 'round_id') return; // round_idは無視
                const date = match?.match_date;
                if (!date) return; // dateがundefinedの場合スキップ

                if (!result[date]) {
                    result[date] = [];
                }

                let championshipEntry = result[date].find(t => t.championship_name === championship.championship_name);
                if (!championshipEntry) {
                    championshipEntry = {
                        fiscal_year: championship.fiscal_year,
                        championship_name: championship.championship_name,
                        matches: {}
                    };
                    result[date].push(championshipEntry);
                }

                if (!championshipEntry.matches[matchKey]) {
                    championshipEntry.matches[matchKey] = { round_id };
                }

                championshipEntry.matches[matchKey][orderKey] = { ...match };
            });
        });
    });

    return Object.fromEntries(
        Object.entries(result).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    );
});

const sortedFormattedData = computed(() => {
    const sorted = JSON.parse(JSON.stringify(formattedData.value));
    const result = {};

    // 日付ごとに全ての試合をフラット化
    Object.entries(sorted).forEach(([date, championships]) => {
        const flattenedMatches = [];
        
        championships.forEach(championship => {
            Object.entries(championship.matches).forEach(([matchKey, matches]) => {
                Object.entries(matches).forEach(([key, match]) => {
                    if (key !== 'round_id') {
                        flattenedMatches.push({
                            venue: match.venue,
                            access_token: match.access_token,
                            home_club: match.home_club.club_name,
                            away_club: match.away_club.club_name,
                            match_category: match.match_category,
                            match_id: match.match_id,
                            scheduled_match_start_time: match.scheduled_match_start_time
                        });
                    }
                });
            });
        });

        // access_tokenでソート
        flattenedMatches.sort((a, b) => (a.access_token || '').localeCompare(b.access_token || ''));
        
        result[date] = flattenedMatches;
    });

    return result;
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}(${dayNames[date.getDay()]})`;
};

onMounted(() => {
    getMatchesInThisWeek();
});
</script>

<template>
    <div>
        <div v-if="isLoading">
            <div class="flex justify-center items-center h-screen">
                <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            </div>
        </div>
        <div v-else>
            <div v-for="(matches, date) in sortedFormattedData" :key="date" :data-date="date">
                <div class="border-b-1 border-black mt-4">
                    <h3 class="bg-black text-white w-fit px-2">{{ formatDate(date) }}</h3>
                </div>
                <div v-for="(match, index) in matches" :key="index" class="p-2 border-b">
                    <div>
                        <p class="text-sm mb-1">種別：{{ match.match_category }}</p>
                        <p class="text-sm mb-1">定刻：{{ match.scheduled_match_start_time }}</p>
                        <p class="text-sm mb-1">対戦カード：{{ match.home_club }} vs {{ match.away_club }}</p>
                        <p class="text-sm">試合会場：{{ match.venue }}</p>
                        <p>アクセストークン：<span class="text-red-600">{{ match.access_token }}</span></p>
                        <p class="text-sm">マッチID：{{ match.match_id }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>