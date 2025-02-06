<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CONNECTER_API_URL, CHAMPIONSHIP_ID, MATCH_ID, ID_TOKEN_FOR_AUTH, USER_ATTR_SUB, THIS_FISCAL_YEAR } from '@/utils/constants'

const router = useRouter()

const userAttrSub = localStorage.getItem(USER_ATTR_SUB) // ConnecterDDBにあるconnecter_idと同じ値
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)

const matchInfo = ref([])
const isLoading = ref(false)
const selectedLiveReportingMatchId = ref('')

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

        const originalData = await response.json()
        console.log(originalData)
        matchInfo.value = originalData
    } catch(error) {
        console.error('試合情報の取得に失敗しました。')
    } finally {
        isLoading.value = false
    }
}

// matchIdからchampionshipIdを検索
const searchChampionshipIdByMatchId = ( selectedMatchId ) => {
    let a = ''
    matchInfo.value.forEach( item => {
        if( item.match_id === selectedMatchId ) {
            a = item.championship_id
        }
    })
    return a
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
            <!-- <div class="select-match">
                <p class="select-registe-player-match-index">速報対象試合　選手登録</p>
                <p>出場選手を登録してください。</p>

                <div v-for="item in matchInfoToRegisterPlayers" :key="item['match_id']">
                    <span class="register-player-match">
                        <label>
                            <input type="radio" :value="item['match_id']" v-model="selectedRegisteringPlayersMatchId" />
                            {{ item['target_match'] }}
                        </label>
                    </span>
                </div>
                <button @click="registerMatchPlayers">選手登録画面へ移動</button>
            </div> -->
            <div class="select-match">
                <p class="select-live-report-match-index">結果入力試合選択</p>
                <p>対象試合を選択し、速報画面へ移動してください。</p>
                <div v-for="item in matchInfo" :key="item['match_id']">
                    {{ item['championshipName'] }}
                    {{ item['match']['match_date'] }}
                    {{ item['match']['match_start_at'] }}
                    {{ item['match']['home_club_name'] }}
                    {{ item['match']['away_club_name'] }}
                </div>
                <button type="submit" @click="startLiveReporting()">速報画面へ移動</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    ul {
        margin: 2em auto;
        padding-left: 5em;
        list-style: circle;
    }
    
    li {
        text-align: left;
        list-style:disc;
        padding: 0.2em 0;
    }

    .contents-wrapper {
        width: 90%;
        margin: 2em auto 0;
        text-align: center;
    }

    .register-player-match {
        display: block;
        margin-bottom: 10px;
    }

    .select-match:first-child {
        margin-bottom: 40px;
    }

    .select-registe-player-match-index {
        background-color: #98e7ff;
    }

    .select-live-report-match-index {
        background-color: #ffd498;
    }

    button {
        padding: 0.2em 0.8em;
        margin-top: 1em;
    }
}
</style>
