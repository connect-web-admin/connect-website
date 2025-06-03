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

// 今週の日付範囲を取得する関数（火曜日始まり月曜日終わり）
const getCurrentWeekDates = () => {
    // 日本時間の現在時刻を取得
    const today = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const currentDay = today.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
    
    // 直近の過去の火曜日を計算
    let daysToSubtract;
    if (currentDay === 2) { // 今日が火曜日
        daysToSubtract = 0;
    } else if (currentDay > 2) { // 水曜日〜土曜日
        daysToSubtract = currentDay - 2;
    } else { // 日曜日(0)または月曜日(1)
        daysToSubtract = currentDay + 5; // 7 - (2 - currentDay)
    }
    
    const tuesday = new Date(today);
    tuesday.setDate(today.getDate() - daysToSubtract);
    tuesday.setHours(0, 0, 0, 0);
    
    const nextMonday = new Date(tuesday);
    nextMonday.setDate(tuesday.getDate() + 6); // 火曜日から6日後が月曜日
    nextMonday.setHours(23, 59, 59, 999);
    
    return { tuesday, nextMonday };
};

// 今週の試合がある大会名を取得
const championshipsThisWeek = computed(() => {
    isLoading.value = true;

    // 現在の年を取得
    const currentDate = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const currentYear = currentDate.getFullYear();
    
    // 現在の週の日付範囲を取得（火曜日始まり月曜日終わり）
    const { tuesday, nextMonday } = getCurrentWeekDates();    
    const targetTuesday = new Date(tuesday);
    targetTuesday.setFullYear(THIS_FISCAL_YEAR);
    const targetMonday = new Date(nextMonday);
    targetMonday.setFullYear(THIS_FISCAL_YEAR);
    
    // 今週の試合がある大会名を格納
    const championships = new Set();
    
    // matchInfoが持つmatch_datesを使って、今週の試合がある大会名等を取得
    props.matchInfo.forEach(championship => {
        if (championship.match_dates && Array.isArray(championship.match_dates)) {
            const hasMatchThisWeek = championship.match_dates.some(dateStr => {
                const matchDate = new Date(dateStr);
                return matchDate >= targetTuesday && matchDate <= targetMonday;
            });

            if (hasMatchThisWeek) {
                championships.add(JSON.stringify({
                    name: championship.championship_name,
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

const handleChampionshipClick = (championship) => {
    router.push({
        path: `/latest-results-by-championship/${championship.id}`,
    });
};
</script>
<template>
    <div>
        <div v-if="isLoading" class="flex flex-col items-center justify-center p-5">
            <img src="../assets/icons/loading.gif" alt="Loading..." class="w-10 h-10 mb-2.5" />
        </div>
        <div v-else>
            <div v-if="championshipsThisWeek.length === 0">
                <p>今週開催予定の試合がないか、まだ更新されていません。</p>
            </div>
            <div v-else>
                <ul class="list-none p-0">
                    <li v-for="championship in championshipsThisWeekSorted" 
                        :key="championship.id"
                        @click="handleChampionshipClick(championship)"
                        class="cursor-pointer hover:bg-gray-200 text-blue-500 p-1 underline">
                        ■ {{ championship.name }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style></style>