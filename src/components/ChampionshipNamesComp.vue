<script setup>
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';
import { THIS_FISCAL_YEAR } from '@/utils/constants';

const router = useRouter();
const isLoading = ref(false);
const props = defineProps({
    matchInfo: {
        type: Array,
        required: true,
    },
});

// 今週の日付範囲を取得する関数（直近の過去の金曜日から直近の未来の木曜日）
const getCurrentWeekDates = () => {
    // 日本時間の現在時刻を取得（UTCから9時間加算）
    const now = new Date();
    const today = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9時間
    return getCurrentWeekDatesForYear(today);
};

// 指定された日付を基準にした週の日付範囲を取得する関数
const getCurrentWeekDatesForYear = (baseDate) => {
    const currentDay = baseDate.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
    
    // 直近の過去の金曜日を計算
    let daysToLastFriday;
    if (currentDay === 5) { // 今日が金曜日
        daysToLastFriday = 0;
    } else if (currentDay === 6) { // 今日が土曜日
        daysToLastFriday = 1;
    } else { // 日曜日(0)〜木曜日(4)
        daysToLastFriday = currentDay + 2;
    }
    
    // 直近の未来の木曜日を計算
    let daysToNextThursday;
    if (currentDay === 4) { // 今日が木曜日
        daysToNextThursday = 0;
    } else if (currentDay < 4) { // 日曜日(0)〜水曜日(3)
        daysToNextThursday = 4 - currentDay;
    } else { // 金曜日(5)〜土曜日(6)
        daysToNextThursday = 4 + (7 - currentDay);
    }
    
    const friday = new Date(baseDate);
    friday.setDate(baseDate.getDate() - daysToLastFriday);
    friday.setHours(0, 0, 0, 0);
    
    const nextThursday = new Date(baseDate);
    nextThursday.setDate(baseDate.getDate() + daysToNextThursday);
    nextThursday.setHours(23, 59, 59, 999);
    
    return { friday: friday, nextThursday: nextThursday };
};

// 今週の試合がある大会名を取得
const championshipsThisWeek = computed(() => {
    isLoading.value = true;

    // 現在の日付を取得（年は変更しない）
    const currentDate = new Date(); // ローカル時間（JST）を使用
    
    // 現在の実際の日付を基準にした週の日付範囲を取得
    const { friday, nextThursday } = getCurrentWeekDatesForYear(currentDate);    
    const targetFriday = friday;
    const targetThursday = nextThursday;
    
    // 今週の試合がある大会名を格納
    const championships = new Set();

    // matchInfoが持つmatch_datesを使って、今週の試合がある大会名等を取得
    props.matchInfo.forEach(championship => {
        if (championship.match_dates && Array.isArray(championship.match_dates)) {
            const hasMatchThisWeek = championship.match_dates.some(dateStr => {
                // 日本時間を考慮した試合日付を作成
                const matchDateUTC = new Date(dateStr);
                const matchDate = new Date(matchDateUTC.getTime() + (9 * 60 * 60 * 1000)); // UTC+9時間
                return matchDate >= targetFriday && matchDate <= targetThursday;
            });

            if (hasMatchThisWeek) {
                championships.add(JSON.stringify({
                    name: championship.championship_name,
                    abbr: championship.abbreviation,
                    id: championship.championship_id,
                    category: championship.category,
                }));
            }
        }
    });
    
    isLoading.value = false;
    return Array.from(championships).map(item => JSON.parse(item));
});

// 大会名をカテゴリ順にソート
const championshipsThisWeekSorted = computed(() => {
    return championshipsThisWeek.value.sort((a, b) => {
        if (a.category === b.category) {
            return a.id.localeCompare(b.id);
        }
        return a.category.localeCompare(b.category);
    });
});

const handleChampionshipClick = (championshipId) => {
    router.push({
        path: `/latest-results-by-championship/${championshipId}`,
    });
};
</script>
<template>
    <div class="mt-2">
        <div v-if="isLoading" class="flex flex-col items-center justify-center p-5">
            <img src="../assets/icons/loading.gif" alt="Loading..." class="w-10 h-10 mb-2.5" />
        </div>
        <div v-else class="space-y-4">
            <select class="w-full border-1 border-gray-600 p-1 rounded-sm" @change="handleChampionshipClick($event.target.value)">
                <option value="" selected>U-12（ジュニア）</option>
                <option v-if="championshipsThisWeekSorted.filter(c => c.category === 'U-12（ジュニア）').length === 0" 
                    value="" disabled>今週開催予定の試合がないか、まだ更新されていません。</option>
                <option v-for="championship in championshipsThisWeekSorted.filter(c => c.category === 'U-12（ジュニア）')" 
                    :key="championship.id"
                    :value="championship.id">
                    {{ championship.abbr }}
                </option>
            </select>
            <select class="w-full border-1 border-gray-600 p-1 rounded-sm" @change="handleChampionshipClick($event.target.value)">
                <option value="" selected>U-15（ジュニアユース）</option>
                <option v-if="championshipsThisWeekSorted.filter(c => c.category === 'U-15（ジュニアユース）').length === 0" 
                    value="" disabled>今週開催予定の試合がないか、まだ更新されていません。</option>
                <option v-for="championship in championshipsThisWeekSorted.filter(c => c.category === 'U-15（ジュニアユース）')" 
                    :key="championship.id"
                    :value="championship.id">
                    {{ championship.abbr }}
                </option>
            </select>
            <select class="w-full border-1 border-gray-600 p-1 rounded-sm" @change="handleChampionshipClick($event.target.value)">
                <option value="" selected>U-18（ユース）</option>
                <option v-if="championshipsThisWeekSorted.filter(c => c.category === 'U-18（ユース）').length === 0" 
                    value="" disabled>今週開催予定の試合がないか、まだ更新されていません。</option>
                <option v-for="championship in championshipsThisWeekSorted.filter(c => c.category === 'U-18（ユース）')" 
                    :key="championship.id"
                    :value="championship.id">
                    {{ championship.abbr }}
                </option>
            </select>
            <select class="w-full border-1 border-gray-600 p-1 rounded-sm" @change="handleChampionshipClick($event.target.value)">
                <option value="" selected>WOMAN</option>
                <option v-if="championshipsThisWeekSorted.filter(c => c.category === 'WOMAN').length === 0" 
                    value="" disabled>今週開催予定の試合がないか、まだ更新されていません。</option>
                <option v-for="championship in championshipsThisWeekSorted.filter(c => c.category === 'WOMAN')" 
                    :key="championship.id"
                    :value="championship.id">
                    {{ championship.abbr }}
                </option>
            </select>
        </div>
    </div>
</template>
<style></style>