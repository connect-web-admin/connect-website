<script setup>
import { computed } from 'vue';
const props = defineProps({
    matchInfo: {
        type: Array,
        required: true
    }
});

const formattedData = computed(() => {
    const result = {};

    props.matchInfo.forEach(championship => {
        // matchesをround_idの昇順でソート
        const sortedMatches = Object.fromEntries(
            Object.entries(championship.matches).sort(([, a], [, b]) => a.round_id.localeCompare(b.round_id))
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

    // matches内のmatch_idで昇順ソート
    Object.values(sorted).forEach(championships => {
        championships.forEach(championship => {
            Object.keys(championship.matches).forEach(matchKey => {
                championship.matches[matchKey] = Object.fromEntries(
                    Object.entries(championship.matches[matchKey]).sort(([, a], [, b]) => a.match_id.localeCompare(b.match_id))
                );
                // round_idを削除
                delete championship.matches[matchKey].round_id;
            });
        });
    });

    return sorted;
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}(${dayNames[date.getDay()]})`;
};
</script>
<template>
    <div>
        <div v-for="(championships, date) in sortedFormattedData" :key="date">
            <div class="border-b-1 border-black mt-4">
                <h3 class="bg-black text-white w-fit px-2">{{ formatDate(date) }}</h3>
            </div>
            <div v-for="(championship, index) in championships" :key="index">
                <div v-for="(matches, matchesKey) in championship.matches" :key="matchesKey">
                    <div v-for="(match, matchKey) in matches" :key="matchKey"
                        class="text-center border-b-1 border-gray-300 pt-1 pb-2">
                        <div v-if="matchKey !== 'round_id'">
                            <p class="text-sm">
                                {{ championship.championship_name }}<br />
                                {{ matchesKey }}&nbsp;&nbsp;{{ matchKey }}
                            </p>
                            <div>
                                <div v-if="match['game_status'] === '試合前'"
                                    class="flex flex-row justify-center items-center text-lg">
                                    <div class="w-2/5 text-right">
                                        {{ match['home_club']['club_name'] }}
                                    </div>
                                    <div v class="w-1/5 text-2xl">
                                        {{ match['scheduled_match_start_time'] }}
                                    </div>
                                    <div class="w-2/5 text-left">
                                        {{ match['away_club']['club_name'] }}
                                    </div>
                                </div>
                                <div v-else class="flex flex-row justify-center items-center text-lg">
                                    <div class="w-2/5 text-right">
                                        {{ match['home_club']['club_name'] }}
                                    </div>
                                    <div class="w-1/5 text-2xl">
                                        {{ match['home_club']['final_score'] }} - {{ match['away_club']['final_score'] }}
                                        <p v-if="match['has_pk']" class="text-red-600 text-[18px]">{{
                                            match['home_club']['pk_score'] }} PK {{ match['away_club']['pk_score'] }}</p>
                                    </div>
                                    <div class="w-2/5 text-left">
                                        {{ match['away_club']['club_name'] }}
                                    </div>
                                </div>
                            </div>
                            <p>
                                <span v-if="match['game_status'] === '試合前'" class="text-blue-400">{{
                                    match['game_status']
                                }}</span>
                                <span v-else-if="match['game_status'] === '試合終了'" class="text-green-600">{{
                                    match['game_status'] }}</span>
                                <span v-else class="text-red-600">{{ match['game_status'] }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>