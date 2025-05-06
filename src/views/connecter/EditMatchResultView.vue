<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MATCH_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const router = useRouter();
const accessToken = localStorage.getItem('accessToken');
const returnPath = localStorage.getItem('path');

// 読み込み中・処理中の画面切り替え用フラグ
const isLoading = ref(false);

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
const gameStatus = ref('');// 試合進行状況。試合前、前半、後半、延長前半、延長後半、PK戦、試合終了のいずれかが入る

// 試合結果入力フォームのデータを格納する
const championshipId = route.params.championshipId; // 大会ID ルーティング時にパラメタで渡される
const matchId = route.params.matchId; // 試合ID ルーティング時にパラメタで渡される
const hasExtraHalves = ref(false); // 延長戦有無
const hasPk = ref(false); // PK戦有無
const actualMatchStartTime = ref(''); // 実際の試合開始時刻
const actualMatchStartTimeEdit = ref(''); // 実際の試合開始時刻
const homeClubFirstHalfScore = ref(0); // ホームクラブの前半得点
const homeClubSecondHalfScore = ref(0); // ホームクラブの後半得点
const homeClubExtraFirstHalfScore = ref(0); // ホームクラブの延長前半得点
const homeClubExtraSecondHalfScore = ref(0); // ホームクラブの延長後半得点
const homeClubFinalScore = ref(0); // ホームクラブの得点
const homeClubPkScore = ref(0); // ホームクラブのPK戦スコア
const homeClubPkScoreList = ref([]); // ホームクラブのPK戦スコアリスト
const awayClubFirstHalfScore = ref(0); // アウェイクラブの前半得点
const awayClubSecondHalfScore = ref(0); // アウェイクラブの後半得点
const awayClubExtraFirstHalfScore = ref(0); // アウェイクラブの延長前半得点
const awayClubExtraSecondHalfScore = ref(0); // アウェイクラブの延長後半得点
const awayClubFinalScore = ref(0); // アウェイクラブの得点
const awayClubPkScore = ref(0); // アウェイクラブのPK戦スコア
const awayClubPkScoreList = ref([]); // アウェイクラブのPK戦スコアリスト

const hasExtraHalvesEdit = ref(false); // 延長戦有無
const hasPkEdit = ref(false); // PK戦有無
const homeClubFirstHalfScoreEdit = ref(0); // 初期値を設定
const homeClubSecondHalfScoreEdit = ref(0); // 初期値を設定
const homeClubExtraFirstHalfScoreEdit = ref(0); // 初期値を設定
const homeClubExtraSecondHalfScoreEdit = ref(0); // 初期値を設定
const homeClubPkScoreEdit = ref(0); // 初期値を設定
const homeClubPkScoreListEdit = ref([]); // 初期値を設定
const awayClubFirstHalfScoreEdit = ref(0); // 初期値を設定
const awayClubSecondHalfScoreEdit = ref(0); // 初期値を設定
const awayClubExtraFirstHalfScoreEdit = ref(0); // 初期値を設定
const awayClubExtraSecondHalfScoreEdit = ref(0); // 初期値を設定
const awayClubPkScoreEdit = ref(0); // 初期値を設定
const awayClubPkScoreListEdit = ref([]); // 初期値を設定

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
                'Content-Type': 'application/json'
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
        hasExtraHalves.value = data['match_detail']['has_extra_halves'];
        hasPk.value = data['match_detail']['has_pk'];
        matchDate.value = data['match_detail']['match_date'];
        scheduledMatchStartTime.value = data['match_detail']['scheduled_match_start_time'];
        gameStatus.value = data['match_detail']['game_status'];
        actualMatchStartTime.value = data['match_detail']['actual_match_start_time'];

        homeClubName.value = data['match_detail']['home_club']['club_name'];
        homeClubFirstHalfScore.value = data['match_detail']['home_club']['first_half_score'];
        homeClubSecondHalfScore.value = data['match_detail']['home_club']['second_half_score'];
        homeClubExtraFirstHalfScore.value = data['match_detail']['home_club']['extra_first_half_score'];
        homeClubExtraSecondHalfScore.value = data['match_detail']['home_club']['extra_second_half_score'];
        homeClubFinalScore.value = data['match_detail']['home_club']['final_score'];
        homeClubPkScore.value = data['match_detail']['home_club']['pk_score'];
        homeClubPkScoreList.value = data['match_detail']['home_club']['pk_score_list'];
        awayClubName.value = data['match_detail']['away_club']['club_name'];
        awayClubFirstHalfScore.value = data['match_detail']['away_club']['first_half_score'];
        awayClubSecondHalfScore.value = data['match_detail']['away_club']['second_half_score'];
        awayClubExtraFirstHalfScore.value = data['match_detail']['away_club']['extra_first_half_score'];
        awayClubExtraSecondHalfScore.value = data['match_detail']['away_club']['extra_second_half_score'];
        awayClubFinalScore.value = data['match_detail']['away_club']['final_score'];
        awayClubPkScore.value = data['match_detail']['away_club']['pk_score'];
        awayClubPkScoreList.value = data['match_detail']['away_club']['pk_score_list'];

        // 編集用の変数を現在の値で初期化
        homeClubFirstHalfScoreEdit.value = homeClubFirstHalfScore.value;
        homeClubSecondHalfScoreEdit.value = homeClubSecondHalfScore.value;
        homeClubExtraFirstHalfScoreEdit.value = homeClubExtraFirstHalfScore.value;
        homeClubExtraSecondHalfScoreEdit.value = homeClubExtraSecondHalfScore.value;
        homeClubPkScoreEdit.value = homeClubPkScore.value;
        homeClubPkScoreListEdit.value = [...homeClubPkScoreList.value];
        awayClubFirstHalfScoreEdit.value = awayClubFirstHalfScore.value;
        awayClubSecondHalfScoreEdit.value = awayClubSecondHalfScore.value;
        awayClubExtraFirstHalfScoreEdit.value = awayClubExtraFirstHalfScore.value;
        awayClubExtraSecondHalfScoreEdit.value = awayClubExtraSecondHalfScore.value;
        awayClubPkScoreEdit.value = awayClubPkScore.value;
        awayClubPkScoreListEdit.value = [...awayClubPkScoreList.value];
        hasExtraHalvesEdit.value = hasExtraHalves.value;
        hasPkEdit.value = hasPk.value;
        actualMatchStartTimeEdit.value = actualMatchStartTime.value;
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合データの取得に失敗しました。';
    } finally {
        isLoading.value = false;
    }
};

// ユーザーが時間を変更したときに selectedTime を更新
const setActualMatchStartTime = (event) => {
    actualMatchStartTimeEdit.value = event.target.value;
};

/**
 * ホームクラブの合計得点を計算する
 */
const homeClubFinalScoreEdit = computed(() => {
    if (hasExtraHalvesEdit.value) {
        return homeClubFirstHalfScoreEdit.value + homeClubSecondHalfScoreEdit.value + homeClubExtraFirstHalfScoreEdit.value + homeClubExtraSecondHalfScoreEdit.value;
    } else {
        return homeClubFirstHalfScoreEdit.value + homeClubSecondHalfScoreEdit.value;
    }
});

/**
 * アウェイクラブの合計得点を計算する
 */
const awayClubFinalScoreEdit = computed(() => {
    if (hasExtraHalvesEdit.value) {
        return awayClubFirstHalfScoreEdit.value + awayClubSecondHalfScoreEdit.value + awayClubExtraFirstHalfScoreEdit.value + awayClubExtraSecondHalfScoreEdit.value;
    } else {
        return awayClubFirstHalfScoreEdit.value + awayClubSecondHalfScoreEdit.value;
    }
});

/**
 * 試合結果を修正する 
 */
const registerEditedMatchResult = async () => {
    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-edited-match-result`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            hasExtraHalvesEdit: hasExtraHalvesEdit.value,
            hasPkEdit: hasPkEdit.value,
            actualMatchStartTimeEdit: actualMatchStartTimeEdit.value,
            homeClubFirstHalfScoreEdit: homeClubFirstHalfScoreEdit.value,
            homeClubSecondHalfScoreEdit: homeClubSecondHalfScoreEdit.value,
            homeClubExtraFirstHalfScoreEdit: homeClubExtraFirstHalfScoreEdit.value,
            homeClubExtraSecondHalfScoreEdit: homeClubExtraSecondHalfScoreEdit.value,
            homeClubFinalScoreEdit: homeClubFinalScoreEdit.value,
            homeClubPkScoreEdit: homeClubPkScoreEdit.value,
            homeClubPkScoreListEdit: homeClubPkScoreListEdit.value,
            awayClubFirstHalfScoreEdit: awayClubFirstHalfScoreEdit.value,
            awayClubSecondHalfScoreEdit: awayClubSecondHalfScoreEdit.value,
            awayClubExtraFirstHalfScoreEdit: awayClubExtraFirstHalfScoreEdit.value,
            awayClubExtraSecondHalfScoreEdit: awayClubExtraSecondHalfScoreEdit.value,
            awayClubFinalScoreEdit: awayClubFinalScoreEdit.value,
            awayClubPkScoreEdit: awayClubPkScoreEdit.value,
            awayClubPkScoreListEdit: awayClubPkScoreListEdit.value,
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

        // 成功時の処理を追加
        alert('試合結果を正常に修正しました。試合検索画面に戻ります。');
        if (accessToken) {
            router.push(`/connecter/select-reporting-match-${returnPath}?access_token=${accessToken}`);
        } else {
            router.push(`/connecter/select-reporting-match-${returnPath}`);
        }
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = '試合結果の登録に失敗しました。'
    }
}

// PK戦の追加ラウンド数を計算
const extraPkRounds = computed(() => {
    // 基本の5回までは常に表示
    const baseRounds = 5;
    const currentHomeLen = homeClubPkScoreListEdit.value.length;
    const currentAwayLen = awayClubPkScoreListEdit.value.length;
    
    // 両チームが5回終わっていない場合は追加ラウンドなし
    if (currentHomeLen < baseRounds || currentAwayLen < baseRounds) {
        return 0;
    }

    // 5回終了時点での両チームの得点を計算
    const homeScoreAtBase = homeClubPkScoreListEdit.value
        .slice(0, baseRounds)
        .filter(r => r === 'success')
        .length;
    const awayScoreAtBase = awayClubPkScoreListEdit.value
        .slice(0, baseRounds)
        .filter(r => r === 'success')
        .length;

    // 5回終了時点で得点が同じ場合、サドンデスに移行
    if (homeScoreAtBase === awayScoreAtBase) {
        // 現在のラウンド数（両チームの短い方に合わせる）
        const currentRound = Math.min(currentHomeLen, currentAwayLen);
        
        // 両チームが同じラウンドを蹴り終わった時点で判定
        if (currentHomeLen === currentAwayLen && currentRound > baseRounds) {
            const homeScore = homeClubPkScoreListEdit.value
                .filter(r => r === 'success')
                .length;
            const awayScore = awayClubPkScoreListEdit.value
                .filter(r => r === 'success')
                .length;
            
            // 得点差がついている場合は、次のラウンドのマスを表示しない
            if (homeScore !== awayScore) {
                return currentRound - baseRounds;
            }
        }
        
        // 両チームが蹴り終わっていないか、得点差がついていない場合は次のラウンドのマスを用意
        return Math.max(currentRound - baseRounds + 1, 1);
    }

    return 0;
});

// PKスコア管理関数
const managePkScore = (team, result) => {
    if (team === 'home') {
        homeClubPkScoreListEdit.value.push(result);
        homeClubPkScoreEdit.value = homeClubPkScoreListEdit.value.filter(r => r === 'success').length;
    } 
    if (team === 'away') {
        awayClubPkScoreListEdit.value.push(result);
        awayClubPkScoreEdit.value = awayClubPkScoreListEdit.value.filter(r => r === 'success').length;
    }
};

// 最後のキックをキャンセル
const cancelLastKick = (team) => {
    if (team === 'home' && homeClubPkScoreListEdit.value.length > 0) {
        homeClubPkScoreListEdit.value.pop();
        homeClubPkScoreEdit.value = homeClubPkScoreListEdit.value.filter(r => r === 'success').length;
    }    
    if (team === 'away' && awayClubPkScoreListEdit.value.length > 0) {
        awayClubPkScoreListEdit.value.pop();
        awayClubPkScoreEdit.value = awayClubPkScoreListEdit.value.filter(r => r === 'success').length;
    }
};

onMounted(async () => {
    // 結果入力対象試合のデータを取得する
    await getTargetMatchInfo();
});

// 共通のクラススタイル定義
const flexRow = 'flex flex-row'
const flexCol = 'flex flex-col'
const flexCenterGap = 'flex justify-center gap-10'
const borderTopBottom = 'border-t-1 border-b-1 border-black'
const pkCellHeader = 'w-[40px] text-center py-1'
const pkCellWithBorder = 'w-[40px] text-center py-1 border-x-[1px] border-gray-300'
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
</script>

<template>
    <div class="max-w-screen-sm mx-auto">
        <div class="mt-8">
            <img src="@/assets/connect-title-logo.svg" alt="コネクト" class="mx-auto">
        </div>
        <div v-if="isLoading" class="mt-20">
            <img src="../../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else>
            <div v-if="errorMessage">
                {{ errorMessage }}
            </div>
            <div v-else class="text-center">
                <div class="flex flex-col items-center">
                    <p>{{ championshipName }}</p>
                    <p>{{ round }}{{ match }}</p>
                    <p>試合日時：{{ formattedMatchDate }} - {{ scheduledMatchStartTime }}</p>
                    <p>会場：{{ venue }}</p>
                    <div class="flex flex-row justify-center">
                        <p class="w-[150px] break-words text-right">{{ homeClubName }}</p>
                        <p class="mx-2">vs</p>
                        <p class="w-[150px] break-words text-left">{{ awayClubName }}</p>
                    </div>
                    <div class="mt-2">
                        <h2>＜修正前結果＞　</h2>
                        <p>{{ homeClubFirstHalfScore }}<span class="mx-2">前半</span>{{ awayClubFirstHalfScore }}</p>
                        <p>{{ homeClubSecondHalfScore }}<span class="mx-2">後半</span>{{ awayClubSecondHalfScore }}</p>
                        <div v-if="hasExtraHalves">
                            <p>{{ homeClubExtraFirstHalfScore }}<span class="mx-2">延長前半</span>{{
                                awayClubExtraFirstHalfScore }}</p>
                            <p>{{ homeClubExtraSecondHalfScore }}<span class="mx-2">延長後半</span>{{
                                awayClubExtraSecondHalfScore }}</p>
                        </div>
                        <p>{{ homeClubFinalScore }}<span class="mx-2">合計</span>{{ awayClubFinalScore }}</p>
                        <div v-if="hasPk">
                            <p>{{ homeClubPkScore }}<span class="mx-2">PK</span>{{ awayClubPkScore }}</p>
                        </div>
                    </div>
                </div>
                <div class="mt-5">
                    <h2 class="py-1 font-bold text-xl border-t-1 border-b-1 border-black">速報内容修正</h2>
                    <div>
                        <div class="flex flex-row border-b-1 border-black">
                            <p class="w-1/2 bg-blue-100">{{ homeClubName }}</p>
                            <p class="w-1/2 bg-amber-100">{{ awayClubName }}</p>
                        </div>
                        <div class="flex flex-row border-b-1 border-black">
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-3/5">前半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="homeClubFirstHalfScoreEdit"
                                            class="bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-3/5">後半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="homeClubSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-3/5">前半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="awayClubFirstHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-3/5">後半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="awayClubSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div :class="[borderTopBottom, 'bg-amber-500 flex flex-row justify-center gap-10 py-2']">
                        <h2>延長戦の有無</h2>
                        <div class="flex flex-row gap-5">
                            <div>
                                <input type="radio" id="hasExtraHalvesEditRadio1" v-model="hasExtraHalvesEdit"
                                    :value="true" name="hasExtraHalvesEdit" />
                                <label for="hasExtraHalvesEditRadio1">あり</label>
                            </div>
                            <div>
                                <input type="radio" id="hasExtraHalvesEditRadio2" v-model="hasExtraHalvesEdit"
                                    :value="false" name="hasExtraHalvesEdit" />
                                <label for="hasExtraHalvesEditRadio2">なし</label>
                            </div>
                        </div>
                    </div>
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="hasExtraHalvesEdit" class="flex flex-row border-b-1 border-black">
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-3/5">延長前半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="homeClubExtraFirstHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-3/5">延長後半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="homeClubExtraSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-3/5">延長前半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="awayClubExtraFirstHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-3/5">延長後半得点</p>
                                    <div class="w-2/5">
                                        <select v-model="awayClubExtraSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 31" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div :class="[borderTopBottom, 'bg-green-200 text- flex flex-row justify-center gap-10 py-2']">
                        <h2>PK戦の有無</h2>
                        <div class="flex flex-row gap-5">
                            <div>
                                <input type="radio" id="hasPkEditRadio1" v-model="hasPkEdit" :value="true"
                                    name="hasPkEdit" />
                                <label for="hasPkEditRadio1">あり</label>
                            </div>
                            <div>
                                <input type="radio" id="hasPkEditRadio2" v-model="hasPkEdit" :value="false"
                                    name="hasPkEdit" />
                                <label for="hasPkEditRadio2">なし</label>
                            </div>
                        </div>
                    </div>
                    <!-- PK戦のスコア登録 -->
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="hasPkEdit" class="border-b-1 border-black py-2">
                            <!-- 操作ボタン -->
                            <div :class="[flexCenterGap, 'mb-4']">
                                <div :class="[flexCol, 'items-center']">
                                    <p class="text-md mb-1">{{ homeClubName }}</p>
                                    <div class="flex gap-3">
                                        <button @click="managePkScore('home', 'success')"
                                            class="bg-green-500 text-white px-3 py-1 rounded">
                                            ○
                                        </button>
                                        <button @click="managePkScore('home', 'failure')"
                                            class="bg-red-500 text-white px-3 py-1 rounded">
                                            ×
                                        </button>
                                        <button @click="cancelLastKick('home')"
                                            class="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                                            取消
                                        </button>
                                    </div>
                                </div>

                                <div :class="[flexCol, 'items-center']">
                                    <p class="text-md mb-1">{{ awayClubName }}</p>
                                    <div class="flex gap-3">
                                        <button @click="managePkScore('away', 'success')"
                                            class="bg-green-500 text-white px-3 py-1 rounded">
                                            ○
                                        </button>
                                        <button @click="managePkScore('away', 'failure')"
                                            class="bg-red-500 text-white px-3 py-1 rounded">
                                            ×
                                        </button>
                                        <button @click="cancelLastKick('away')"
                                            class="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                                            取消
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- PK結果表示テーブル -->
                            <div v-if="hasPkEdit" class="w-full flex flex-col items-center mt-5">
                                <div class="w-full overflow-x-auto">
                                    <table class="min-w-max pb-[5px] border-collapse mx-auto">
                                        <thead>
                                            <tr>
                                                <th
                                                    class="w-[120px] sticky left-0 z-10 bg-white border border-slate-300 h-[50px] font-bold text-center">
                                                    クラブ名</th>
                                                <!-- 基本の5キック -->
                                                <th v-for="i in 5" :key="i"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 font-bold text-center">
                                                    {{ i }}</th>
                                                <!-- 追加キック（サドンデス）用の列 -->
                                                <th v-for="i in extraPkRounds" :key="i + 5"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 font-bold text-center">
                                                    {{ i + 5 }}</th>
                                                <th
                                                    class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] font-bold text-center">
                                                    合計</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- ホームクラブの行 -->
                                            <tr>
                                                <td
                                                    class="w-[120px] sticky left-0 z-10 bg-blue-100 border border-slate-300 h-[50px] text-center">
                                                    {{ homeClubName }}</td>
                                                <!-- 基本の5キック -->
                                                <td v-for="i in 5" :key="i"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                                    <span v-if="homeClubPkScoreListEdit[i - 1] === 'success'"
                                                        class="text-green-600 font-bold">○</span>
                                                    <span v-else-if="homeClubPkScoreListEdit[i - 1] === 'failure'"
                                                        class="text-red-600 font-bold text-[1.25rem]">×</span>
                                                </td>
                                                <!-- 追加キック（サドンデス）用の列 -->
                                                <td v-for="i in extraPkRounds" :key="i + 5"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                                    <span v-if="homeClubPkScoreListEdit[i + 4] === 'success'"
                                                        class="text-green-600 font-bold">○</span>
                                                    <span v-else-if="homeClubPkScoreListEdit[i + 4] === 'failure'"
                                                        class="text-red-600 font-bold">×</span>
                                                </td>
                                                <td
                                                    class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] text-center">
                                                    {{ homeClubPkScoreEdit }}</td>
                                            </tr>
                                            <!-- アウェイクラブの行 -->
                                            <tr>
                                                <td
                                                    class="w-[120px] sticky left-0 z-10 bg-amber-100 border border-slate-300 h-[50px] text-center">
                                                    {{ awayClubName }}</td>
                                                <!-- 基本の5キック -->
                                                <td v-for="i in 5" :key="i"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                                    <span v-if="awayClubPkScoreListEdit[i - 1] === 'success'"
                                                        class="text-green-600 font-bold">○</span>
                                                    <span v-else-if="awayClubPkScoreListEdit[i - 1] === 'failure'"
                                                        class="text-red-600 font-bold text-[1.25rem]">×</span>
                                                </td>
                                                <!-- 追加キック（サドンデス）用の列 -->
                                                <td v-for="i in extraPkRounds" :key="i + 5"
                                                    class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                                    <span v-if="awayClubPkScoreListEdit[i + 4] === 'success'"
                                                        class="text-green-600 font-bold">○</span>
                                                    <span v-else-if="awayClubPkScoreListEdit[i + 4] === 'failure'"
                                                        class="text-red-600 font-bold">×</span>
                                                </td>
                                                <td
                                                    class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] text-center">
                                                    {{ awayClubPkScoreEdit }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div class="border-t-1 border-b-1 border-black">
                        <label for="match-time">
                            <p class="bg-gray-200">実際の試合開始時刻</p>
                        </label>
                        <div class="flex items-center justify-center h-10">
                            <input type="time" id="match-time" :value="actualMatchStartTime"
                                @input="setActualMatchStartTime" />
                        </div>
                    </div>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div class="my-2">
                        <h2>＜修正後結果＞　</h2>
                        <p>{{ homeClubFirstHalfScoreEdit }}<span class="mx-2">前半</span>{{ awayClubFirstHalfScoreEdit }}</p>
                        <p>{{ homeClubSecondHalfScoreEdit }}<span class="mx-2">後半</span>{{ awayClubSecondHalfScoreEdit }}</p>
                        <div v-if="hasExtraHalvesEdit">
                            <p>{{ homeClubExtraFirstHalfScoreEdit }}<span class="mx-2">延長前半</span>{{
                                awayClubExtraFirstHalfScoreEdit }}</p>
                            <p>{{ homeClubExtraSecondHalfScoreEdit }}<span class="mx-2">延長後半</span>{{
                                awayClubExtraSecondHalfScoreEdit }}</p>
                        </div>
                        <p>{{ homeClubFinalScoreEdit }}<span class="mx-2">合計</span>{{ awayClubFinalScoreEdit }}</p>
                        <div v-if="hasPkEdit">
                            <p>{{ homeClubPkScoreEdit }}<span class="mx-2">PK</span>{{ awayClubPkScoreEdit }}</p>
                        </div>
                    </div>
                    <div>
                        <button type="button" @click="registerEditedMatchResult"
                            class="bg-blue-600 px-3 py-1 rounded-md">
                            <span class="text-md bg-blue-600 text-white">修正登録</span>
                        </button>
                    </div>
                </div>
            </div>
            <router-link v-if="accessToken" :to="`/connecter/select-reporting-match-${returnPath}?access_token=${accessToken}`"
                class="block text-center text-blue-600 underline mt-50">速報対象試合検索画面に戻る</router-link>
            <router-link v-else :to="`/connecter/select-reporting-match-${returnPath}`"
                class="block text-center text-blue-600 underline mt-50">速報対象試合検索画面に戻る</router-link>
        </div>
        <CopyrightComp />
    </div>
</template>

<style></style>