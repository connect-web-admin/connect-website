<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import RegisterScoreModal from '@/components/RegisterScoreModal.vue';
import RegisterMatchResultModal from '@/components/RegisterMatchResultModal.vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';

// ルーティングで渡されたパラメータを取得
const route = useRoute();

// REST APIで使う認証トークンを取得
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH);

// 読み込み中・処理中の画面切り替え用フラグ
const isLoading = ref(false);
const isProcessing = ref(false);

// モーダル表示用のフラグ
const showHomeClubPlusModal = ref(false);
const showAwayClubPlusModal = ref(false);
const showHomeClubMinusModal = ref(false);
const showAwayClubMinusModal = ref(false);
const showMatchResultModal = ref(false);

// 速報画面の初期状態
const targetMatchInfo = ref({}) // おおもとの試合情報
const championshipName = ref(''); // 大会名
const round = ref(''); // ラウンド
const match = ref(''); // 試合
const matchDate = ref(''); // 試合日
const scheduledMatchStartTime = ref(''); // 予定試合開始時刻
const homeClubName = ref(''); // ホームクラブ名
const awayClubName = ref(''); // アウェイクラブ名
const venue = ref(''); // 会場
const isLeague = ref(false); // リーグ戦フラグ
const isResultRegistered = ref(false); // 試合結果登録済みフラグ
const gameStatus = ref(''); // 試合進行状況。試合前、前半、後半、試合終了のいずれかが入る

// 試合結果入力フォームのデータを格納する
const isDelayed = ref(false); // 試合順延フラグ
const championshipId = route.params.championshipId; // 大会ID ルーティング時にパラメタで渡される
const matchId = route.params.matchId; // 試合ID ルーティング時にパラメタで渡される
const actualMatchStartTime = ref(''); // 実際の試合開始時刻
const hasExtraHalves = ref(false); // 延長戦有無
const hasPK = ref(false); // PK戦有無
const isHome = ref(true); // ホームクラブかどうか 
const isAway = ref(true); // アウェイクラブかどうか。isHomeの真偽地を使えば良いが、直感的に理解しやすくするために追加
const isPlusScore = ref(true); // 得点追加フラグ
const isMinusScore = ref(true); // 得点減少フラグ

const homeClubFirstHalfScore = ref(0); // ホームクラブの前半得点
const homeClubSecondHalfScore = ref(0); // ホームクラブの後半得点
const homeClubExtraFirstHalfScore = ref(0); // ホームクラブの延長前半得点
const homeClubExtraSecondHalfScore = ref(0); // ホームクラブの延長後半得点
const homeClubFinalScore = ref(0); // ホームクラブの得点
const homeClubPKScore = ref(0); // ホームクラブのPK戦スコア
const awayClubFirstHalfScore = ref(0); // アウェイクラブの前半得点
const awayClubSecondHalfScore = ref(0); // アウェイクラブの後半得点
const awayClubExtraFirstHalfScore = ref(0); // アウェイクラブの延長前半得点
const awayClubExtraSecondHalfScore = ref(0); // アウェイクラブの延長後半得点
const awayClubFinalScore = ref(0); // アウェイクラブの得点
const awayClubPKScore = ref(0); // アウェイクラブのPK戦スコア

// エラーメッセージを格納する
const errorMessage = ref('');

// 試合日をフォーマット YYYY-MM-DDからMM/DDに変換
const formattedMatchDate = computed(() => {
    if (!matchDate.value) {
        return '';
    }

    const dateParts = matchDate.value.split('-'); // YYYY-MM-DDを[YYYY, MM, DD]に分割
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    const formattedDate = `${month}/${day}`;

    return formattedDate;
});

// ブラウザの合計欄に表示する得点
const homeScore = computed(() => {
    if (hasExtraHalves.value) {
        return homeClubFirstHalfScore.value + homeClubSecondHalfScore.value + homeClubExtraFirstHalfScore.value + homeClubExtraSecondHalfScore.value;
    } else {
        return homeClubFirstHalfScore.value + homeClubSecondHalfScore.value;
    }
});
const awayScore = computed(() => {
    if (hasExtraHalves.value) {
        return awayClubFirstHalfScore.value + awayClubSecondHalfScore.value + awayClubExtraFirstHalfScore.value + awayClubExtraSecondHalfScore.value;
    } else {
        return awayClubFirstHalfScore.value + awayClubSecondHalfScore.value;
    }
});

// ユーザーが時間を変更したときに selectedTime を更新
const setActualMatchStartTime = (event) => {
    actualMatchStartTime.value = event.target.value;
};

/**
 * 結果入力対象の試合情報を取得する
 */
const getTargetMatchInfo = async () => {
    isLoading.value = true
    errorMessage.value = '' // エラーメッセージをリセット

    // 試合情報取得用のURLを作成
    // 試合を絞り込むために年度とIDをクエリパラメータに含める
    const queryUrl = new URL(`${MATCH_API_URL}/target-match`);
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
        
        const data = await response.json();
        targetMatchInfo.value = data;
        championshipName.value = data['championship_name'];
        isLeague.value = data['is_league'];
        round.value = data['round'];
        match.value = data['match'];
        venue.value = data['match_detail']['venue'];
        isResultRegistered.value = data['match_detail']['is_result_registered'];
        matchDate.value = data['match_detail']['match_date'];
        scheduledMatchStartTime.value = data['match_detail']['scheduled_match_start_time'];
        gameStatus.value = data['match_detail']['game_status'];
        homeClubName.value = data['match_detail']['home_club']['club_name'];
        homeClubFirstHalfScore.value = data['match_detail']['home_club']['first_half_score'];
        homeClubSecondHalfScore.value = data['match_detail']['home_club']['second_half_score'];
        homeClubFinalScore.value = data['match_detail']['home_club']['final_score'];
        awayClubName.value = data['match_detail']['away_club']['club_name'];
        awayClubFirstHalfScore.value = data['match_detail']['away_club']['first_half_score'];
        awayClubSecondHalfScore.value = data['match_detail']['away_club']['second_half_score'];  
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合データの取得に失敗しました。';
    } finally {
        isLoading.value = false;
    }
};

/**
 * 得点を追加
 */
const plusScore = async (homeOrAway) => {
    // ここから結果登録処理
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/plus-score`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            homeOrAway: homeOrAway,
            gameStatus: gameStatus.value
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        location.reload();
    } catch (error) {
        console.error('Error details:', error)
    } finally {
        isProcessing.value = false;
    }
}

const minusScoreValidation = (homeOrAway) => {
    if (homeOrAway === 'home') {
        if ((gameStatus.value === '前半' && homeClubFirstHalfScore.value < 1) ||
            (gameStatus.value === '後半' && homeClubSecondHalfScore.value < 1 ) ||
            (gameStatus.value === '延長前半' && homeClubExtraFirstHalfScore.value < 1 ) ||
            (gameStatus.value === '延長後半' && homeClubExtraSecondHalfScore.value < 1 )            
        ) {
            alert("取り消す得点がありません。");
            return;
        } else {
            showHomeClubMinusModal.value = true;
        }
    } else if (homeOrAway === 'away') {
        if ((gameStatus.value === '前半' && awayClubFirstHalfScore.value < 1) ||
            (gameStatus.value === '後半' && awayClubSecondHalfScore.value < 1 ) ||
            (gameStatus.value === '延長前半' && awayClubExtraFirstHalfScore.value < 1 ) ||
            (gameStatus.value === '延長後半' && awayClubExtraSecondHalfScore.value < 1 )            
        ) {
            alert("取り消す得点がありません。");
            return;
        } else {
            showAwayClubMinusModal.value = true;
        }
    }
}

/**
 * 得点を取り消し
 */
const minusScore = async (homeOrAway) => {
    // ここから結果登録処理
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/minus-score`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            homeOrAway: homeOrAway,
            gameStatus: gameStatus.value
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        location.reload();
    } catch (error) {
        console.error('Error details:', error)
    } finally {
        isProcessing.value = false;
    }
}

/**
 * 試合状況進行・後退
 */
const handleGameStatus = async (direction) => {
    // if (direction === 'next') {
    //     if (!confirm("試合状況を進行します。よろしいですか？")) {
    //         return;
    //     }
    // } else if (direction === 'prev') {
    //     if (!confirm("試合状況を戻します。よろしいですか？")) {
    //         return;
    //     }        
    // }

    // ここから試合状況変更処理
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/handle-game-status`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            direction: direction // 引数で文字列nextかprevが入ってくる
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        location.reload();
    } catch (error) {
        console.error('Error details:', error)
    } finally {
        isProcessing.value = false;
    }
}

/**
 * 試合結果登録
 */
const registerMatchResult = async () => {
    // 試合結果登録のバリデーション
    if (!actualMatchStartTime.value) {
        alert('実際の試合開始時刻を入力してください。');
        return;
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

/**
 * 試合延期登録
 */
const registerMatchDelay = async () => {
    isProcessing.value = true;

    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-match-delay`);

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
const textClubName = 'text-xl border-1 border-gray-200 py-2';
const scoreInputBg = 'p-4 border-b-1 border-black';
const scoringOpenModal = 'text-4xl';
const scoringBtn = 'w-12 h-10';
// const cursorScringBtnLeftSide = 'w-0 h-0 border-y-8 border-l-8 border-y-transparent border-red-400';
// const cursorScringBtnRighttSide = 'w-0 h-0 border-y-8 border-r-8 border-y-transparent border-red-400';
const minusScoring = 'mt-10 mb-2';
const gameStatusBtn = 'w-full px-3 py-1 bg-gray-100 border-1 border-gray-400 rounded-md';
const registerBtnBase = 'min-w-[150px] w-2/5 w-1/3 text-white text-xl py-2 px-4 rounded-md mx-auto my-5';
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
    <div v-else>
        <div v-if="errorMessage">
            {{ errorMessage }}
        </div>
        <div v-else class="text-center">
            <div>
                <p>{{ championshipName }}</p>
                <p>{{ round }}{{ match }}</p>
                <p>試合日時：{{ formattedMatchDate }} - {{ scheduledMatchStartTime }}</p>
                <p>会場：{{ venue }}</p>
                <div class="flex flex-row justify-center">
                    <p class="w-48 break-words text-right">{{ homeClubName }}</p>
                    <p class="w-4 mx-2">vs</p>
                    <p class="w-48 break-words text-left">{{ awayClubName }}</p>
                </div>
            </div>
            <div class="mt-5 mb-10">
                <p class="py-1 font-bold text-xl border-t-1 border-b-1 border-black">試合速報入力</p>
                <div class="border-b-1 border-black">
                    <label for="match-time"><p class="bg-gray-200">実際の試合開始時刻</p></label>
                    <div class="flex items-center justify-center h-10 bg-cyan-50">
                        <input type="time" id="match-time" :value="scheduledMatchStartTime" @input="setActualMatchStartTime" />
                    </div>
                </div>
                <div class="flex flex-row justify-center items-center gap-5 py-3 bg-green-100 border-b-1 border-black">
                    <div class="text-right w-[90px]"> 
                        <button type="button" v-if="gameStatus === '前半'" @click="handleGameStatus('prev')" :class="gameStatusBtn">試合前</button>
                        <button type="button" v-else-if="gameStatus === '後半'" @click="handleGameStatus('prev')" :class="gameStatusBtn">前半</button>
                        <button type="button" v-else-if="gameStatus === '試合終了'" @click="handleGameStatus('prev')" :class="gameStatusBtn">後半</button>
                    </div>
                    <div v-if="gameStatus === '試合前'" class="w-[10px]"></div>
                    <div v-else class="w-0 h-0 border-y-8 border-r-8 border-y-transparent border-r-red-400 bg-green-100"></div>
                    <div class="w-[90px]">
                        <span class="text-lg font-bold italic">{{ gameStatus }}</span>
                    </div>
                    <div v-if="gameStatus === '試合終了'" class="w-[10px]"></div>
                    <div v-else class="w-0 h-0 border-y-8 border-l-8 border-y-transparent border-l-red-400 bg-green-100"></div>
                    <div class="text-left w-[90px]">
                        <button type="button" v-if="gameStatus === '試合前'" @click="handleGameStatus('next')" :class="gameStatusBtn">前半</button>
                        <button type="button" v-else-if="gameStatus === '前半'" @click="handleGameStatus('next')" :class="gameStatusBtn">後半</button>
                        <button type="button" v-else-if="gameStatus === '後半'" @click="handleGameStatus('next')" :class="gameStatusBtn">試合終了</button>
                    </div>
                </div>

                <div class="flex flex-row">
                    <div class="w-1/2">
                        <p :class="textClubName" class="bg-blue-100">{{ homeClubName }}</p>
                        <div :class="scoreInputBg" class="bg-blue-50">
                            <button type="button" @click="showHomeClubPlusModal = true" :class="scoringBtn" class="bg-[#FAFAFC] h-[50px] border-1 border-red-400 rounded-md">
                                <span :class="scoringOpenModal">{{ homeScore }}</span>
                            </button>
                            <Teleport to="body">
                                <!-- use the modal component, pass in the prop -->
                                <register-score-modal
                                    :show="showHomeClubPlusModal"
                                    :is-home="isHome"
                                    :is-plus-score="isPlusScore"
                                    @close="showHomeClubPlusModal = false"
                                    @plus-score="plusScore"
                                >
                                    <template v-slot:body>
                                        <p><span class="text-red-500 font-bold">{{ homeClubName }}</span>に１点を追加します。<br />よろしいですか？</p>
                                    </template>
                                </register-score-modal>
                            </Teleport>
                        </div>
                        <div :class="minusScoring">
                            <button type="button" @click="minusScoreValidation('home')" class="px-2 bg-gray-400 text-white rounded-sm">得点取り消し</button>
                            <Teleport to="body">
                                <!-- use the modal component, pass in the prop -->
                                <register-score-modal
                                    :show="showHomeClubMinusModal"
                                    :is-home="isHome"
                                    :is-minus-score="isMinusScore"
                                    @close="showHomeClubMinusModal = false"
                                    @minus-score="minusScore"
                                >
                                    <template v-slot:body>
                                        <p><span class="text-red-500 font-bold">{{ homeClubName }}</span>の１点を取り消します。<br />よろしいですか？</p>
                                    </template>
                                </register-score-modal>
                            </Teleport>
                        </div>
                    </div>
                    <div class="w-1/2">
                        <p :class="textClubName" class="bg-amber-100">{{ awayClubName }}</p>
                        <div :class="scoreInputBg" class="bg-amber-50">
                            <button type="button" @click="showAwayClubPlusModal = true" :class="scoringBtn" class="bg-[#FAFAFC] h-[50px] border-1 border-red-400 rounded-md">
                                <span :class="scoringOpenModal">{{ awayScore }}</span>
                            </button>
                            <Teleport to="body">
                                <register-score-modal
                                    :show="showAwayClubPlusModal"
                                    :is-away="isAway"
                                    :is-plus-score="isPlusScore"
                                    @close="showAwayClubPlusModal = false"
                                    @plus-score="plusScore"
                                >
                                    <template v-slot:body>
                                        <p><span class="text-red-500 font-bold">{{ awayClubName }}</span>に１点を追加します。<br />よろしいですか？</p>
                                    </template>
                                </register-score-modal>
                            </Teleport>
                        </div>
                        <div :class="minusScoring">
                            <button type="button" @click="minusScoreValidation('away')"  class="px-2 bg-gray-400 text-white rounded-sm">得点取り消し</button>
                            <Teleport to="body">
                                <register-score-modal
                                    :show="showAwayClubMinusModal"
                                    :is-away="isAway"
                                    :is-minus-score="isMinusScore"
                                    @close="showAwayClubMinusModal = false"
                                    @minus-score="minusScore"
                                >
                                    <template v-slot:body>
                                        <p><span class="text-red-500 font-bold">{{ awayClubName }}</span>の１点を取り消します。<br />よろしいですか？</p>
                                    </template>
                                </register-score-modal>
                            </Teleport>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-xl mt-2">
                        <p>{{ homeClubFirstHalfScore }}　前半　{{ awayClubFirstHalfScore }}</p>
                        <p>{{ homeClubSecondHalfScore }}　後半　{{ awayClubSecondHalfScore }}</p>
                        <p>{{ homeScore }}　合計　{{ awayScore }}</p>
                    </div>
                </div>
                <div :class="registerBtnBase" class="mt-10 bg-blue-600">
                    <button type="button" @click="showMatchResultModal = true">試合結果登録</button>
                    <Teleport to="body">
                        <!-- use the modal component, pass in the prop -->
                        <register-match-result-modal
                            :show="showMatchResultModal"
                            @close="showMatchResultModal = false"
                        >
                            <template v-slot:body>
                                <p>試合結果を登録します。よろしいですか？</p>
                            </template>
                        </register-match-result-modal>
                    </Teleport>
                </div>
            </div>
            <div class="py-10 border-t-1 border-black">
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
                    <div :class="[registerBtnBase, isDelayed ? 'bg-amber-600' : 'bg-gray-300 cursor-not-allowed']">
                        <button type="button" :disabled="!isDelayed">延期登録</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <CopyrightComp />
</div>
</template>

<style scoped></style>