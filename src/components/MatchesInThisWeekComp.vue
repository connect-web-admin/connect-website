<script setup>
import { computed } from "vue";
const props = defineProps({
    matchInfo: {
        type: Array,
        required: true,
    },
});

const formattedData = computed(() => {
    const result = {};

    props.matchInfo.forEach((championship) => {
        // matchesをround_idの昇順でソート
        const sortedMatches = Object.fromEntries(
            Object.entries(championship.matches).sort(([, a], [, b]) => {
                const roundIdA = a?.round_id || "";
                const roundIdB = b?.round_id || "";
                return roundIdA.localeCompare(roundIdB);
            })
        );

        Object.entries(sortedMatches).forEach(([matchKey, orders]) => {
            const round_id = orders.round_id;
            Object.entries(orders).forEach(([orderKey, match]) => {
                if (orderKey === "round_id") return; // round_idは無視
                const date = match?.match_date;
                if (!date) return; // dateがundefinedの場合スキップ

                if (!result[date]) {
                    result[date] = [];
                }

                let championshipEntry = result[date].find(
                    (t) =>
                        t.championship_name === championship.championship_name
                );
                if (!championshipEntry) {
                    championshipEntry = {
                        fiscal_year: championship.fiscal_year,
                        championship_name: championship.championship_name,
                        matches: {},
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
        Object.entries(result).sort(
            ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
        )
    );
});

const sortedFormattedData = computed(() => {
    const sorted = JSON.parse(JSON.stringify(formattedData.value));

    // matches内のmatch_idで昇順ソート
    Object.values(sorted).forEach((championships) => {
        championships.forEach((championship) => {
            Object.keys(championship.matches).forEach((matchKey) => {
                championship.matches[matchKey] = Object.fromEntries(
                    Object.entries(championship.matches[matchKey])
                        .filter(([key]) => key !== "round_id") // round_idは無視
                        .sort(([, a], [, b]) =>
                            a.match_id.localeCompare(b.match_id)
                        )
                );
            });
        });
    });

    return sorted;
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}(${
        dayNames[date.getDay()]
    })`;
};
</script>
<template>
    <div>
        <div v-if="matchInfo.length === 0">
            <p>
                今週の試合情報はありません。または、試合データが更新されていません。
            </p>
        </div>
        <div v-else>
            <div
                v-for="(championships, date) in sortedFormattedData"
                :key="date"
                :data-date="date"
            >
                <div class="border-b-1 border-black mt-4">
                    <h3 class="bg-black text-white w-fit px-2">
                        {{ formatDate(date) }}
                    </h3>
                </div>
                <div
                    v-for="(championship, index) in championships"
                    :key="index"
                    :data-championship="championship.championship_name"
                >
                    <div
                        v-for="(matches, matchesKey) in championship.matches"
                        :key="matchesKey"
                    >
                        <div
                            v-for="(match, matchKey) in matches"
                            :key="matchKey"
                            class="text-center border-b-1 border-gray-300 pt-1 pb-2"
                            :data-match-category="match.match_category"
                        >
                            <div v-if="matchKey !== 'round_id'">
                                <p class="text-sm">
                                    {{ championship.championship_name }}<br />
                                    {{ matchesKey }}&nbsp;&nbsp;{{ matchKey
                                    }}<br />
                                    会場：{{ match.venue }}
                                    <span class="hidden">{{
                                        match.match_category
                                    }}</span>
                                </p>
                                <div>
                                    <div
                                        v-if="match['game_status'] === '試合前'"
                                        class="flex flex-row justify-center items-center text-lg"
                                    >
                                        <div class="w-36/100 text-right">
                                            {{match["home_club"]["club_name"]}}
                                        </div>
                                        <div v class="w-28/100 text-2xl">
                                            {{match["scheduled_match_start_time"]}}
                                        </div>
                                        <div class="w-36/100 text-left">
                                            {{match["away_club"]["club_name"]}}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="flex flex-row justify-center items-center text-lg"
                                    >
                                        <div class="w-2/5 text-right">
                                            {{match["home_club"]["club_name"]}}
                                        </div>
                                        <div class="w-1/5 text-sm">
                                            <p>
                                                {{match["home_club"]["first_half_score"]}}
                                                前半
                                                {{match["away_club"]["first_half_score"]}}
                                            </p>
                                            <p>
                                                {{match["home_club"]["second_half_score"]}}
                                                後半
                                                {{match["away_club"]["second_half_score"]}}
                                            </p>
                                            <div v-if="match['has_extra_halves']">
                                                <p>
                                                    {{match["home_club"]["extra_first_half_score"]}}
                                                    延長前半
                                                    {{match["away_club"]["extra_first_half_score"]}}
                                                </p>
                                                <p>
                                                    {{match["home_club"]["extra_second_half_score"]}}
                                                    延長後半
                                                    {{match["away_club"]["extra_second_half_score"]}}
                                                </p>
                                            </div>
                                            <p class="font-bold ">
                                                {{match["home_club"]["final_score"]}}
                                                合計
                                                {{match["away_club"]["final_score"]}}
                                            </p>
                                            <p
                                                v-if="match['has_pk']"
                                                class="text-red-600 text-[18px]"
                                            >
                                                {{match["home_club"]["pk_score"]}}
                                                PK
                                                {{match["away_club"]["pk_score"]}}
                                            </p>
                                        </div>
                                        <div class="w-2/5 text-left">
                                            {{match["away_club"]["club_name"]}}
                                        </div>
                                    </div>
                                </div>
                                <p>
                                    <span
                                        v-if="match['game_status'] === '試合前'"
                                        class="text-blue-400"
                                        >{{ match["game_status"] }}</span
                                    >
                                    <span
                                        v-else-if="
                                            match['game_status'] === '試合終了'
                                        "
                                        class="text-green-600"
                                        >{{ match["game_status"] }}</span
                                    >
                                    <span v-else class="text-red-600">{{
                                        match["game_status"]
                                    }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
