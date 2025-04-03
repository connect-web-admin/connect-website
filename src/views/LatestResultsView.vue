<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
const failedMsg = ref('');
// import { ref, computed, onMounted } from 'vue'
// import { RouterLink, RouterView, useRouter } from 'vue-router'
// import { MATCH_API_URL, THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from '@/utils/constants'

// const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

// // 読み込み中の画面表示切り替え
// const isLoading = ref(false)

// const router = useRouter()

// // 試合情報
// const matchInfo = ref([])
// const matchName = ref('')
// const matchDate = ref(false)
// const place = ref('')
// const matchState = ref('')

// const getMatchInfo = async () => {
//     isLoading.value = true

//     // API URLの組み立て
//     const url = new URL(`${ MATCH_API_URL }/${ THIS_FISCAL_YEAR }/`)

//     try {
//         // 試合情報取得
//         const response = await fetch(url, { 
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${ idTokenForAuth }`
//             }
//         })

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const originalData = await response.json()
//         matchInfo.value = originalData
//     } catch(error) {
//         console.error('試合情報の取得に失敗しました。', error)
//     } finally {
//         isLoading.value = false
//     }
// }

// // // matchIdからchampionshipIdを検索する
// // const searchChampionshipIdByMatchId = ( selectedMatchId ) => {
// //     let a = ''
// //     matchInfo.value.forEach(item => {
// //         for (const round in item.matches) {
// //             for (const match in item.matches[round]) {
// //                 const targetMatchId = resetTime(new Date(item.matches[round][match]['match_id']))
// //                 if (selectedMatchId === targetMatchId) {
// //                     // a.push(championShip)
// //                     a.push(item['championship_id'])
// //                 }
// //             }
// //         }
// //     })
// //     return a
// // }

// // 日付の時刻をリセットする
// const resetTime = (date) => {
//     const modifiedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
//     return modifiedDate
// }

// // match_dateがtodayの１ヶ月以内に存在するか判定する
// const isWithinLastMonth = (today, targetDate) => {
//     // 現在の日付から1ヶ月前の日付を計算
//     const oneMonthAgo = new Date(today);
//     oneMonthAgo.setMonth(today.getMonth() - 1);

//     // 特定の日付が今日と過去1ヶ月前の間に存在するかを確認
//     return targetDate >= oneMonthAgo && targetDate <= today
// }

// const matchInfoToShow = computed(() => {
//     let a = []
//     const today = resetTime(new Date())

//     // 掲載対象試合のデータのみを抽出
//     for (const championShip of matchInfo.value) {
//         for (const round in championShip.matches) {
//             for (const match in championShip.matches[round]) {
//                 const targetMatchDate = resetTime(new Date(championShip.matches[round][match]['match_date']))
//                 if (isWithinLastMonth(today, targetMatchDate)) {
//                     a.push(championShip.matches[round][match])
//                 }
//             }
//         }
//     }
//     return a
// })

// onMounted(async () => {
//     await getMatchInfo()
// })
</script>

<template>
    <div class="p-5">
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-lg font-bold mb-5">U-18プリンスリーグの大会詳細結果について</h1>
            <div>
                <p>U-18プリンスリーグの大会詳細結果についてはこちらで見ることができます。</p>
                <a href="https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/" target="_blank"
                    class="text-blue-500 underline break-words">
                    https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/
                </a>
            </div>
        </div>
    </div>
</template>

<style></style>