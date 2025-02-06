<script setup>
import { ref, reactive, computed, onMounted, onBeforeMount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR, CHAMPIONSHIP_ID, MATCH_ID, HOME_CLUB, AWAY_CLUB, HOME, AWAY  } from '@/utils/constants';

const router = useRouter()
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)
const championshipId = localStorage.getItem(CHAMPIONSHIP_ID)
const matchId = localStorage.getItem(MATCH_ID)

// 
const isLoading = ref(false)

// 試合情報
const matchInfo = ref('')
const matchName = ref('')
const matchDate = ref('')
const venue = ref('')
const hasPenaltyShootout = ref(false)

// ホームクラブ情報
const homeClubName = ref('')
const homeClubPenaltyShootoutFinalScore = ref(0)

// アウェイクラブ情報
const awayClubName = ref('')
const awayClubPenaltyShootoutFinalScore = ref(0)

// HTTPリクエスト送信時のボディに共通する部分 match_idで対象試合を特定
const requestBody = {
    fiscalYear: THIS_FISCAL_YEAR,
    championshipId: championshipId,
    matchId: matchId
}; 

const getTargetMatchInfoToSelect = async () => {
    isLoading.value = true

    const url = new URL(`${ MATCH_API_URL }/object/${ THIS_FISCAL_YEAR }/${ championshipId }`)

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        });

        const originalData = await response.json()

    } catch(error) {
        console.error('試合情報の取得に失敗しました。', error)
    } finally {
        isLoading.value = false
    }
}

// 試合結果を、MatchDDBとConnecterDDBに登録する。勝敗を各チームのアトリビュートに登録する。
const registerMatchResult = async () => {
    const confirmation = confirm(`試合結果を登録します。よろしいですか？`)   

    if( confirmation ) {
        const matchUrl = new URL(`${ MATCH_API_URL }/register_match_result`)
        requestBody.newState = newState

        // MatchDDBの対象試合のis_match_endedをtrueにする処理も含む
        try {
            const response = await fetch(matchUrl, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ idTokenForAuth }`
                },
                body: JSON.stringify(requestBody)
            })

            const data = await response.json()
        } catch(error) {
            console.error("試合結果登録に失敗しました。")
        }

        router.push('/finish_live_report')
    } else {
        // 何もしない
    }
}

onMounted(async () => {
    // 結果入力対象試合のデータを取得する
    await getTargetMatchInfo()
})
</script>

<template>
<div class=contents-wrapper>
    <div v-if="isLoading">
        読み込み中
    </div>
    <div v-else>


    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {


}
</style>