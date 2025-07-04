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

// 今週の日付範囲を取得する関数（金曜日始まり木曜日終わり）
const getCurrentWeekDates = () => {
    // 日本時間の現在時刻を取得
    const today = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const currentDay = today.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
    
    // 直近の過去の金曜日を計算
    let daysToSubtract;
    if (currentDay === 5) { // 今日が金曜日
        daysToSubtract = 0;
    } else if (currentDay > 5) { // 土曜日
        daysToSubtract = currentDay - 5;
    } else { // 日曜日(0)〜木曜日(4)
        daysToSubtract = currentDay + 2; // 7 - (5 - currentDay)
    }
    
    const friday = new Date(today);
    friday.setDate(today.getDate() - daysToSubtract - 7); // もう一つ前の金曜日（1週間前）
    friday.setHours(0, 0, 0, 0);
    
    // 直近の未来の木曜日を計算
    const nextThursday = new Date(today);
    let daysToAdd;
    if (currentDay === 4) { // 今日が木曜日
        daysToAdd = 0;
    } else if (currentDay < 4) { // 日曜日〜水曜日
        daysToAdd = 4 - currentDay;
    } else { // 金曜日(5)〜土曜日(6)
        daysToAdd = 4 + (7 - currentDay);
    }
    
    nextThursday.setDate(today.getDate() + daysToAdd);
    nextThursday.setHours(23, 59, 59, 999);
    
    return { friday, nextThursday };
};

// 今週の試合がある大会名を取得
const championshipsThisWeek = computed(() => {
    isLoading.value = true;

    // 現在の年を取得
    const currentDate = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const currentYear = currentDate.getFullYear();
    
    // 現在の週の日付範囲を取得（金曜日始まり木曜日終わり）
    const { friday, nextThursday } = getCurrentWeekDates();    
    const targetFriday = new Date(friday);
    targetFriday.setFullYear(THIS_FISCAL_YEAR);
    const targetThursday = new Date(nextThursday);
    targetThursday.setFullYear(THIS_FISCAL_YEAR);
    
    // 今週の試合がある大会名を格納
    const championships = new Set();

    // matchInfoが持つmatch_datesを使って、今週の試合がある大会名等を取得
    props.matchInfo.forEach(championship => {
        if (championship.match_dates && Array.isArray(championship.match_dates)) {
            const hasMatchThisWeek = championship.match_dates.some(dateStr => {
                const matchDate = new Date(dateStr);
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
        path: `/admin-latest-results-by-championship-name/${championshipId}`,
    });
};
</script>
<template>
    <div class="mt-2">
        <div v-if="isLoading" class="flex flex-col items-center justify-center p-5">
            <img src="../../assets/icons/loading.gif" alt="Loading..." class="w-10 h-10 mb-2.5" />
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