<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const props = defineProps({
    matchInfo: {
        type: Array,
        required: true,
    },
});

const categoryMap = {
    "U-12": "U-12（ジュニア）",
    "U-15": "U-15（ジュニアユース）",
    "U-18": "U-18（ユース）",
    WOMAN: "WOMAN",
};

const selectedCategory = ref("");
const sortKey = ref("match_date");
const sortOrder = ref("desc");

onMounted(() => {
    if (route.query.match_category && categoryMap[route.query.match_category]) {
        selectedCategory.value = route.query.match_category;
    }
});

watch(
    () => route.query.match_category,
    (newVal) => {
        if (newVal && categoryMap[newVal]) {
            selectedCategory.value = newVal;
        }
    }
);

const filteredMatches = computed(() => {
    if (!selectedCategory.value) return props.matchInfo;
    const realCategory = categoryMap[selectedCategory.value];
    return props.matchInfo.filter((match) => {
        return match.category === realCategory;
    });
});

const displayMatches = computed(() => {
    const result = [];
    filteredMatches.value.forEach((championship) => {
        if (!championship.matches) return;
        Object.entries(championship.matches).forEach(
            ([roundKey, roundValue]) => {
                if (typeof roundValue !== "object" || roundKey === "round_id")
                    return;
                Object.entries(roundValue).forEach(([matchKey, matchValue]) => {
                    if (
                        typeof matchValue !== "object" ||
                        matchKey === "round_id"
                    )
                        return;
                    result.push({
                        championship_name: championship.championship_name || "",
                        round_name: roundKey,
                        match_name: matchKey,
                        venue: matchValue.venue || "",
                        home_club: matchValue.home_club?.club_name || "",
                        away_club: matchValue.away_club?.club_name || "",
                        actual_match_start_time:
                            matchValue.actual_match_start_time || "",
                        scheduled_match_start_time:
                            matchValue.scheduled_match_start_time || "",
                        game_status: matchValue.game_status || "",
                        home_club_info: matchValue.home_club || {},
                        away_club_info: matchValue.away_club || {},
                        has_extra_halves: matchValue.has_extra_halves || false,
                        has_pk: matchValue.has_pk || false,
                        match_date: matchValue.match_date || "",
                    });
                });
            }
        );
    });
    // ソート処理
    const sorted = result.sort((a, b) => {
        let comp = 0;
        if (sortKey.value === "scheduled_match_start_time") {
            if (!a.scheduled_match_start_time) return 1;
            if (!b.scheduled_match_start_time) return -1;
            comp = a.scheduled_match_start_time.localeCompare(
                b.scheduled_match_start_time
            );
        } else if (sortKey.value === "match_date") {
            comp = a.match_date.localeCompare(b.match_date);
        } else if (sortKey.value === "venue") {
            comp = a.venue.localeCompare(b.venue);
        } else {
            comp = a.championship_name.localeCompare(b.championship_name);
        }
        return sortOrder.value === "asc" ? comp : -comp;
    });
    return sorted;
});
</script>
<template>
    <div class="break-all">
        <div
            class="flex flex-col gap-2 border-1 border-gray-300 rounded-md py-1 px-3 my-4"
        >
            表示種別
            <div class="flex flex-row gap-3">
                <label class="flex items-center gap-2">
                    <input
                        type="radio"
                        v-model="selectedCategory"
                        value="U-12"
                        class="w-4 h-4"
                    />
                    <span>U-12</span>
                </label>
                <label class="flex items-center gap-2">
                    <input
                        type="radio"
                        v-model="selectedCategory"
                        value="U-15"
                        class="w-4 h-4"
                    />
                    <span>U-15</span>
                </label>
                <label class="flex items-center gap-2">
                    <input
                        type="radio"
                        v-model="selectedCategory"
                        value="U-18"
                        class="w-4 h-4"
                    />
                    <span>U-18</span>
                </label>
                <label class="flex items-center gap-2">
                    <input
                        type="radio"
                        v-model="selectedCategory"
                        value="WOMAN"
                        class="w-4 h-4"
                    />
                    <span>WOMAN</span>
                </label>
            </div>
        </div>
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
                        value="championship_name"
                        class="w-4 h-4"
                    />
                    <span>大会</span>
                </label>
                <label class="flex items-center gap-2">
                    <input
                        type="radio"
                        v-model="sortKey"
                        value="match_date"
                        class="w-4 h-4"
                    />
                    <span>試合日</span>
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
            v-for="(match, index) in displayMatches"
            :key="match.championship_name + match.round_name + match.match_name"
            :class="index % 2 === 0 ? 'bg-blue-50' : ''"
            class="my-1 rounded-md p-2"
        >
            <div class="text-center text-sm leading-[15px]">
                {{ match.championship_name }}
            </div>
            <div class="text-center text-sm">
                {{ match.round_name }} {{ match.match_name }}
            </div>
            <div class="text-center text-sm mb-1">
                試合日：{{ match.match_date }}
            </div>
            <div class="text-center text-sm mb-1 leading-1">会場：{{ match.venue }}</div>
            <div v-if="match.game_status === '試合終了'" class="text-center text-sm mb-1">試合開始時刻：{{ match.actual_match_start_time }}</div>
            <div
                class="grid grid-cols-3 items-center text-base font-normal mt-4"
            >
                <span class="text-right whitespace-normal break-words">{{
                    match.home_club
                }}</span>
                <span
                    v-if="match.game_status === '試合前'"
                    class="text-center text-lg font-bold"
                    >{{ match.scheduled_match_start_time }}</span
                >
                <div v-if="match.game_status !== '試合前'" class="text-center">
                    <p>
                        {{ match.home_club_info.first_half_score }} 前半
                        {{ match.away_club_info.first_half_score }}
                    </p>
                    <p>
                        {{ match.home_club_info.second_half_score }} 後半
                        {{ match.away_club_info.second_half_score }}
                    </p>
                    <div v-if="match.has_extra_halves">
                        <p>
                            {{ match.home_club_info.extra_first_half_score }}
                            延長前半
                            {{ match.away_club_info.extra_first_half_score }}
                        </p>
                        <p>
                            {{ match.home_club_info.extra_second_half_score }}
                            延長後半
                            {{ match.away_club_info.extra_second_half_score }}
                        </p>
                    </div>
                    <p class="font-bold">
                        {{ match.home_club_info.final_score }} 合計
                        {{ match.away_club_info.final_score }}
                    </p>
                    <div v-if="match.has_pk" class="font-bold text-red-500">
                        <p>
                            {{ match.home_club_info.pk_score }} PK
                            {{ match.away_club_info.pk_score }}
                        </p>
                    </div>
                </div>

                <span class="text-left whitespace-normal break-words">{{
                    match.away_club
                }}</span>
            </div>
            <div class="text-center mt-1">
                <span
                    v-if="match.game_status === '試合前'"
                    class="text-blue-500 cursor-pointer"
                    >{{ match.game_status }}</span
                >
                <span
                    v-if="match.game_status === '試合終了'"
                    class="text-green-600 cursor-pointer"
                    >{{ match.game_status }}</span
                >
                <span
                    v-if="match.game_status !== '試合前' && match.game_status !== '試合終了'"
                    class="text-red-600 cursor-pointer"
                    >{{ match.game_status }}</span
                >
            </div>
        </div>
    </div>
</template>
<style></style>
