<script setup>
import { ref, onMounted, watch, computed } from "vue";
import {
    MATCH_API_URL,
    ID_TOKEN_FOR_AUTH,
    THIS_FISCAL_YEAR,
    USER_ATTR_EMAIL,
} from "@/utils/constants";
import { useRoute } from "vue-router";

const matchInfo = ref({});
const noThisWeekMatchesMsg = ref("");
const isLoading = ref(false);
const route = useRoute();

const sortKey = ref("match_date");
const sortOrder = ref("asc");

const sortedMatches = computed(() => {
    const result = {};

    // divisionKeyでソートする場合
    if (sortKey.value === "division") {
        const sortedDivisions = Object.entries(matchInfo.value.matches || {}).sort(
            ([a], [b]) => {
                if (sortOrder.value === "asc") {
                    return a.localeCompare(b, "ja");
                } else {
                    return b.localeCompare(a, "ja");
                }
            }
        );

        sortedDivisions.forEach(([divisionKey, matches]) => {
            result[divisionKey] = matches;
        });
        return result;
    }

    // その他のソートキーの場合
    Object.entries(matchInfo.value.matches || {}).forEach(
        ([divisionKey, matches]) => {
            const sortedDivisionMatches = Object.entries(matches).sort(
                ([, a], [, b]) => {
                    const aValue = a[sortKey.value];
                    const bValue = b[sortKey.value];

                    if (sortOrder.value === "asc") {
                        return aValue.localeCompare(bValue, "ja");
                    } else {
                        return bValue.localeCompare(aValue, "ja");
                    }
                }
            );

            result[divisionKey] = Object.fromEntries(sortedDivisionMatches);
        }
    );

    return result;
});

/**
 * アクセス日から次の月曜日までに開催予定の試合を取得（火曜日始まり月曜終わり）
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
        Object.values(matchInfo.value.matches).forEach((dept) => {
            delete dept.round_id;
        });

        // 日本時間で現在時刻を取得
        const today = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
        );
        const dayOfWeek = today.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日

        // 直近の過去の火曜日を計算（日本時間）
        const lastTuesday = new Date(today);
        const daysToLastTuesday = (dayOfWeek + 5) % 7; // 火曜日までの日数を計算
        lastTuesday.setDate(today.getDate() - daysToLastTuesday);
        lastTuesday.setHours(0, 0, 0, 0);

        // 直近の未来の月曜日を計算（日本時間）
        const nextMonday = new Date(today);
        const daysToNextMonday = (8 - dayOfWeek) % 7; // 次の月曜日までの日数を計算
        nextMonday.setDate(today.getDate() + daysToNextMonday);
        nextMonday.setHours(23, 59, 59, 999);

        // 期間外の試合を削除
        for (const [dateKey, matches] of Object.entries(
            matchInfo.value.matches
        )) {
            for (const [matchKey, match] of Object.entries(matches)) {
                // 試合日を日本時間で解析
                const matchDate = new Date(
                    new Date(match.match_date).toLocaleString("en-US", {
                        timeZone: "Asia/Tokyo",
                    })
                );
                if (matchDate < lastTuesday || matchDate > nextMonday) {
                    delete matches[matchKey];
                }
            }
            // 空のオブジェクトを削除
            if (Object.keys(matches).length === 0) {
                delete matchInfo.value.matches[dateKey];
            }
        }
    } catch (error) {
        console.error("速報対象試合の取得に失敗しました。");
    } finally {
        isLoading.value = false;
    }
};

const getGlobalIndex = (divisionKey, localIndex) => {
    let globalIndex = 0;
    for (const [key, matches] of Object.entries(sortedMatches.value)) {
        if (key === divisionKey) {
            return globalIndex + localIndex;
        }
        globalIndex += Object.keys(matches).length;
    }
    return globalIndex;
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
                <h1 class="text-lg font-bold">
                    {{ matchInfo.championship_name }}
                </h1>
                <div
                    class="flex flex-col gap-2 border-1 border-gray-300 rounded-md py-1 px-3 my-4"
                >
                    <div class="flex flex-row gap-3 items-center">
                        <span>表示順</span>
                        <select
                            v-model="sortOrder"
                            class="border border-gray-300 rounded px-1 py-0.5 text-sm ml-2"
                        >
                            <option value="asc">昇順</option>
                            <option value="desc">降順</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <label class="flex items-center gap-2">
                            <input
                                type="radio"
                                v-model="sortKey"
                                value="division"
                                class="w-4 h-4"
                            />
                            <span>試合日/節/ブロック等</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input
                                type="radio"
                                v-model="sortKey"
                                value="scheduled_match_start_time"
                                class="w-4 h-4"
                            />
                            <span>試合開始時刻</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input
                                type="radio"
                                v-model="sortKey"
                                value="venue"
                                class="w-4 h-4"
                            />
                            <span>会場</span>
                        </label>
                    </div>
                </div>
                <div
                    v-for="(divisionMatches, divisionKey) in sortedMatches"
                    :key="divisionKey"
                    class="text-center"
                >
                    <h2 class="text-center bg-amber-200 font-normal h-5">{{ divisionKey }}</h2>

                    <div
                        v-for="(
                            matchDetail, matchKey, index
                        ) in divisionMatches"
                        :key="matchDetail.match_id || matchKey"
                        :class="
                            getGlobalIndex(divisionKey, index) % 2 === 0
                                ? 'bg-blue-50'
                                : ''
                        "
                        class="my-1 rounded-md p-2"
                    >
                        <div v-if="matchDetail.match_id">
                            <div class="text-center text-sm leading-[15px]">
                                試合日：{{ matchDetail.match_date }}
                            </div>
                            <div class="text-center text-sm leading-[15px]">
                                会場：{{ matchDetail.venue }}
                            </div>
                            <div
                                v-if="matchDetail.game_status === '試合終了'"
                                class="text-center text-sm leading-[15px]"
                            >
                                試合開始時刻：{{
                                    matchDetail.scheduled_match_start_time
                                }}
                            </div>
                            <div
                                class="grid grid-cols-3 items-center text-base font-normal my-1"
                            >
                                <span
                                    class="text-right whitespace-normal break-words"
                                >
                                    {{ matchDetail.home_club.club_name }}
                                </span>
                                <div
                                    v-if="matchDetail.game_status === '試合前'"
                                    class="text-center text-2xl"
                                >
                                    {{ matchDetail.scheduled_match_start_time }}
                                </div>
                                <div v-else class="text-center">
                                    <p>
                                        {{
                                            matchDetail.home_club
                                                .first_half_score
                                        }}
                                        前半
                                        {{
                                            matchDetail.away_club
                                                .first_half_score
                                        }}
                                    </p>
                                    <p>
                                        {{
                                            matchDetail.home_club
                                                .second_half_score
                                        }}
                                        後半
                                        {{
                                            matchDetail.away_club
                                                .second_half_score
                                        }}
                                    </p>
                                    <div v-if="matchDetail.has_extra_halves">
                                        <p>
                                            {{
                                                matchDetail.home_club
                                                    .extra_first_half_score
                                            }}
                                            延長前半
                                            {{
                                                matchDetail.away_club
                                                    .extra_first_half_score
                                            }}
                                        </p>
                                        <p>
                                            {{
                                                matchDetail.home_club
                                                    .extra_second_half_score
                                            }}
                                            延長後半
                                            {{
                                                matchDetail.away_club
                                                    .extra_second_half_score
                                            }}
                                        </p>
                                    </div>
                                    <p class="font-bold">
                                        {{
                                            matchDetail.home_club.final_score
                                        }}
                                        合計
                                        {{ matchDetail.away_club.final_score }}
                                    </p>
                                    <div v-if="matchDetail.has_pk">
                                        <p>
                                            {{
                                                matchDetail.home_club.pk_score
                                            }}
                                            PK
                                            {{
                                                matchDetail.away_club.pk_score
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    class="text-left whitespace-normal break-words"
                                >
                                    {{ matchDetail.away_club.club_name }}
                                </span>
                            </div>
                            <div class="text-center mt-1">
                                <span
                                    v-if="matchDetail.game_status === '試合前'"
                                    class="text-blue-500 cursor-pointer"
                                    >{{ matchDetail.game_status }}</span
                                >
                                <span
                                    v-if="
                                        matchDetail.game_status !== '試合終了' &&
                                        matchDetail.game_status !== '試合前'
                                    "
                                    class="text-red-500 cursor-pointer"
                                    >{{ matchDetail.game_status }}</span
                                >
                                <span
                                    v-if="
                                        matchDetail.game_status === '試合終了'
                                    "
                                    class="text-green-600 cursor-pointer"
                                    >{{ matchDetail.game_status }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
