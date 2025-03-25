<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MATCH_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const router = useRouter();

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
const homeClubFirstHalfScoreEdit = ref(0); // ホームクラブの前半得点
const homeClubSecondHalfScoreEdit = ref(0); // ホームクラブの後半得点
const homeClubExtraFirstHalfScoreEdit = ref(0); // ホームクラブの延長前半得点
const homeClubExtraSecondHalfScoreEdit = ref(0); // ホームクラブの延長後半得点
const homeClubPkScoreEdit = ref(0); // ホームクラブのPK戦スコア
const homeClubPkScoreListEdit = ref([]); // ホームクラブのPK戦スコアリスト
const awayClubFirstHalfScoreEdit = ref(0); // アウェイクラブの前半得点
const awayClubSecondHalfScoreEdit = ref(0); // アウェイクラブの後半得点
const awayClubExtraFirstHalfScoreEdit = ref(0); // アウェイクラブの延長前半得点
const awayClubExtraSecondHalfScoreEdit = ref(0); // アウェイクラブの延長後半得点
const awayClubPkScoreEdit = ref(0); // アウェイクラブのPK戦スコア
const awayClubPkScoreListEdit = ref([]); // アウェイクラブのPK戦スコアリスト

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
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合データの取得に失敗しました。';
    } finally {
        isLoading.value = false;
    }
};

// ユーザーが時間を変更したときに selectedTime を更新
const setActualMatchStartTime = (event) => {
    actualMatchStartTime.value = event.target.value;
};

const registerEditedMatchResult = async () => {
    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-edited-match-result`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            hasExtraHalvesEdit: hasExtraHalvesEdit.value,
            hasPkEdit: hasPkEdit.value,
            actualMatchStartTime: actualMatchStartTime.value,
            homeClubFirstHalfScoreEdit: homeClubFirstHalfScoreEdit.value,
            homeClubSecondHalfScoreEdit: homeClubSecondHalfScoreEdit.value,
            homeClubExtraFirstHalfScoreEdit: homeClubExtraFirstHalfScoreEdit.value,
            homeClubExtraSecondHalfScoreEdit: homeClubExtraSecondHalfScoreEdit.value,
            homeClubPkScoreEdit: homeClubPkScoreEdit.value,
            homeClubPkScoreListEdit: homeClubPkScoreListEdit.value,
            awayClubFirstHalfScoreEdit: awayClubFirstHalfScoreEdit.value,
            awayClubSecondHalfScoreEdit: awayClubSecondHalfScoreEdit.value,
            awayClubExtraFirstHalfScoreEdit: awayClubExtraFirstHalfScoreEdit.value,
            awayClubExtraSecondHalfScoreEdit: awayClubExtraSecondHalfScoreEdit.value,
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
        alert('試合結果を正常に登録しました。試合検索画面に戻ります。');
        router.push('/connecter/select-reporting-match');
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = '試合結果の登録に失敗しました。'
    }
}

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
    <div class="mb-50 max-w-screen-sm mx-auto">
        <div class="mt-8">
            <img src="@/assets/connect-title-logo.svg" alt="コネクト" class="mx-auto">
        </div>
        <div v-if="isLoading" class="mt-20">
            <img src="../../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            <p class="text-center">読み込み中……</p>
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
                        <p class="w-48 break-words text-right">{{ homeClubName }}</p>
                        <p class="w-4 mx-2">vs</p>
                        <p class="w-48 break-words text-left">{{ awayClubName }}</p>
                    </div>
                </div>
                <div class="mt-5">
                    <h2 class="py-1 font-bold text-xl border-t-1 border-b-1 border-black">速報内容修正</h2>
                    <div>
                        <div class="flex flex-row border-b-1 border-black">
                            <p class="w-1/2 bg-blue-100 text-xl">{{ homeClubName }}</p>
                            <p class="w-1/2 bg-amber-100 text-xl">{{ awayClubName }}</p>
                        </div>
                        <div class="flex flex-row border-b-1 border-black">
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-1/2">前半得点</p>
                                    <div class="w-1/2">
                                        <select v-model="homeClubFirstHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-blue-50">
                                    <p class="w-1/2">後半得点</p>
                                    <div class="w-1/2">
                                        <select v-model="homeClubSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col w-1/2">
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-1/2">前半得点</p>
                                    <div class="w-1/2">
                                        <select v-model="awayClubFirstHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="flex flex-row py-2 bg-amber-50">
                                    <p class="w-1/2">後半得点</p>
                                    <div class="w-1/2">
                                        <select v-model="awayClubSecondHalfScoreEdit"
                                            class=" bg-white border-2 border-red-500 rounded-md">
                                            <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div :class="[borderTopBottom, 'bg-amber-300 flex flex-row justify-center gap-10 py-2']">
                        <h2>延長戦の有無</h2>
                        <!-- <p class="text-sm">（得点入力欄が表示されます）</p> -->
                        <div class="flex flex-row gap-5">
                            <div>
                                <input type="radio" id="hasExtraHalvesEditRadio1" v-model="hasExtraHalvesEdit"
                                    :value="true" />
                                <label for="hasExtraHalvesEditRadio1">あり</label>
                            </div>
                            <div>
                                <input type="radio" id="hasExtraHalvesEditRadio2" v-model="hasExtraHalvesEdit" selected
                                    :value="false" />
                                <label for="hasExtraHalvesEditRadio2">なし</label>
                            </div>
                        </div>
                    </div>
                    <div v-if="hasExtraHalvesEdit" class="flex flex-row border-b-1 border-black">
                        <div class="flex flex-col w-1/2">
                            <div class="flex flex-row py-2 bg-blue-50">
                                <p class="w-1/2">延長前半得点</p>
                                <div class="w-1/2">
                                    <select v-model="homeClubExtraFirstHalfScoreEdit"
                                        class=" bg-white border-2 border-red-500 rounded-md">
                                        <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex flex-row py-2 bg-blue-50">
                                <p class="w-1/2">延長後半得点</p>
                                <div class="w-1/2">
                                    <select v-model="homeClubExtraSecondHalfScoreEdit"
                                        class=" bg-white border-2 border-red-500 rounded-md">
                                        <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col w-1/2">
                            <div class="flex flex-row py-2 bg-amber-50">
                                <p class="w-1/2">延長前半得点</p>
                                <div class="w-1/2">
                                    <select v-model="awayClubExtraFirstHalfScoreEdit"
                                        class=" bg-white border-2 border-red-500 rounded-md">
                                        <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex flex-row py-2 bg-amber-50">
                                <p class="w-1/2">延長後半得点</p>
                                <div class="w-1/2">
                                    <select v-model="awayClubExtraSecondHalfScoreEdit"
                                        class=" bg-white border-2 border-red-500 rounded-md">
                                        <option v-for="i in 30" :key="i" :value="i">{{ i }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div :class="[borderTopBottom, 'bg-purple-200 flex flex-row justify-center gap-10 py-2']">
                        <h2>PK戦の有無</h2>
                        <!-- <p class="text-sm">（得点入力欄が表示されます）</p> -->
                        <div class="flex flex-row gap-5">
                            <div>
                                <input type="radio" id="hasPkEditRadio1" v-model="hasPkEdit" :value="true" />
                                <label for="hasPkEditRadio1">あり</label>
                            </div>
                            <div>
                                <input type="radio" id="hasPkEditRadio2" v-model="hasPkEdit" selected :value="false" />
                                <label for="hasPkEditRadio2">なし</label>
                            </div>
                        </div>
                    </div>

                    <!-- PK戦のスコア登録 -->
                    <div v-if="gameStatus === 'PK戦' && hasPk" :class="[flexCol, borderTopBottom, 'py-3']">
                        <h3 class="font-bold mb-2">PK戦スコア登録</h3>
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
                        <div class="w-full overflow-x-auto flex flex-col items-center">
                            <h3 class="text-center text-red-500 font-bold">※
                                キック順と表中のクラブ名の上下は、<br />一致しないことがあります。ご注意ください。</h3>
                            <div :class="[flexRow, 'items-baseline', 'min-w-max', 'pb-[5px]']">
                                <div :class="flexCol" class="w-[150px] sticky left-0 z-10">
                                    <div :class="pkCellHeader" class="bg-white">クラブ名</div>
                                    <div :class="[pkCellWithBorder, 'bg-blue-100']">{{ homeClubName }}</div>
                                    <div :class="[pkCellWithBorder, 'bg-amber-100']">{{ awayClubName }}</div>
                                </div>
                                <div :class="flexRow">
                                    <!-- 基本の5キック -->
                                    <div v-for="i in 5" :key="i" :class="flexCol">
                                        <div :class="pkCellHeader">{{ i }}</div>
                                        <div :class="pkCellWithBorder">
                                            <span v-if="homeClubPkScoreList[i - 1] === 'success'"
                                                class="text-green-600 font-bold">○</span>
                                            <span v-else-if="homeClubPkScoreList[i - 1] === 'failure'"
                                                class="text-red-600 font-bold text-[1.25rem]">×</span>
                                        </div>
                                        <div :class="pkCellWithBorder">
                                            <span v-if="awayClubPkScoreList[i - 1] === 'success'"
                                                class="text-green-600 font-bold">○</span>
                                            <span v-else-if="awayClubPkScoreList[i - 1] === 'failure'"
                                                class="text-red-600 font-bold text-[1.25rem]">×</span>
                                        </div>
                                    </div>
                                    <!-- 追加キック（サドンデス）用の列 -->
                                    <div v-for="i in extraPkRounds" :key="i + 5" :class="flexCol">
                                        <div :class="pkCellHeader">{{ i + 5 }}</div>
                                        <div :class="pkCellWithBorder">
                                            <span v-if="homeClubPkScoreList[i + 4] === 'success'"
                                                class="text-green-600 font-bold">○</span>
                                            <span v-else-if="homeClubPkScoreList[i + 4] === 'failure'"
                                                class="text-red-600 font-bold">×</span>
                                        </div>
                                        <div :class="pkCellWithBorder">
                                            <span v-if="awayClubPkScoreList[i + 4] === 'success'"
                                                class="text-green-600 font-bold">○</span>
                                            <span v-else-if="awayClubPkScoreList[i + 4] === 'failure'"
                                                class="text-red-600 font-bold">×</span>
                                        </div>
                                    </div>
                                </div>
                                <div :class="flexCol" class="sticky right-0 z-10">
                                    <div :class="pkCellHeader" class="bg-white">合計</div>
                                    <div :class="pkCellWithBorder" class="bg-white">{{ homeClubPkScore }}</div>
                                    <div :class="pkCellWithBorder" class="bg-white">{{ awayClubPkScore }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                    <div class="border-t-1 border-b-1 border-black my-5">
                        <label for="match-time">
                            <p class="bg-gray-200">実際の試合開始時刻</p>
                        </label>
                        <div class="flex items-center justify-center h-10">
                            <input type="time" id="match-time" :value="scheduledMatchStartTime"
                                @input="setActualMatchStartTime" />
                        </div>
                    </div>
                    <div class="mt-20">
                        <button type="button" @click="registerMatchResult" class="bg-blue-600 px-3 py-1 rounded-md">
                            <span class="text-md bg-blue-600 text-white">修正登録</span>
                        </button>
                    </div>
                </div>
            </div>
            <a href="/connecter/select-reporting-match"
                class="block text-center text-blue-600 underline mt-50">速報対象試合検索画面に戻る</a>
        </div>
        <CopyrightComp />
    </div>
</template>

<style></style>