<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { MATCH_API_URL, THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from '@/utils/constants'

const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

// 読み込み中の画面表示切り替え
const isLoading = ref(false)

const router = useRouter()

// 試合情報
const matchInfo = ref([])
const matchName = ref('')
const matchDate = ref(false)
const place = ref('')
const matchState = ref('')

const getMatchInfo = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ MATCH_API_URL }/${ THIS_FISCAL_YEAR }/`)

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const originalData = await response.json()
        matchInfo.value = originalData
    } catch(error) {
        console.error('試合情報の取得に失敗しました。', error)
    } finally {
        isLoading.value = false
    }
}

// // matchIdからchampionshipIdを検索する
// const searchChampionshipIdByMatchId = ( selectedMatchId ) => {
//     let a = ''
//     matchInfo.value.forEach(item => {
//         for (const round in item.matches) {
//             for (const match in item.matches[round]) {
//                 const targetMatchId = resetTime(new Date(item.matches[round][match]['match_id']))
//                 if (selectedMatchId === targetMatchId) {
//                     // a.push(championShip)
//                     a.push(item['championship_id'])
//                 }
//             }
//         }
//     })
//     return a
// }

// 日付の時刻をリセットする
const resetTime = (date) => {
    const modifiedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return modifiedDate
}

// match_dateがtodayの１ヶ月以内に存在するか判定する
const isWithinLastMonth = (today, targetDate) => {
    // 現在の日付から1ヶ月前の日付を計算
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // 特定の日付が今日と過去1ヶ月前の間に存在するかを確認
    return targetDate >= oneMonthAgo && targetDate <= today
}

const matchInfoToShow = computed(() => {
    let a = []
    const today = resetTime(new Date())

    // 掲載対象試合のデータのみを抽出
    for (const championShip of matchInfo.value) {
        for (const round in championShip.matches) {
            for (const match in championShip.matches[round]) {
                const targetMatchDate = resetTime(new Date(championShip.matches[round][match]['match_date']))
                if (isWithinLastMonth(today, targetMatchDate)) {
                    a.push(championShip.matches[round][match])
                }
            }
        }
    }
    return a
})

onMounted(async () => {
    await getMatchInfo()
})
</script>

<template>
<div class="latest-results-wrapper">
    <h1>現在から過去１ヶ月以内に開催された試合の結果を表示します。</h1>
    <div v-for="(item, index) in matchInfoToShow" class="each-latest-result-container">
        <p>{{ item['match_name'] }}</p>
        <p>{{ item['match_date'].replace(/(\d{4})-(0?)(\d+)-(0?)(\d+)/, '$1年$3月$5日') }}</p>
        <p>{{ item['match_start_at'] }}</p>
        <div class="each-latest-result-inner">
            <div class="home-inner">
                <p>{{ item['home_club']['club_name'] }}</p>
                <p class="score">{{ item['home_club']['final_score'] }}</p>
            </div>
            <p class="dash">－</p>
            <div class="away-inner">
                <p>{{ item['away_club']['club_name'] }}</p>
                <p class="score">{{ item['away_club']['final_score'] }}</p>
            </div>
        </div>
        <div v-if="item['match_flgs']['has_penalty_shootout']" class="penalty-shootout-container">
            <p>PK</p>
            {{ item['home_club']['penalty_shootout_final_score'] }}
            -
            {{ item['away_club']['penalty_shootout_final_score'] }}
        </div>
    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .latest-results-wrapper {
        width: 100%;
        text-align: center;
    }

    h1 {
        width: 90%;
        font-size: 16px;
        margin: 0 auto;    
    }

    .each-latest-result-container {
        width: 90%;
        padding: 8px;
        margin: 0 auto;
        border: 1px solid #000;
        border-radius: 30px;
    }

    .each-latest-result-container:not(:last-child) {
        margin-bottom: 25px;
    }

    .each-latest-result-inner {
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
    }

    .home-inner, .away-inner {
        max-width: 200px;
        width: 50%;
    }

    .penalty-shootout-container {
        text-align: center;
    }
}
</style>
