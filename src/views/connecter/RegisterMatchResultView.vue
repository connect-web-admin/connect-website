<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';

// 読み込み中・処理中の画面切り替え用フラグ
const isLoading = ref(false);
const isProcessing = ref(false);

// ルーティングで渡されたパラメータを取得
const route = useRoute();

// REST APIで使う認証トークンを取得
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH);

// 結果入力対象試合の情報をブラウザに表示するためのデータ
// 結果登録に使われるわけではない
const targetMatchInfo = ref({
    championshipName: '',
    round: '',
    match: '',
    matchDetail: {
        match_date: '',
        scheduled_match_start_time: '',
        home_club: {
            club_name: ''
        },
        away_club: {
            club_name: ''
        },
        venue: '',
        is_result_registered: false
    }
});

// 試合結果入力フォームのデータを格納する
const actualMatchStartTime = ref(''); // 実際の試合開始時刻
const hasPK = ref(false); // PK戦有無
const homeClubFinalScore = ref(0); // ホームクラブの得点
const homeClubPKScore = ref(0); // ホームクラブのPK戦スコア
const awayClubFinalScore = ref(0); // アウェイクラブの得点
const awayClubPKScore = ref(0); // アウェイクラブのPK戦スコア
const isDelayed = ref(false); // 試合順延フラグ
const championshipId = route.params.championshipId; // 大会ID ルーティング時にパラメタで渡される
const matchId = route.params.matchId; // 試合ID ルーティング時にパラメタで渡される

// エラーメッセージを格納する
const errorMessage = ref('');

// 試合日をフォーマット YYYY-MM-DDからYYYY/MM/DDに変換
const formattedMatchDate = computed(() => {
    if (!targetMatchInfo.value?.matchDetail?.match_date) {
        return '';
    }
    const matchDate = targetMatchInfo.value.matchDetail.match_date;

    return new Date(matchDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
});

// 結果入力対象試合を取得
const getTargetMatchInfo = async () => {
    isLoading.value = true
    errorMessage.value = '' // エラーメッセージをリセット

    // 試合情報取得用のURLを作成
    // 試合を絞り込むために年度とIDをクエリパラメータに含める
    const queryUrl = new URL(`${MATCH_API_URL}/target_match`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);
    queryUrl.searchParams.append('championshipId', championshipId);
    queryUrl.searchParams.append('matchId', matchId);

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            },
        });
        
        // レスポンスのステータスを確認
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json()
        targetMatchInfo.value = data
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = '試合データの取得に失敗しました。'
    } finally {
        isLoading.value = false
    }
};

// 試合結果登録
const registerMatchResult = async () => {
    // 試合結果登録のバリデーション
    if (!actualMatchStartTime.value) {
        alert('実際の試合開始時刻を入力してください。');
        return;
    }

    // 両チームのの得点が0から99の間であるか確認
    if (homeClubFinalScore.value < 0 || homeClubFinalScore.value > 99) {
        alert('得点を0から99の間で入力してください。');
        return;
    }
    if (awayClubFinalScore.value < 0 || awayClubFinalScore.value > 99) {
        alert('得点を0から99の間で入力してください。');
        return;
    }

    // PK戦が「あり」となっている場合のPK戦スコアのバリデーション
    if (hasPK.value) {
        // 両チームのPK戦スコアが0から99の間であるか確認
        if (homeClubPKScore.value < 0 || homeClubPKScore.value > 99) {
            alert('PK戦スコアを0から99の間で入力してください。');
            return;
        }
        if (awayClubPKScore.value < 0 || awayClubPKScore.value > 99) {
            alert('PK戦スコアを0から99の間で入力してください。');
            return;
        }

        // 両チームのPK戦スコアが0の場合はPK戦がないと判断して良いか確認
        if (homeClubPKScore.value === 0 && awayClubPKScore.value === 0) {
            alert('PK戦が「あり」になっていますが、両チームのPK戦スコアが0です。PK戦の有無を確認してください。');
            return;
        }
    }

    if (!confirm('試合結果を登録してよろしいですか？')) {
        return;
    }

    // ここから結果登録処理
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/register_match_result`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            actualMatchStartTime: actualMatchStartTime.value,
            hasPK: hasPK.value,
            homeClubFinalScore: homeClubFinalScore.value,
            homeClubPKScore: hasPK.value ? homeClubPKScore.value : 0,
            awayClubFinalScore: awayClubFinalScore.value,
            awayClubPKScore: hasPK.value ? awayClubPKScore.value : 0,
            isDelayed: isDelayed.value
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 成功時の処理を追加
        alert('正常に試合結果を登録しました。自動でこのウィンドウを閉じます。閉じない場合、手動で閉じてください。');
        window.close();
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = '試合結果の登録に失敗しました。'
    } finally {
        isProcessing.value = false;
    }
};

// 試合延期登録
const registerMatchDelay = async () => {
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/register_match_delay`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
        };

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 成功時の処理を追加
        alert('正常に試合延期を登録しました。自動でこのウィンドウを閉じます。閉じない場合、手動で閉じてください。');
        window.close();
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合延期の登録に失敗しました。';
    } finally {
        isProcessing.value = false;
    }
}

onMounted(async () => {
    // 結果入力対象試合のデータを取得する
    await getTargetMatchInfo()
});

// CSS
const btnBase = 'min-w-1/3 w-1/3 text-white p-2 rounded-md mx-auto my-5';
</script>

<template>
<div>
    <div v-if="isLoading">
        <img src="../../assets/icons/loading_processing.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        <p class="text-center">読み込み中</p>
    </div>
    <div v-else-if="isProcessing">
        <img src="../../assets/icons/loading_processing.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        <p class="text-center">処理中</p>
    </div>
    <div v-else-if="targetMatchInfo.matchDetail.is_result_registered">
        <p>この試合の結果はすでに登録されています。ウィンドウを閉じてください。</p>
    </div>
    <div v-else>
        <div v-if="errorMessage">
            {{ errorMessage }}
        </div>
        <div v-else class="text-center">
            <div>
                <p>{{ targetMatchInfo.championshipName }}</p>
                <p>{{ targetMatchInfo.round }}{{ targetMatchInfo.match }}</p>
                <div class="my-4">
                    <p>試合年月日：{{ formattedMatchDate }}</p>
                    <p>開始予定時刻：{{ targetMatchInfo.matchDetail.scheduled_match_start_time }}</p>
                    <p>会場：{{ targetMatchInfo.matchDetail.venue }}</p>
                </div>
                <div class="flex flex-row justify-center">
                    <p class="w-48 break-words">{{ targetMatchInfo.matchDetail.home_club.club_name }}</p>
                    <p class="w-4 mx-2">対</p>
                    <p class="w-48 break-words">{{ targetMatchInfo.matchDetail.away_club.club_name }}</p>
                </div>
            </div>
            <div class="my-4 w-98 mx-auto flex flex-col border-1 border-gray-400 rounded-md">
                <p class="p-1 bg-green-200 font-bold text-xl rounded-t-md">試合結果入力</p>
                <form @submit.prevent="registerMatchResult">
                    <div class="h-15">
                        <p class="w-full bg-gray-200">実際の試合開始時刻</p>
                        <input type="time" v-model="actualMatchStartTime" class="mt-2"/>
                    </div>
                    <div class="my-4 h-15">
                        <p class="w-full bg-gray-200">PK戦の有無</p>
                        <div class="flex flex-row justify-center mt-2">
                            <div class="mx-4">
                                <input type="radio" id="hasPKRadio1" v-model="hasPK" :value="true" />
                                <label for="hasPKRadio1">あり</label>
                            </div>
                            <div class="mx-4">
                                <input type="radio" id="hasPKRadio2" v-model="hasPK" :value="false" />
                                <label for="hasPKRadio2">なし</label>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row w-full">
                        <div class="w-1/2">
                            <p class="bg-amber-100 border-1 border-gray-200 py-2">{{ targetMatchInfo.matchDetail.home_club.club_name }}</p>
                            <div class="p-4 bg-amber-50 border-1 border-gray-200">
                                <div>
                                    <p>最終スコア</p>
                                    <input type="number" min="0" max="99" v-model="homeClubFinalScore" class="px-4 py-2 text-center bg-white" />
                                </div>
                                <Transition
                                    enter-active-class="transition-opacity duration-500"
                                    enter-from-class="opacity-0"
                                    enter-to-class="opacity-100"
                                    leave-active-class="transition-opacity duration-200"
                                    leave-from-class="opacity-100"
                                    leave-to-class="opacity-0"
                                >
                                    <div v-if="hasPK" class="mt-4">
                                        <p>PK戦スコア</p>
                                        <input type="number" min="0" max="99" v-model="homeClubPKScore" class="px-4 py-2 text-center bg-white" />
                                    </div>
                                </Transition>
                            </div>
                        </div>
                        <div class="w-1/2">
                            <p class="bg-blue-100 border-1 border-gray-200 py-2">{{ targetMatchInfo.matchDetail.away_club.club_name }}</p>
                            <div class="p-4 bg-blue-50 border-1 border-gray-200">
                                <div>
                                    <p>最終スコア</p>
                                    <input type="number" min="0" max="99" v-model="awayClubFinalScore" class="px-4 py-2 text-center bg-white" />
                                </div>
                                <Transition
                                    enter-active-class="transition-opacity duration-600"
                                    enter-from-class="opacity-0"
                                    enter-to-class="opacity-100"
                                    leave-active-class="transition-opacity duration-200"
                                    leave-from-class="opacity-100"
                                    leave-to-class="opacity-0"
                                >
                                    <div v-if="hasPK" class="mt-4">
                                        <p>PK戦スコア</p>
                                        <input type="number" min="0" max="99" v-model="awayClubPKScore" class="px-4 py-2 text-center bg-white" />
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                    <div :class="btnBase" class="bg-blue-500">
                        <button type="submit">試合結果登録</button>
                    </div>
                </form>
            </div>
            <div class="my-4 w-98 mx-auto">
                <p>または、この試合の延期を登録します。</p>
                <div class="flex flex-row justify-center mt-2">
                    <div class="mx-4">
                        <input type="radio" id="isDelayedRadio1" v-model="isDelayed" :value="true" />
                        <label for="isDelayedRadio1">はい</label>
                    </div>
                    <div class="mx-4">
                        <input type="radio" id="isDelayedRadio2" v-model="isDelayed" :value="false" />
                        <label for="isDelayedRadio2">いいえ</label>
                    </div>
                </div>
                <form @submit.prevent="registerMatchDelay">
                    <div :class="[btnBase, isDelayed ? 'bg-amber-600' : 'bg-gray-400 cursor-not-allowed']">
                        <button type="submit" :disabled="!isDelayed">延期登録</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped></style>