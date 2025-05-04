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
    
    // console.log("今日:", today.toISOString());
    // console.log("直近の過去の火曜日:", tuesday.toISOString());
    // console.log("直近の未来の月曜日:", nextMonday.toISOString());
    
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
    
    // データが2025年なので、同じ月日で2025年の日付を作成
    const targetTuesday = new Date(tuesday);
    targetTuesday.setFullYear(2025);
    
    const targetMonday = new Date(nextMonday);
    targetMonday.setFullYear(2025);
    
    // console.log("表示期間:", targetTuesday.toISOString(), "から", targetMonday.toISOString());
    
    const championships = new Set();

    props.matchInfo.forEach(championship => {
        if (championship.matches) {
            // 各試合ブロック（例：Aブロック、１部リーグ、4/26など）を処理
            Object.entries(championship.matches).forEach(([blockName, blockData]) => {
                // blockDataが試合データのオブジェクトを含む場合を処理
                Object.entries(blockData).forEach(([key, value]) => {
                    // round_idをスキップし、試合データのみを処理
                    if (key !== 'round_id') {
                        // valueが試合オブジェクトかチェック（match_dateプロパティがあるか）
                        if (value && typeof value === 'object' && value.match_date) {
                            const matchDate = new Date(value.match_date);
                            // console.log("試合日:", matchDate.toISOString(), 
                            //     "比較結果:", 
                            //     ">=", matchDate >= targetTuesday, 
                            //     "<=", matchDate <= targetMonday);
                            
                            // 日付の比較
                            if (matchDate >= targetTuesday && matchDate <= targetMonday) {
                                championships.add(championship.championship_name);
                                // console.log("追加された大会:", championship.championship_name);
                            }
                        }
                    }
                });
            });
        }
    });
    
    console.log("検出された大会数:", championships.size);
    isLoading.value = false;
    return Array.from(championships);
});

const championshipsThisWeekSorted = computed(() => {
    return championshipsThisWeek.value.sort((a, b) => a.localeCompare(b));
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
                    <li v-for="championship in championshipsThisWeekSorted" 
                        :key="championship"
                        @click="handleChampionshipClick(championship)"
                        class="cursor-pointer hover:bg-gray-200 text-blue-600 p-2 underline">
                        {{ championship }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style></style>