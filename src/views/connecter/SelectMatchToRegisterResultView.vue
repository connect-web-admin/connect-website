<!-- <script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CONNECTER_API_URL, MATCH_API_URL, CHAMPIONSHIP_ID, MATCH_ID, ID_TOKEN_FOR_AUTH, USER_ATTR_SUB, THIS_FISCAL_YEAR, CHAMPIONSHIP_NAMES } from '@/utils/constants'

const scores = Array.from({ length: 20 }, (_, i) => i + 1); // 得点入力のプルダウンメニュー用

const router = useRouter()

const userAttrSub = localStorage.getItem(USER_ATTR_SUB) // ConnecterDDBにあるconnecter_idと同じ値
const championshipId = localStorage.getItem(CHAMPIONSHIP_ID)
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

const matchInfo = ref([])
const isLoading = ref(false)
const isProceeding = ref(false)
const isFetchingSuccessful = ref(false)
const failedFetchingMsg = ref('')

// MatchDDBに登録する得点
const homeClubScoreToRegister = ref([])
const awayClubScoreToRegister = ref([])
const homeClubPenaltyShootoutScoreToRegister = ref([])
const awayClubPenaltyShootoutScoreToRegister = ref([])

// 今日の日付を作成
const dateTpFormat = new Date();
const today = dateTpFormat.getFullYear() + '-' + String(dateTpFormat.getMonth() + 1).padStart(2, '0') + '-' + String(dateTpFormat.getDate()).padStart(2, '0');

// ページ遷移したら速報対象試合の情報を取得
const getMatchInfoToRegisterResult = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ CONNECTER_API_URL }/object/${ userAttrSub }/${ THIS_FISCAL_YEAR }`)

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        })

        if (response.ok) {
            isFetchingSuccessful.value = true
            const data = await response.json()
            for (const item of data) {
                if (item.match.match_date === today) {
                    matchInfo.value.push(item)
                }
            }
        } else {
            failedFetchingMsg.value = '試合情報の取得に失敗しました。ページを更新するか、ログアウトしてから再度ログインをしてください。それでも問題が解決しない場合は、運営にご連絡ください。'
        }
    } catch(error) {
        console.error('試合情報の取得に失敗しました。')
    } finally {
        console.log(matchInfo.value)
        isLoading.value = false
    }
}

const submitScores = async () => {
    isProceeding.value = true

    const scoreData = [
        {
            championshipId: '5thBirdsCup',
            matchId: '5thBirdsCup-01-01',
            homeClubFinalScore: 9,
            awayClubFinalScore: 8,
            hasPenaltyShootout: true,
            homeClubPenaltyShootoutScore: 5,
            awayClubPenaltyShootoutScore: 4
        },
        {
            championshipId: '5thBirdsCup',
            matchId: '5thBirdsCup-01-02',
            homeClubFinalScore: 7,
            awayClubFinalScore: 6,
            hasPenaltyShootout: false,
            homeClubPenaltyShootoutScore: 0,
            awayClubPenaltyShootoutScore: 0
        }
    ]

    // API URLの組み立て
    const url = new URL(`${ MATCH_API_URL }/register_scores`)

    // HTTPリクエスト送信時のボディに共通する部分 match_idで対象試合を特定
    const requestBody = {
        fiscalYear: THIS_FISCAL_YEAR,
        championshipId: championshipId,
        scoreData: scoreData
    } 

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            },
            body: JSON.stringify(requestBody)
        })

        if (response.ok) {
            // 
        } else {
            alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
        }
    } catch(error) {
        alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
        console.error('得点の登録に失敗しました。')
    } finally {
        isProceeding.value = false
    }
}

/**
 * ISO8601形式の年月日を和暦表示に変換する。
 * 2024-01-01　→　2024年1月1日
 * @param matchDate string YYYY-MM-DD
 */
const formatDate = (matchDate) => {
    const date = new Date(matchDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() は 0 から始まるので +1
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// ページ表示前にConnecterDDBから試合情報抽出
onBeforeMount(async () => {
    await getMatchInfoToRegisterResult()
})
</script>

<template>
<div class=contents-wrapper>
    <div v-if="isLoading">
        読み込み中
    </div>
    <div v-else>
        <div v-if="isFetchingSuccessful">
            <div v-if="isProceeding">
                得点登録中
            </div>
            <div v-else>
                <form @submit.prevent="submitScores">
                    <div class="input-guide">
                        本日開催の試合は以下の通りです。<br />
                        得点を入力し、ページ最下部の登録ボタンを<br />
                        押してください。
                    </div>
                    <div v-for="item in matchInfo" :key="item['match_id']" class="each-match-wrapper">
                        {{ item['championshipName'] }}<br />
                        {{ formatDate(item['match']['match_date']) }}{{ item['match']['match_start_at'] }}<br />
                        開催地：{{ item['match']['venue'] }}<br />
                        <div class="clubs-wrapper">
                            <div class="each-club-container">
                                <p class="club-name">
                                    {{ item['match']['home_club_name'] }}
                                </p>
                                <div class="score-container">
                                    <select v-model="homeClubScoreToRegister">
                                        <option v-for="item in scores" :value=item>
                                            {{ item }}
                                        </option>
                                    </select>
                                    <select v-model="homeClubPenaltyShootoutScoreToRegister">
                                        <option v-for="item in scores" :value=item>
                                            {{ item }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="each-club-container">
                                <p class="club-name">
                                    {{ item['match']['away_club_name'] }}
                                </p>
                                <div class="score-container">
                                    <select v-model="awayClubScoreToRegister">
                                        <option v-for="item in scores" :value=item>
                                            {{ item }}
                                        </option>
                                    </select>
                                    <select v-model="awayClubPenaltyShootoutScoreToRegister">
                                        <option v-for="item in scores" :value=item>
                                            {{ item }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button typ="submit">得点登録</button>
                </form>
            </div>
        </div>
        <div v-else>
            {{ failedFetchingMsg }}
        </div>
    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .contents-wrapper {
        text-align: center;
    }

    .input-guide {
        width: 90%;
        margin: 0 auto;
    }
    
    .each-match-wrapper {
        max-width: 380px;
        min-width: 300px;
        width: 75%;
        padding: 0.6em 1em;
        margin: 1em auto 0;
        border: 0.1px solid #bebebe;
        border-radius: 20px;
        background: linear-gradient(#FFF, #dbf6ff);
    }

    .each-match-wrapper:not(:last-child) {
        margin-bottom: 2em;
    }

    .each-club-container {
        padding:0.5em;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
    }

    .each-club-container select:first-child {
        margin: 0 1em;
    }

    .club-name {
        max-width: 140px;
        min-width: 90px;
        width: 50%;
    }

    .score-container {
        max-width: 140px;
        min-width: 90px;
        width: 50%;
    }
}
</style> -->
<script setup>

import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CONNECTER_API_URL, MATCH_API_URL, CHAMPIONSHIP_ID, MATCH_ID, ID_TOKEN_FOR_AUTH, USER_ATTR_SUB, THIS_FISCAL_YEAR, CHAMPIONSHIP_NAMES } from '@/utils/constants'


const userAttrSub = localStorage.getItem(USER_ATTR_SUB) // ConnecterDDBにあるconnecter_idと同じ値
const championshipId = localStorage.getItem(CHAMPIONSHIP_ID)
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

const matchInfo = ref([])
const isLoading = ref(false)
const isProceeding = ref(false)
const isFetchingSuccessful = ref(false)
const failedFetchingMsg = ref('')


// 今日の日付を作成
const dateTpFormat = new Date();
const today = dateTpFormat.getFullYear() + '-' + String(dateTpFormat.getMonth() + 1).padStart(2, '0') + '-' + String(dateTpFormat.getDate()).padStart(2, '0');

const scores = Array.from({ length: 21 }, (_, i) => i);

const submitScores = async () => {
    const payload = matchInfo.value.map(item => ({
        championshipId: item.championshipId,
        matchId: item.match.match_id,
        homeClubFinalScore: item.match.home_club_final_score,
        awayClubFinalScore: item.match.away_club_final_score,
        hasPenaltyShootout: item.match.has_penalty_shootout,
        homeClubPenaltyShootoutScore: item.match.has_penalty_shootout ? item.match.home_club_penalty_shootout_score : -1,
        awayClubPenaltyShootoutScore: item.match.has_penalty_shootout ? item.match.away_club_penalty_shootout_score : -1
    }))
    
    // API URLの組み立て
    const url = new URL(`${ MATCH_API_URL }/register_scores`)

    // HTTPリクエスト送信時のボディに共通する部分 match_idで対象試合を特定
    const requestBody = {
        fiscalYear: THIS_FISCAL_YEAR,
        championshipId: championshipId,
        scoreData: payload
    } 

    console.log(requestBody)

    // try {
    //     // 試合情報取得
    //     const response = await fetch(url, { 
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${ idTokenForAuth }`
    //         },
    //         body: JSON.stringify(requestBody)
    //     })

    //     if (response.ok) {
    //         // 
    //         alert('OK')
    //     } else {
    //         alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
    //     }
    // } catch(error) {
    //     alert("得点の登録に失敗しました。ログアウトしてから再度ログインをして登録してください。それでも問題が解決しない場合は、運営にご連絡ください。")
    //     console.error('得点の登録に失敗しました。')
    // } finally {
    //     isProceeding.value = false
    // }
}

// ページ遷移したら速報対象試合の情報を取得
const getMatchInfoToRegisterResult = async () => {
    // isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ CONNECTER_API_URL }/object/${ userAttrSub }/${ THIS_FISCAL_YEAR }`)

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        })

        if (response.ok) {
            isFetchingSuccessful.value = true
            const data = await response.json()
            for (const item of data) {
                if (item.match.match_date === today) {
                    matchInfo.value.push(item)
                }
            }
        } else {
            failedFetchingMsg.value = '試合情報の取得に失敗しました。ページを更新するか、ログアウトしてから再度ログインをしてください。それでも問題が解決しない場合は、運営にご連絡ください。'
        }
    } catch(error) {
        console.error('試合情報の取得に失敗しました。')
    } finally {
        // isLoading.value = false
    }
}

/**
 * ISO8601形式の年月日を和暦表示に変換する。
 * 2024-01-01　→　2024年1月1日
 * @param matchDate string YYYY-MM-DD
 */
const formatDate = (matchDate) => {
    const date = new Date(matchDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() は 0 から始まるので +1
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// ページ表示前にConnecterDDBから試合情報抽出
onBeforeMount(async () => {
    await getMatchInfoToRegisterResult()
})

</script>

<template>
<div class=contents-wrapper>
    <div v-if="isLoading">
        読み込み中
    </div>
    <div v-else>
        <div v-if="isFetchingSuccessful">
            <div v-if="isProceeding">
                得点登録中
            </div>
            <div v-else>
                <form @submit.prevent="submitScores">
                    <div class="input-guide">
                        本日開催の試合は以下の通りです。<br />
                        得点を入力し、ページ最下部の登録ボタンを<br />
                        押してください。
                    </div>
                    <div v-for="item in matchInfo" :key="item['match_id']" class="each-match-wrapper">
                        {{ item['championshipName'] }}<br />
                        {{ formatDate(item['match']['match_date']) }}{{ item['match']['match_start_at'] }}<br />
                        開催地：{{ item['match']['venue'] }}<br />
                        <div class="clubs-wrapper">
                            <div class="each-club-container">
                                <p class="club-name">
                                    {{ item['match']['home_club_name'] }}
                                </p>
                                <div class="score-container">
                                    <select v-model="item.match.home_club_final_score">
                                        <option value="" disabled selected>選択</option>
                                        <option v-for="score in scores" :key="score" :value="score">
                                            {{ score }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="each-club-container">
                                <p class="club-name">
                                    {{ item['match']['away_club_name'] }}
                                </p>
                                <div class="score-container">
                                    <select v-model="item.match.away_club_final_score">
                                        <option value="" disabled selected>選択</option>
                                        <option v-for="score in scores" :key="score" :value="score">
                                            {{ score }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="extra">
                                <label>PK戦</label>
                                <input type="checkbox" v-model="item.match.has_penalty_shootout" />
                            </div>
                            <div v-if="item.match.has_penalty_shootout">
                                <div class="each-club-container">
                                    <p class="club-name">
                                        {{ item['match']['home_club_name'] }}
                                    </p>
                                    <div class="score-container">
                                        <select v-model="item.match.home_club_penalty_shootout_score">
                                            <option value="" disabled selected>選択</option>
                                            <option v-for="score in scores" :key="score" :value="score">
                                                {{ score }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="each-club-container">
                                    <p class="club-name">
                                        {{ item['match']['away_club_name'] }}
                                    </p>
                                    <div class="score-container">
                                        <select v-model="item.match.away_club_penalty_shootout_score">
                                            <option value="" disabled selected>選択</option>
                                            <option v-for="score in scores" :key="score" :value="score">
                                                {{ score }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button typ="submit">得点登録</button>
                </form>
            </div>
        </div>
        <div v-else>
            {{ failedFetchingMsg }}
        </div>
    </div>
</div>
</template>
    
<style scoped>
@media screen and (max-width: 500px) {
    .contents-wrapper {
        text-align: center;
    }

    .input-guide {
        width: 90%;
        margin: 0 auto;
    }
    
    .each-match-wrapper {
        max-width: 380px;
        min-width: 300px;
        width: 75%;
        padding: 0.6em 1em;
        margin: 1em auto 0;
        border: 0.1px solid #bebebe;
        border-radius: 20px;
        background: linear-gradient(#FFF, #dbf6ff);
    }

    .each-match-wrapper:not(:last-child) {
        margin-bottom: 2em;
    }

    .each-club-container {
        padding:0.5em;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
    }

    .each-club-container select:first-child {
        margin: 0 1em;
    }

    .club-name {
        max-width: 140px;
        min-width: 90px;
        width: 50%;
    }

    .score-container {
        max-width: 140px;
        min-width: 90px;
        width: 50%;
    }
}
</style>



<!-- <template>
    <form @submit.prevent="submitScores">
        <h1>スコア入力</h1>
        <div v-for="(match, index) in matchInfo" :key="match.matchId" class="match-block">
            <p>大会ID: {{ match.championshipName }}</p>
            <div class="player-score">
                <label>Player C</label>
                <select v-model="match.playerCScore">
                    <option v-for="score in scores" :key="score" :value="score">{{ score }}</option>
                </select>
            </div>
            <div class="player-score">
                <label>Player D</label>
                <select v-model="match.playerDScore">
                    <option v-for="score in scores" :key="score" :value="score">{{ score }}</option>
                </select>
            </div>
            <div class="extra">
                <label>延長戦</label>
                <input type="checkbox" v-model="match.hasPenaltyShootout" />
            </div>
            <div v-if="match.hasPenaltyShootout" class="extra-score">
                <label>Player C 延長</label>
                <select v-model="match.playerAExtraScore">
                    <option v-for="score in scores" :key="score" :value="score">{{ score }}</option>
                </select>
                <label>Player D 延長</label>
                <select v-model="match.playerBExtraScore">
                    <option v-for="score in scores" :key="score" :value="score">{{ score }}</option>
                </select>
            </div>
        </div>
        <button type="submit">送信</button>
    </form>
</template>

<style scoped>
.match-block {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
}

.player-score {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.player-score label {
    width: 100px;
}

.extra {
    margin-top: 5px;
}

.extra-score {
    display: flex;
    align-items: center;
    gap: 10px;
}

button {
    margin-top: 10px;
}
</style> -->
