<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { MATCH_API_URL, THIS_FISCAL_YEAR } from "@/utils/constants";
import { useRoute } from "vue-router";

const matchInfo = ref({});
const targetMatchInfo = ref({});
const isLoading = ref(false);
const route = useRoute();

/**
 * route.params.matchIdと同じmatch_idを持つ試合情報を取得
 */
const targetMatch = computed(() => {
    if (!matchInfo.value.matches) return null;
    
    for (const blockKey in matchInfo.value.matches) {
        const block = matchInfo.value.matches[blockKey];
        for (const matchKey in block) {
            if (matchKey === 'round_id') continue; // round_idはスキップ
            
            const match = block[matchKey];
            if (match.match_id === route.params.matchId) {
                return {
                    blockKey,
                    matchKey,
                    matchDetail: match
                };
            }
        }
    }
    
    return null;
});

/**
 * アクセス日から次の月曜日までに開催予定の試合を取得
 */
const getTargetChampionship = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${MATCH_API_URL}/target-championship`);
    queryUrl.searchParams.append("championshipId", route.params.championshipId);
    queryUrl.searchParams.append("fiscalYear", THIS_FISCAL_YEAR);

    try {
        const response = await fetch(queryUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        matchInfo.value = await response.json();
        // console.log('matchInfo', matchInfo.value);
        // console.log('targetMatch', targetMatch.value);
        
    } catch (error) {
        console.error("速報対象試合の取得に失敗しました。");
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await getTargetChampionship();
});
</script>

<template>
    <div class="p-2">
        <div class="flex flex-col justify-between items-center">
            <div
                v-if="isLoading"
                class="flex justify-center items-center mt-10"
            >
                <img
                    src="../assets/icons/loading.gif"
                    alt="loading"
                    class="w-10 h-10"
                />
            </div>

            <div v-else>
                <p class="text-sm text-red-500">
                    会場の状況や天候により、定刻通りの速報とならない場合があります。
                </p>

                <h1 class="text-lg font-bold">
                    {{ matchInfo.championship_name }}
                </h1>

                <div v-if="targetMatch" class="text-center">
                    <h2 class="text-center bg-amber-200 font-normal h-5">
                        {{ targetMatch.blockKey }} - {{ targetMatch.matchKey }}
                    </h2>

                    <div class="my-1 rounded-md p-2">
                        <div class="text-center text-sm leading-[15px]">
                            試合日：{{ targetMatch.matchDetail.match_date }}<br />
                            会場：{{ targetMatch.matchDetail.venue }}<br />
                            {{ targetMatch.matchKey }}
                        </div>

                        <div
                            v-if="targetMatch.matchDetail.game_status === '試合終了'"
                            class="text-center text-sm leading-[15px]"
                        >
                            試合開始時刻：{{
                                targetMatch.matchDetail.scheduled_match_start_time
                            }}
                        </div>

                        <div
                            class="grid grid-cols-3 items-center text-base font-normal my-1"
                        >
                            <span
                                class="text-right whitespace-normal break-words"
                            >
                                {{ targetMatch.matchDetail.home_club.club_name }}
                            </span>

                            <div
                                v-if="targetMatch.matchDetail.game_status === '試合前'"
                                class="text-center text-2xl"
                            >
                                {{ targetMatch.matchDetail.scheduled_match_start_time }}
                            </div>

                            <div v-else class="text-center">
                                <p>
                                    {{
                                        targetMatch.matchDetail.home_club
                                            .first_half_score
                                    }}
                                    前半
                                    {{
                                        targetMatch.matchDetail.away_club
                                            .first_half_score
                                    }}
                                </p>

                                <p>
                                    {{
                                        targetMatch.matchDetail.home_club
                                            .second_half_score
                                    }}
                                    後半
                                    {{
                                        targetMatch.matchDetail.away_club
                                            .second_half_score
                                    }}
                                </p>

                                <div v-if="targetMatch.matchDetail.has_extra_halves">
                                    <p>
                                        {{
                                            targetMatch.matchDetail.home_club
                                                .extra_first_half_score
                                        }}
                                        延長前半
                                        {{
                                            targetMatch.matchDetail.away_club
                                                .extra_first_half_score
                                        }}
                                    </p>

                                    <p>
                                        {{
                                            targetMatch.matchDetail.home_club
                                                .extra_second_half_score
                                        }}
                                        延長後半
                                        {{
                                            targetMatch.matchDetail.away_club
                                                .extra_second_half_score
                                        }}
                                    </p>
                                </div>

                                <p class="font-bold">
                                    {{ targetMatch.matchDetail.home_club.final_score }}
                                    合計
                                    {{ targetMatch.matchDetail.away_club.final_score }}
                                </p>

                                <div v-if="targetMatch.matchDetail.has_pk">
                                    <p>
                                        {{ targetMatch.matchDetail.home_club.pk_score }}
                                        PK
                                        {{ targetMatch.matchDetail.away_club.pk_score }}
                                    </p>
                                </div>
                            </div>

                            <span
                                class="text-left whitespace-normal break-words"
                            >
                                {{ targetMatch.matchDetail.away_club.club_name }}
                            </span>
                        </div>

                        <div class="text-center mt-1">
                            <span
                                v-if="targetMatch.matchDetail.game_status === '試合前'"
                                class="text-blue-500 cursor-pointer"
                                >{{ targetMatch.matchDetail.game_status }}</span
                            >

                            <span
                                v-if="
                                    targetMatch.matchDetail.game_status !==
                                        '試合終了' &&
                                    targetMatch.matchDetail.game_status !== '試合前'
                                "
                                class="text-red-500 cursor-pointer"
                                >{{ targetMatch.matchDetail.game_status }}</span
                            >

                            <span
                                v-if="
                                    targetMatch.matchDetail.game_status === '試合終了'
                                "
                                class="text-green-600 cursor-pointer"
                                >{{ targetMatch.matchDetail.game_status }}</span
                            >
                        </div>
                    </div>
                </div>

                <div v-else class="text-center text-gray-500 mt-4">
                    指定された試合が見つかりませんでした。
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>