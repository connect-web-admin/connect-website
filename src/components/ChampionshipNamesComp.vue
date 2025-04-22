<script setup>
import { computed, ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);
const props = defineProps({
    matchInfo: {
        type: Array,
        required: true,
    },
});

// 今週の日付範囲を取得する関数（日本時間）
const getCurrentWeekDates = () => {
    // 日本時間の現在時刻を取得
    const today = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const currentDay = today.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // 月曜日を週の始まりとする調整
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
};

// 今週の試合がある大会名を取得
const championshipsThisWeek = computed(() => {
    isLoading.value = true;
    const { monday, sunday } = getCurrentWeekDates();
    const championships = new Set();
    
    props.matchInfo.forEach(championship => {
        if (championship.matches) {
            Object.values(championship.matches).forEach(division => {
                if (division.round_id) {
                    Object.values(division).forEach(match => {
                        if (match.match_date) {
                            const matchDate = new Date(match.match_date);
                            if (matchDate >= monday && matchDate <= sunday) {
                                championships.add(championship.championship_name);
                            }
                        }
                    });
                }
            });
        }
    });
    
    isLoading.value = false;
    return Array.from(championships);
});

const handleChampionshipClick = (championshipName) => {
    router.push({
        path: '/latest-results',
        query: { championship: championshipName }
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
                <p></p>
            </div>
            <div v-else>
                <ul class="list-none p-0">
                    <li v-for="championship in championshipsThisWeek" 
                        :key="championship"
                        @click="handleChampionshipClick(championship)"
                        class="cursor-pointer hover:bg-gray-200 text-blue-600  p-2 underline">
                        {{ championship }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style></style>