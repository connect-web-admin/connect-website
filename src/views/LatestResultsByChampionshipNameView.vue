<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { MATCH_API_URL, THIS_FISCAL_YEAR } from "@/utils/constants";
import { useRoute } from "vue-router";

const matchInfo = ref({});
const isLoading = ref(false);
const route = useRoute();
const sortKey = ref("date_and_time");
const sortOrder = ref("asc");

/**
 * 日本時間で現在の火曜日から次の月曜日までの期間を取得
 */
const getDateRange = () => {
    // 日本時間で現在の日時を取得
    const now = new Date();
    const jstOffset = 9 * 60; // 日本時間のオフセット（分）
    const utcOffset = now.getTimezoneOffset(); // ローカル時間のオフセット（分）
    const totalOffset = jstOffset + utcOffset;
    const today = new Date(now.getTime() + totalOffset * 60 * 1000);
    
    const dayOfWeek = today.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日

    // 直近の過去の火曜日を計算
    const lastTuesday = new Date(today);
    const daysToLastTuesday = (dayOfWeek + 5) % 7; // 火曜日までの日数を計算
    if (daysToLastTuesday === 0) {
        // 今日が火曜日の場合、今日を直近の火曜日とする
        lastTuesday.setHours(0, 0, 0, 0);
    } else {
        // 今日が火曜日以外の場合、直近の過去の火曜日を計算
        lastTuesday.setDate(today.getDate() - daysToLastTuesday);
        lastTuesday.setHours(0, 0, 0, 0);
    }

    // 直近の未来の月曜日を計算
    const nextMonday = new Date(today);
    const daysToNextMonday = (8 - dayOfWeek) % 7; // 月曜日までの日数を計算
    if (daysToNextMonday === 0) {
        // 今日が月曜日の場合、今日を直近の月曜日とする
        nextMonday.setHours(23, 59, 59, 999);
    } else {
        // 今日が月曜日以外の場合、直近の未来の月曜日を計算
        nextMonday.setDate(today.getDate() + daysToNextMonday);
        nextMonday.setHours(23, 59, 59, 999);
    }

    return { lastTuesday, nextMonday };
};

/**
 * round_idを削除する処理
 */
const removeRoundIds = (matches) => {
    const result = {};
    Object.entries(matches).forEach(([division, divisionMatches]) => {
        const newDivisionMatches = { ...divisionMatches };
        if (newDivisionMatches.round_id) {
            delete newDivisionMatches.round_id;
        }
        result[division] = newDivisionMatches;
    });
    return result;
};

/**
 * 指定した日付範囲内の試合のみを抽出
 */
const filterMatchesByDateRange = (matches, startDate, endDate) => {
    const result = {};
    
    Object.entries(matches).forEach(([division, divisionMatches]) => {
        const filteredDivisionMatches = {};

        Object.entries(divisionMatches).forEach(([key, match]) => {
            if (key === 'round_id') {
                filteredDivisionMatches[key] = match;
                return;
            }
            
            // 試合日付を日本時間で比較
            const matchDate = new Date(match.match_date);
            matchDate.setHours(0, 0, 0, 0);
            
            if (matchDate >= startDate && matchDate <= endDate) {
                filteredDivisionMatches[key] = match;
            }
        });
        
        // round_id以外の実際の試合データが存在するかチェック	if (Object.keys(filteredDivisionMatches).length > 0) {
        const matchKeys = Object.keys(filteredDivisionMatches).filter(key => key !== 'round_id');	
        if (matchKeys.length > 0) {
            result[division] = filteredDivisionMatches;
        }
    });

    return result;
};

/**
 * 試合を指定したキーと順序で並び替え
 */
const sortMatches = (matches, key, order) => {
    const result = {};
    
    Object.entries(matches).forEach(([division, divisionMatches]) => {
        // round_idを保存
        const roundId = divisionMatches.round_id;
        
        // 試合を並び替え
        const sortedMatches = Object.entries(divisionMatches)
            .filter(([matchKey]) => matchKey !== 'round_id')
            .sort(([, a], [, b]) => {
                if (key === 'date_and_time') {
                    const dateA = new Date(a.match_date);
                    const dateB = new Date(b.match_date);
                    if (dateA.getTime() === dateB.getTime()) {
                        return order === 'asc' 
                            ? a.scheduled_match_start_time.localeCompare(b.scheduled_match_start_time)
                            : b.scheduled_match_start_time.localeCompare(a.scheduled_match_start_time);
                    }
                    return order === 'asc'
                        ? dateA.getTime() - dateB.getTime()
                        : dateB.getTime() - dateA.getTime();
                } else if (key === 'scheduled_match_start_time') {
                    return order === 'asc'
                        ? a.scheduled_match_start_time.localeCompare(b.scheduled_match_start_time)
                        : b.scheduled_match_start_time.localeCompare(a.scheduled_match_start_time);
                }
                return 0;
            });

        // 並び替えた結果を新しいオブジェクトに格納
        const sortedDivisionMatches = {};
        
        // round_idを最初に追加
        if (roundId) {
            sortedDivisionMatches.round_id = roundId;
        }
        
        // ソートされた試合を追加
        sortedMatches.forEach(([matchKey, match]) => {
            sortedDivisionMatches[matchKey] = match;
        });

        result[division] = sortedDivisionMatches;
    });

    return result;
};

/**
 * divisionをround_idの値を使って昇順に並び替え
 */
const sortDivisions = (matches) => {
    const sortedResult = {};
    const sortedDivisionKeys = Object.keys(matches).sort((a, b) => {
        const aRoundId = matches[a].round_id;
        const bRoundId = matches[b].round_id;
        
        if (aRoundId && bRoundId) {
            // round_idの値を使って比較
            return aRoundId.localeCompare(bRoundId);
        }
        
        // round_idがない場合は元の方法で比較
        const aMatch = a.match(/(\d+)/);
        const bMatch = b.match(/(\d+)/);
        
        if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        
        // 数値が見つからない場合は文字列として比較
        return a.localeCompare(b);
    });
    
    sortedDivisionKeys.forEach(key => {
        sortedResult[key] = matches[key];
    });

    return sortedResult;
};

/**
 * 直近の過去の火曜日から直近の未来の月曜日まで（つまり火曜日始まり月曜日終わり）の試合を抽出
 */
const filteredMatches = computed(() => {
    if (!matchInfo.value.matches) return {};

    // 日付範囲を取得
    const { lastTuesday, nextMonday } = getDateRange();

    // 日付範囲でフィルタリング
    let result = filterMatchesByDateRange(matchInfo.value.matches, lastTuesday, nextMonday);

    // 試合を並び替え
    result = sortMatches(result, sortKey.value, sortOrder.value);

    // divisionを並び替え（round_idを使用）
    result = sortDivisions(result);
    
    // デバッグ用ログ
    // console.log('sortKey:', sortKey.value, 'sortOrder:', sortOrder.value);
    // console.log('sorted result:', result);
    
    // round_idを削除
    result = removeRoundIds(result);

    return result;
});

/**
 * 表示用にソート済み配列に変換したマッチ情報
 */
const sortedMatchesForDisplay = computed(() => {
    const result = [];
    
    Object.entries(filteredMatches.value).forEach(([divisionKey, divisionMatches]) => {
        if (divisionKey === 'match_dates') return;
        
        // 試合をソートして配列に変換
        const matchArray = Object.entries(divisionMatches)
            .filter(([matchKey]) => matchKey !== 'round_id')
            .map(([matchKey, matchDetail]) => ({
                matchKey,
                matchDetail
            }))
            .sort((a, b) => {
                if (sortKey.value === 'date_and_time') {
                    const dateA = new Date(a.matchDetail.match_date);
                    const dateB = new Date(b.matchDetail.match_date);
                    if (dateA.getTime() === dateB.getTime()) {
                        return sortOrder.value === 'asc' 
                            ? a.matchDetail.scheduled_match_start_time.localeCompare(b.matchDetail.scheduled_match_start_time)
                            : b.matchDetail.scheduled_match_start_time.localeCompare(a.matchDetail.scheduled_match_start_time);
                    }
                    return sortOrder.value === 'asc'
                        ? dateA.getTime() - dateB.getTime()
                        : dateB.getTime() - dateA.getTime();
                } else if (sortKey.value === 'scheduled_match_start_time') {
                    return sortOrder.value === 'asc'
                        ? a.matchDetail.scheduled_match_start_time.localeCompare(b.matchDetail.scheduled_match_start_time)
                        : b.matchDetail.scheduled_match_start_time.localeCompare(a.matchDetail.scheduled_match_start_time);
                }
                return 0;
            });
        
        result.push({
            divisionKey,
            matches: matchArray
        });
    });
    
    return result;
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

                <!-- <div
                    class="flex flex-col gap-2 border-1 border-gray-300 rounded-md py-1 px-3 my-4"
                >
                    <div class="flex flex-row gap-3 items-center">
                        <span>表示順</span>
                        <select
                            v-model="sortOrder"
                            class="border border-gray-300 rounded px-1 py-0.5 text-sm ml-2"
                        >
                            <option value="asc">早い順</option>
                            <option value="desc">遅い順</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <label
                            class="flex items-center gap-2"
                            for="sort-by-date-and-time"
                        >
                            <input
                                type="radio"
                                v-model="sortKey"
                                value="date_and_time"
                                class="w-4 h-4"
                                id="sort-by-date-and-time"
                            />

                            <span>試合日時</span>
                        </label>

                        <label
                            class="flex items-center gap-2"
                            for="sort-by-time"
                        >
                            <input
                                type="radio"
                                v-model="sortKey"
                                value="scheduled_match_start_time"
                                class="w-4 h-4"
                                id="sort-by-time"
                            />

                            <span>試合開始時刻</span>
                        </label>
                    </div>
                </div> -->

                <div
                    v-for="division in sortedMatchesForDisplay"
                    :key="division.divisionKey"
                    class="text-center"
                >
                    <h2
                        class="text-center bg-amber-200 font-normal h-5"
                    >
                        {{ division.divisionKey }}
                    </h2>

                    <div
                        v-for="(match, index) in division.matches"
                        :key="match.matchDetail.match_id || match.matchKey"
                        class="my-1 rounded-md p-2"
                        :class="{ 'bg-blue-50': index % 2 === 1 }"
                    >
                        <div v-if="match.matchDetail.match_id">
                            <div class="text-center text-sm leading-[15px]">
                                試合日：{{ match.matchDetail.match_date }}<br />
                                会場：{{ match.matchDetail.venue }}<br />
                                {{ match.matchKey }}
                            </div>

                            <div
                                v-if="match.matchDetail.game_status === '試合終了'"
                                class="text-center text-sm leading-[15px]"
                            >
                                試合開始時刻：{{
                                    match.matchDetail.scheduled_match_start_time
                                }}
                            </div>

                            <div
                                class="grid grid-cols-3 items-center text-base font-normal my-1"
                            >
                                <span
                                    class="text-right whitespace-normal break-words"
                                >
                                    {{ match.matchDetail.home_club.club_name }}
                                </span>

                                <div
                                    v-if="match.matchDetail.game_status === '試合前'"
                                    class="text-center text-2xl"
                                >
                                    {{ match.matchDetail.scheduled_match_start_time }}
                                </div>

                                <div v-else class="text-center">
                                    <p>
                                        {{
                                            match.matchDetail.home_club
                                                .first_half_score
                                        }}
                                        前半
                                        {{
                                            match.matchDetail.away_club
                                                .first_half_score
                                        }}
                                    </p>

                                    <p>
                                        {{
                                            match.matchDetail.home_club
                                                .second_half_score
                                        }}
                                        後半
                                        {{
                                            match.matchDetail.away_club
                                                .second_half_score
                                        }}
                                    </p>

                                    <div v-if="match.matchDetail.has_extra_halves">
                                        <p>
                                            {{
                                                match.matchDetail.home_club
                                                    .extra_first_half_score
                                            }}
                                            延長前半
                                            {{
                                                match.matchDetail.away_club
                                                    .extra_first_half_score
                                            }}
                                        </p>

                                        <p>
                                            {{
                                                match.matchDetail.home_club
                                                    .extra_second_half_score
                                            }}
                                            延長後半
                                            {{
                                                match.matchDetail.away_club
                                                    .extra_second_half_score
                                            }}
                                        </p>
                                    </div>

                                    <p class="font-bold">
                                        {{ match.matchDetail.home_club.final_score }}
                                        合計
                                        {{ match.matchDetail.away_club.final_score }}
                                    </p>

                                    <div v-if="match.matchDetail.has_pk">
                                        <p>
                                            {{ match.matchDetail.home_club.pk_score }}
                                            PK
                                            {{ match.matchDetail.away_club.pk_score }}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    class="text-left whitespace-normal break-words"
                                >
                                    {{ match.matchDetail.away_club.club_name }}
                                </span>
                            </div>

                            <div class="text-center mt-1">
                                <span
                                    v-if="match.matchDetail.game_status === '試合前'"
                                    class="text-blue-500 cursor-pointer"
                                    >{{ match.matchDetail.game_status }}</span
                                >

                                <span
                                    v-if="
                                        match.matchDetail.game_status !==
                                            '試合終了' &&
                                        match.matchDetail.game_status !== '試合前'
                                    "
                                    class="text-red-500 cursor-pointer"
                                    >{{ match.matchDetail.game_status }}</span
                                >

                                <span
                                    v-if="
                                        match.matchDetail.game_status === '試合終了'
                                    "
                                    class="text-green-600 cursor-pointer"
                                    >{{ match.matchDetail.game_status }}</span
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