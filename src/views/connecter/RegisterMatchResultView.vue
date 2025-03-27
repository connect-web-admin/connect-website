<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RegisterScoreModal from '@/components/connecter/RegisterScoreModal.vue';
import RegisterMatchResultModal from '@/components/connecter/RegisterMatchResultModal.vue';
import RegisterMatchDelayModal from '@/components/connecter/RegisterMatchDelayModal.vue';
import RegisterPkModal from '@/components/connecter/RegisterPkModal.vue';
import RegisterExtraHalvesModal from '@/components/connecter/RegisterExtraHalvesModal.vue';
import SelectExtraHalvesPkModal from '@/components/connecter/SelectExtraHalvesPkModal.vue';
import { MATCH_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';

// 得点取り消しをするための最小得点数（1点）。0点では取り消し不可にする
const LEAST_SCORE = 1;

// ルーティングで渡されたパラメータを取得
const route = useRoute();
const router = useRouter();

// 読み込み中・処理中の画面切り替え用フラグ
const isLoading = ref(false);

// モーダル表示用のフラグ
const showHomeClubPlusModal = ref(false);
const showAwayClubPlusModal = ref(false);
const showHomeClubMinusModal = ref(false);
const showAwayClubMinusModal = ref(false);
const showMatchResultModal = ref(false);
const showMatchDelayModal = ref(false);
const showExtraHalvesApplyModal = ref(false);
const showExtraHalvesCancelModal = ref(false);
const showPkApplyModal = ref(false);
const showPkCancelModal = ref(false);
const showSelectExtraHalvesPkModal = ref(false);
const showRegisterMatchResultModal = ref(false);

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
const isDelayed = ref(false); // 試合順延フラグ
const championshipId = route.params.championshipId; // 大会ID ルーティング時にパラメタで渡される
const matchId = route.params.matchId; // 試合ID ルーティング時にパラメタで渡される
const hasExtraHalves = ref(false); // 延長戦有無
const hasPk = ref(false); // PK戦有無
const isHome = ref(true); // ホームクラブかどうか 
const isAway = ref(true); // アウェイクラブかどうか。isHomeの真偽地を使えば良いが、直感的に理解しやすくするために追加
const isPlusScore = ref(true); // 得点追加フラグ
const isMinusScore = ref(true); // 得点減少フラグ
const actualMatchStartTime = ref(''); // 実際の試合開始時刻
// scheduledMatchStartTimeの値が格納されたらactualMatchStartTimeにも反映する
watch(scheduledMatchStartTime, (newValue) => {
    actualMatchStartTime.value = newValue;
});

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

/**
 * 得点追加のバリデーション
 * 試合前や試合終了の状態では得点を追加できない
 */
const plusScoreValidation = (homeOrAway) => {
    if (gameStatus.value !== '前半' && gameStatus.value !== '後半' && gameStatus.value !== '延長前半' && gameStatus.value !== '延長後半') {
        alert('試合状態が前半・後半・延長前半・延長後半の場合のみ、得点を追加できます。');
        return;
    }

    if (homeOrAway === 'home') {
        showHomeClubPlusModal.value = true;
    } else if (homeOrAway === 'away') {
        showAwayClubPlusModal.value = true;
    }
}

/**
 * 得点を追加
 */
const plusScore = async (homeOrAway) => {
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
    }
}

/**
 * 得点取り消しのバリデーション
 * 得点取り消ししようとする試合進行状況の得点が0の場合はモーダルを表示しない
 */
const minusScoreValidation = (homeOrAway) => {
    if (gameStatus.value !== '前半' && gameStatus.value !== '後半' && gameStatus.value !== '延長前半' && gameStatus.value !== '延長後半') {
        alert('試合状態が前半・後半・延長前半・延長後半の場合のみ、得点を取り消すことができます。');
        return;
    }

    if (homeOrAway === 'home') {
        if ((gameStatus.value === '前半' && homeClubFirstHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '後半' && homeClubSecondHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '延長前半' && homeClubExtraFirstHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '延長後半' && homeClubExtraSecondHalfScore.value < LEAST_SCORE)
        ) {
            alert(`${gameStatus.value}に取り消す得点がありません。`);
            return;
        } else {
            showHomeClubMinusModal.value = true;
        }
    } else if (homeOrAway === 'away') {
        if ((gameStatus.value === '前半' && awayClubFirstHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '後半' && awayClubSecondHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '延長前半' && awayClubExtraFirstHalfScore.value < LEAST_SCORE) ||
            (gameStatus.value === '延長後半' && awayClubExtraSecondHalfScore.value < LEAST_SCORE)
        ) {
            alert(`${gameStatus.value}に取り消す得点がありません。`);
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
    }
}

/**
 * 次のキック番号を取得
 */
const getNextKickIndex = (homeOrAway) => {
    const pkList = homeOrAway === 'home' ? homeClubPkScoreList.value : awayClubPkScoreList.value;
    // 最初の未登録（nullまたはundefined）のインデックスを探す
    for (let i = 0; i < pkList.length; i++) {
        if (!pkList[i]) {
            return i;
        }
    }
    // すべて登録済みの場合は配列の長さ（次の新しいインデックス）を返す
    return pkList.length;
};

/**
 * PK戦のスコアを追加・取り消し
 */
const managePkScore = async (homeOrAway, result) => {
    try {
        // 次のキック番号を取得
        const index = getNextKickIndex(homeOrAway);

        // 配列が十分な長さを持っていることを確認
        if (homeOrAway === 'home') {
            if (index >= homeClubPkScoreList.value.length) {
                homeClubPkScoreList.value = [...homeClubPkScoreList.value, ...Array(index - homeClubPkScoreList.value.length + 1).fill(null)];
            }
            homeClubPkScoreList.value[index] = result;
        }
        if (homeOrAway === 'away') {
            if (index >= awayClubPkScoreList.value.length) {
                awayClubPkScoreList.value = [...awayClubPkScoreList.value, ...Array(index - awayClubPkScoreList.value.length + 1).fill(null)];
            }
            awayClubPkScoreList.value[index] = result;
        }

        // APIを呼び出してサーバーに保存
        const putUrl = new URL(`${MATCH_API_URL}/manage-pk-score`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR,
            championshipId: championshipId,
            matchId: matchId,
            homeOrAway: homeOrAway,
            index: index,
            result: result
        };

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
        console.error('Error details:', error);
        errorMessage.value = 'PK戦スコアの操作に失敗しました。';
    }
};

// 最後のキックを取り消す関数
const cancelLastKick = async (homeOrAway) => {
    try {
        const pkList = homeOrAway === 'home' ? homeClubPkScoreList.value : awayClubPkScoreList.value;

        // 最後に登録されたキックのインデックスを探す
        let lastIndex = -1;
        for (let i = pkList.length - 1; i >= 0; i--) {
            if (pkList[i] === 'success' || pkList[i] === 'failure') {
                lastIndex = i;
                break;
            }
        }

        // 登録されたキックがない場合
        if (lastIndex === -1) {
            alert('取り消すキックがありません。');
            return;
        }

        // APIを呼び出してサーバーに保存
        const putUrl = new URL(`${MATCH_API_URL}/manage-pk-score`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR,
            championshipId: championshipId,
            matchId: matchId,
            homeOrAway: homeOrAway,
            index: lastIndex,
            result: 'cancel'
        };

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
        console.error('Error details:', error);
        errorMessage.value = 'PK戦スコアの取り消しに失敗しました。';
    }
};

// PK戦の追加ラウンド数を計算する計算プロパティを修正
const extraPkRounds = computed(() => {
    // 両方のPKリストの長さを取得
    const homeListLength = homeClubPkScoreList.value.length;
    const awayListLength = awayClubPkScoreList.value.length;

    // 基本の5回を超えるキック数を計算
    const maxLength = Math.max(homeListLength, awayListLength);

    // 両チームが5回のキックを終えた後の処理
    if (maxLength >= 5) {
        // 各チームの有効なキック数（success または failure）を計算
        const homeValidKicks = homeClubPkScoreList.value.filter(result => result === 'success' || result === 'failure').length;
        const awayValidKicks = awayClubPkScoreList.value.filter(result => result === 'success' || result === 'failure').length;

        // サドンデスの最大ラウンド数を計算
        // 1. 両チームが完了したラウンド数（最小値）
        const completedPairs = Math.min(homeValidKicks, awayValidKicks);
        // 2. どちらかのチームが進行中のラウンド数（最大値）
        const inProgressRounds = Math.max(homeValidKicks, awayValidKicks);

        // 基本の5回を超えるラウンド数
        let extraRounds = 0;

        if (completedPairs >= 5) {
            // 両チームが5回以上のキックを完了している場合

            // 完了したペアのラウンド数（5回を超える分）
            const completedExtraRounds = completedPairs - 5;

            // 最後の完了したラウンドでスコアが同点の場合、次のラウンドも表示
            if (homeClubPkScore.value === awayClubPkScore.value) {
                // 進行中または次のラウンドを表示（どちらか大きい方）
                extraRounds = Math.max(completedExtraRounds + 1, inProgressRounds - 5);
            } else {
                // 同点でない場合でも、進行中のラウンドは表示
                extraRounds = Math.max(completedExtraRounds, inProgressRounds - 5);
            }
        } else if (inProgressRounds > 5) {
            // 5回の基本キックが終わっていないが、どちらかが6回目以降を蹴っている場合
            extraRounds = inProgressRounds - 5;
        }

        return extraRounds;
    }

    return 0; // 基本の5回以内ならサドンデスなし
});

// 試合状態の遷移定義
const getGameStatusTransitions = computed(() => {
    if (isLeague.value) {
        // リーグ戦の場合の遷移
        return {
            next: {
                '試合前': { next: '前半', label: '前半開始' },
                '前半': { next: 'ハーフタイム', label: '前半終了' },
                'ハーフタイム': { next: '後半', label: '後半開始' },
                // '後半': { next: '後半終了', label: '後半終了' },
                // '後半終了': { next: '試合終了', label: '試合終了' },
                // '試合終了': { next: null, label: null }
                '後半': { next: '試合終了', label: '試合終了' },
                '試合終了': { next: null, label: null }
            },
            prev: {
                '試合前': null,
                '前半': '試合前',
                'ハーフタイム': '前半',
                // '後半': 'ハーフタイム',
                // '後半終了': '後半',
                // '試合終了': '後半終了'
                '後半': 'ハーフタイム',
                '試合終了': '後半'
            }
        };
    } else {
        // リーグ戦以外の場合の遷移
        return {
            next: {
                '試合前': { next: '前半', label: '前半開始' },
                '前半': { next: 'ハーフタイム', label: '前半終了' },
                'ハーフタイム': { next: '後半', label: '後半開始' },
                '後半': { next: '後半終了', label: '後半終了' }, // 特殊処理
                '後半終了': { next: '選択', label: '選択' }, // 特殊処理
                '延長前半': { next: '延長後半', label: '延長後半開始' },
                '延長後半': { next: '延長後半終了', label: '延長後半終了' },
                '延長後半終了': { next: '選択', label: '選択' }, // PK戦・試合終了を選択
                'PK戦': { next: '試合終了', label: '試合終了' },
            },
            prev: {
                '試合前': null,
                '前半': '試合前',
                'ハーフタイム': '前半',
                '後半': 'ハーフタイム',
                '後半終了': '後半',
                '延長前半': '後半終了',
                '延長後半': '延長前半',
                '延長後半終了': '延長後半',
                'PK戦': hasExtraHalves.value ? '延長後半終了' : '後半終了',
                '試合終了': hasPk.value ? 'PK戦' : (hasExtraHalves.value ? '延長後半終了' : '後半終了')
            }
        };
    }
});

// 次へボタンのラベルを取得
const getNextButtonLabel = computed(() => {
    const transitions = getGameStatusTransitions.value;
    if (transitions.next[gameStatus.value]) {
        return transitions.next[gameStatus.value].label;
    }
    return '';
});

// 前へボタンのラベルを取得（戻る場合は前の状態に対応する「次へ」ボタンのラベル）
const getPrevButtonLabel = computed(() => {
    const transitions = getGameStatusTransitions.value;
    const prevStatus = transitions.prev[gameStatus.value];

    if (!prevStatus) return '';

    // 試合終了状態の場合は、戻り先に合わせてラベルを設定
    if (isLeague && gameStatus.value === '試合終了') {
        return '後半';
    }
    if (!isLeague && gameStatus.value === '試合終了') {
        if (hasPk.value) return 'PK戦';
        if (hasExtraHalves.value) return '延長後半終了';
        return '後半終了';
    }

    // 通常のケース
    if (prevStatus === '試合前') return '試合前';
    if (prevStatus === '前半') return '前半';
    if (prevStatus === 'ハーフタイム') return 'ハーフタイム';
    if (prevStatus === '後半') return '後半';
    if (prevStatus === '後半終了') return '後半終了';
    if (prevStatus === '延長前半') return '延長前半';
    if (prevStatus === '延長後半') return '延長後半';
    if (prevStatus === '延長後半終了') return '延長後半終了';
    if (prevStatus === 'PK戦') return 'PK戦';

    return '戻る';
});

// 次の状態へ進むボタンのクリックハンドラ
const handleNextGameStatus = () => {
    const transitions = getGameStatusTransitions.value;
    const nextInfo = transitions.next[gameStatus.value];

    if (nextInfo && nextInfo.next === '選択') {
        // 選択モーダルを表示（延長前半・PK戦・試合終了を選択）
        showSelectExtraHalvesPkModal.value = true;
    } else {
        // 通常の遷移
        handleGameStatus('next');
    }
};

/**
 * 試合状況進行・後退
 */
const handleGameStatus = async (direction) => {
    if (direction === 'prev' && gameStatus.value === '延長前半') {
        registerExtraHalvesValidation('cancel');
        return;
    }

    if (direction === 'prev' && gameStatus.value === 'PK戦') {
        registerPkValidation('cancel');
        return;
    }

    try {
        const transitions = getGameStatusTransitions.value;
        let changingGameStatus;
        
        if (direction === 'end') {
            changingGameStatus = '試合終了';
        } else {
            changingGameStatus = direction === 'next'
                ? transitions.next[gameStatus.value].next
                : transitions.prev[gameStatus.value]; // directionがprevの場合は逆方向の遷移
        }

        if (!changingGameStatus) {
            throw new Error('次の試合進行状況が見つかりません');
        }

        const putUrl = new URL(`${MATCH_API_URL}/handle-game-status`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            changingGameStatus: changingGameStatus, // 変更後の試合進行状況
            direction: direction, // 引数で文字列nextかprevが入る
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
    }
}

/**
 * 延長戦登録のバリデーション
 */
const registerExtraHalvesValidation = (action) => {
    if (action === 'apply' && !(gameStatus.value === '後半終了')) {
        alert('試合状態が後半終了の場合のみ、延長戦を開始できます。');
        return;
    }

    if (action === 'cancel' && !(gameStatus.value === '延長前半' || gameStatus.value === '延長前半終了' || gameStatus.value === '延長後半' || gameStatus.value === '延長後半終了' || gameStatus.value === '試合終了')) {
        alert('試合状態が延長前半・延長前半終了・延長後半・延長後半終了・試合終了の場合のみ、延長戦を取り消すことができます。');
        return;
    }

    if (action === 'apply') {
        showExtraHalvesApplyModal.value = true;
    } else if (action === 'cancel') {
        showExtraHalvesCancelModal.value = true;
    }
}

/**
 * 延長戦登録
 */
const registerExtraHalves = async (action) => {
    // 延長戦登録・取り消し処理
    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-extra-halves`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            action: action
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
        window.location.reload();
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = '延長戦の登録に失敗しました。'
    }
}

/**
 * PK戦登録のバリデーション
 */
const registerPkValidation = (action) => {
    if (action === 'apply' && !(gameStatus.value === '後半終了' || gameStatus.value === '延長後半終了')) {
        alert('試合状態が後半終了か延長後半終了の場合のみ、PK戦を開始できます。');
        return;
    }

    if (action === 'cancel' && !(gameStatus.value === 'PK戦' || gameStatus.value === 'PK戦終了' || gameStatus.value === '試合終了')) {
        alert('試合状態がPK戦・PK戦終了・試合終了の場合のみ、PK戦を取り消すことができます。');
        return;
    }

    if (action === 'apply') {
        showPkApplyModal.value = true;
    } else if (action === 'cancel') {
        showPkCancelModal.value = true;
    }
}

/**
 * PK戦登録
 */
const registerPk = async (action) => {
    // PK戦登録・取り消し処理
    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-pk`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            action: action
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
        location.reload();
    } catch (error) {
        console.error('Error details:', error)
        errorMessage.value = 'PK戦の登録に失敗しました。'
    }
}

/**
 * 試合結果登録
 */
const registerMatchResult = async () => {
    try {
        const putUrl = new URL(`${MATCH_API_URL}/register-match-result`);

        const requestBody = {
            fiscalYear: THIS_FISCAL_YEAR, // constantファイルから取得
            championshipId: championshipId, // パラメタで渡された大会ID
            matchId: matchId, // パラメタで渡された試合ID
            actualMatchStartTime: actualMatchStartTime.value,
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
};

/**
 * 試合延期登録
 */
const registerMatchDelay = async () => {
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 成功時の処理を追加
        alert('試合延期を正常に登録しました。試合検索画面に戻ります。');
        router.push('/connecter/select-match-to-report');
    } catch (error) {
        console.error('Error details:', error);
        errorMessage.value = '試合延期の登録に失敗しました。';
    }
}

onMounted(async () => {
    // 結果入力対象試合のデータを取得する
    await getTargetMatchInfo();

    // 「試合終了・結果登録ボタン」を押すように促す
    if (isLeague.value && gameStatus.value === '試合終了') {
        showRegisterMatchResultModal.value = true;
    }
    if (!isLeague.value && gameStatus.value === '試合終了') {
        showRegisterMatchResultModal.value = true;
    }

});

// CSS クラスの共通化
const textClubName = 'text-xl py-2';
const scoreInputBg = 'p-4';
const scoringOpenModal = 'text-4xl';
const scoringBtn = 'w-12 h-10';
const minusScoring = 'my-10';
const gameStatusBtn = 'w-full px-2 py-1 bg-gray-100 border-1 border-gray-400 rounded-md';
const registerBtnBase = 'w-[150px] h-[40px] text-white rounded-md';

// PK表示用の共通クラス
const pkCellBase = 'flex items-center justify-center min-w-[40px] h-[30px]';
const pkCellWithBorder = `${pkCellBase} border border-slate-300 h-[50px]`;
const pkCellHeader = `${pkCellWithBorder} font-bold`;

// フレックスレイアウト用の共通クラス
const flexRow = 'flex flex-row';
const flexCol = 'flex flex-col';
const flexCenter = 'flex items-center justify-center';
const flexCenterGap = 'flex justify-center gap-20';

// ボーダー用の共通クラス
const borderTopBottom = 'border-t-1 border-b-1 border-black';
</script>

<template>
    <div>
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
                <div>
                    <p>{{ championshipName }}</p>
                    <p>{{ round }}{{ match }}</p>
                    <p>試合日時：{{ formattedMatchDate }} - {{ scheduledMatchStartTime }}</p>
                    <p>会場：{{ venue }}</p>
                    <div :class="flexRow" class="justify-center">
                        <p class="w-full break-words text-right">{{ homeClubName }}</p>
                        <p class="mx-2">vs</p>
                        <p class="w-full break-words text-left">{{ awayClubName }}</p>
                    </div>
                </div>
                <div class="mt-5">
                    <p class="py-1 font-bold text-xl" :class="borderTopBottom">試合速報入力</p>
                    <div :class="flexRow" class="justify-around items-center py-3 bg-green-100 border-b-1 border-black">
                        <div class="text-right w-[110px]  bg-green-100 mx-1">
                            <button v-if="gameStatus !== '試合前'"
                                type="button" @click="handleGameStatus('prev')" :class="gameStatusBtn">
                                <span class="text-sm">{{ getPrevButtonLabel }}</span>
                            </button>
                        </div>
                        <!-- 矢印（左向き） -->
                        <div v-if="gameStatus === '試合前'" class="w-[10px]"></div>
                        <div v-else
                            class="w-0 h-0 border-y-8 border-r-8 border-y-transparent border-r-red-400 bg-green-100">
                        </div>
                        <!-- 現在の試合状態 -->
                        <div class="w-[100px] mx-1 bg-white">
                            <span class="font-bold italic text-md">{{ gameStatus }}</span>
                        </div>
                        <!-- 矢印（右向き） -->
                        <div v-if="gameStatus === '試合終了'" class="w-[10px]"></div>
                        <div v-else
                            class="w-0 h-0 border-y-8 border-l-8 border-y-transparent border-l-red-400 bg-green-100">
                        </div>
                        <!-- 次の状態へ進むボタン -->
                        <div class="text-left w-[110px] bg-green-100 mx-1">
                            <button v-if="gameStatus !== '試合終了' && getNextButtonLabel === '選択'" type="button" @click="handleNextGameStatus"
                                :class="gameStatusBtn" class='border-2 border-red-500 bg-red-50'>
                                <span class="text-lgfont-bold">{{ getNextButtonLabel }}</span>
                            </button>
                            <button v-if="gameStatus !== '試合終了' && getNextButtonLabel !== '選択'" type="button" @click="handleNextGameStatus"
                                :class="gameStatusBtn">
                                <span class="text-sm">{{ getNextButtonLabel }}</span>
                            </button>
                        </div>
                    </div>
                    <div :class="flexRow">
                        <!-- Homeクラブ得点入力 -->
                        <div class="w-1/2">
                            <p :class="textClubName" class="bg-blue-100">{{ homeClubName }}</p>
                            <div :class="scoreInputBg" class="bg-blue-50 border-b-1">
                                <button type="button" @click="plusScoreValidation('home')" :class="scoringBtn"
                                    class="h-[50px] border-3 border-red-400 rounded-md bg-white">
                                    <span :class="scoringOpenModal">{{ homeScore }}</span>
                                </button>
                            </div>
                            <!-- Homeクラブ得点取り消し -->
                            <div v-if="gameStatus !== 'PK戦' && gameStatus !== '試合終了'" :class="minusScoring">
                                <button type="button" @click="minusScoreValidation('home')"
                                    class="px-2 bg-gray-400 text-white rounded-sm">得点取り消し</button>
                            </div>
                        </div>
                        <!-- Awayクラブ得点入力 -->
                        <div class="w-1/2">
                            <p :class="textClubName" class="bg-amber-100">{{ awayClubName }}</p>
                            <div :class="scoreInputBg" class="bg-amber-50 border-b-1">
                                <button type="button" @click="plusScoreValidation('away')" :class="scoringBtn"
                                    class="h-[50px] border-3 border-red-400 rounded-md bg-white">
                                    <span :class="scoringOpenModal">{{ awayScore }}</span>
                                </button>
                            </div>
                            <!-- Awayクラブ得点取り消し -->
                            <div v-if="gameStatus !== 'PK戦' && gameStatus !== '試合終了'" :class="minusScoring">
                                <button type="button" @click="minusScoreValidation('away')"
                                    class="px-2 bg-gray-400 text-white rounded-sm">得点取り消し</button>
                            </div>
                        </div>
                    </div>
                    <!-- PK戦のスコア登録 -->
                    <div v-if="hasPk && gameStatus === 'PK戦'" :class="[flexCol, 'border-t-1py-3']">
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
                    </div>
                    <!-- PK結果表示テーブル -->
                    <div v-if="hasPk && (gameStatus === 'PK戦' || gameStatus === '試合終了')" class="w-full flex flex-col items-center py-5 border-b-1 border-black">
                        <h3 v-if="gameStatus === 'PK戦'" class="text-center text-red-500 font-bold">※
                            キック順と表中のクラブ名の上下は、<br />一致しないことがあります。ご注意ください。</h3>
                        <div class="w-full overflow-x-auto">
                            <table class="min-w-max pb-[5px] border-collapse mx-auto">
                                <thead>
                                    <tr>
                                        <th class="w-[120px] sticky left-0 z-10 bg-white border border-slate-300 h-[50px] font-bold text-center">クラブ名</th>
                                        <!-- 基本の5キック -->
                                        <th v-for="i in 5" :key="i" class="min-w-[40px] h-[50px] border border-slate-300 font-bold text-center">{{ i }}</th>
                                        <!-- 追加キック（サドンデス）用の列 -->
                                        <th v-for="i in extraPkRounds" :key="i + 5" class="min-w-[40px] h-[50px] border border-slate-300 font-bold text-center">{{ i + 5 }}</th>
                                        <th class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] font-bold text-center">合計</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- ホームクラブの行 -->
                                    <tr>
                                        <td class="w-[120px] sticky left-0 z-10 bg-blue-100 border border-slate-300 h-[50px] text-center">{{ homeClubName }}</td>
                                        <!-- 基本の5キック -->
                                        <td v-for="i in 5" :key="i" class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                            <span v-if="homeClubPkScoreList[i - 1] === 'success'" class="text-green-600 font-bold">○</span>
                                            <span v-else-if="homeClubPkScoreList[i - 1] === 'failure'" class="text-red-600 font-bold text-[1.25rem]">×</span>
                                        </td>
                                        <!-- 追加キック（サドンデス）用の列 -->
                                        <td v-for="i in extraPkRounds" :key="i + 5" class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                            <span v-if="homeClubPkScoreList[i + 4] === 'success'" class="text-green-600 font-bold">○</span>
                                            <span v-else-if="homeClubPkScoreList[i + 4] === 'failure'" class="text-red-600 font-bold">×</span>
                                        </td>
                                        <td class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] text-center">{{ homeClubPkScore }}</td>
                                    </tr>
                                    <!-- アウェイクラブの行 -->
                                    <tr>
                                        <td class="w-[120px] sticky left-0 z-10 bg-amber-100 border border-slate-300 h-[50px] text-center">{{ awayClubName }}</td>
                                        <!-- 基本の5キック -->
                                        <td v-for="i in 5" :key="i" class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                            <span v-if="awayClubPkScoreList[i - 1] === 'success'" class="text-green-600 font-bold">○</span>
                                            <span v-else-if="awayClubPkScoreList[i - 1] === 'failure'" class="text-red-600 font-bold text-[1.25rem]">×</span>
                                        </td>
                                        <!-- 追加キック（サドンデス）用の列 -->
                                        <td v-for="i in extraPkRounds" :key="i + 5" class="min-w-[40px] h-[50px] border border-slate-300 text-center align-middle">
                                            <span v-if="awayClubPkScoreList[i + 4] === 'success'" class="text-green-600 font-bold">○</span>
                                            <span v-else-if="awayClubPkScoreList[i + 4] === 'failure'" class="text-red-600 font-bold">×</span>
                                        </td>
                                        <td class="min-w-[40px] sticky right-0 z-10 bg-white border border-slate-300 h-[50px] text-center">{{ awayClubPkScore }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- 得点表示 -->
                    <div class="text-xl mt-5">
                        <p>{{ homeClubFirstHalfScore }}　前半　{{ awayClubFirstHalfScore }}</p>
                        <p>{{ homeClubSecondHalfScore }}　後半　{{ awayClubSecondHalfScore }}</p>
                        <div v-if="hasExtraHalves">
                            <p>{{ homeClubExtraFirstHalfScore }}　延長前半　{{ awayClubExtraFirstHalfScore }}</p>
                            <p>{{ homeClubExtraSecondHalfScore }}　延長後半　{{ awayClubExtraSecondHalfScore }}</p>
                        </div>
                        <div v-if="hasPk">
                            <p>{{ homeClubPkScore }}　PK戦　{{ awayClubPkScore }}</p>
                        </div>
                        <p>{{ homeScore }}　合計　{{ awayScore }}</p>
                    </div>
                    <!-- <div v-if="!isLeague" :class="[flexRow, 'justify-center', 'items-center', 'my-10']">
                        <div class="w-1/2 flex flex-col gap-8 items-center">
                            <button
                                v-if="hasExtraHalves && (gameStatus === '延長前半' || gameStatus === '延長前半終了' || gameStatus === '延長後半' || gameStatus === '延長後半終了')"
                                type="button" @click="registerExtraHalvesValidation('cancel')"
                                class="w-2/3 py-1 bg-gray-400 text-white rounded-sm">延長戦取り消し</button>
                            <button v-if="!hasExtraHalves && gameStatus === '後半終了'" type="button"
                                @click="registerExtraHalvesValidation('apply')"
                                class="w-2/3 py-1 bg-amber-600 text-white rounded-sm">延長前半開始</button>
                        </div>
                        <div class="w-1/2 flex flex-col gap-8 items-center">
                            <button v-if="hasPk && (gameStatus === 'PK戦' || gameStatus === 'PK戦終了')" type="button"
                                @click="registerPkValidation('cancel')"
                                class="w-2/3 py-1 bg-gray-400 text-white rounded-sm">PK戦取り消し</button>
                            <button v-if="!hasPk && (gameStatus === '後半終了' || gameStatus === '延長後半終了')" type="button"
                                @click="registerPkValidation('apply')"
                                class="w-2/3 py-1 bg-purple-500 text-white rounded-sm">PK戦開始</button>
                        </div>
                    </div> -->
                    <!-- 試合結果登録 -->
                    <div v-if="gameStatus === '試合終了'" class="mt-10" id="register-match-result">
                        <!-- 実際の試合開始時刻登録 -->
                        <div class="border-t-1 border-b-1 border-black my-5">
                            <label for="match-time">
                                <p class="bg-gray-200">実際の試合開始時刻</p>
                            </label>
                            <div class="flex items-center justify-center h-10">
                                <input type="time" id="match-time" :value="scheduledMatchStartTime"
                                    @input="setActualMatchStartTime" />
                            </div>
                        </div>
                        <button type="button" @click="registerMatchResult"
                            class="bg-blue-600 px-6 py-2 rounded-md"><span
                                class="text-lg bg-blue-600 text-white">結果登録</span></button>
                    </div>
                </div>
                <div v-if="gameStatus === '試合前'" class="mt-40 mb-10">
                    <p>または、この試合の延期を登録します。</p>
                    <div :class="flexRow" class="justify-center mt-2">
                        <div class="mx-4">
                            <input type="radio" id="isDelayedRadio1" v-model="isDelayed" :value="true" />
                            <label for="isDelayedRadio1">はい</label>
                        </div>
                        <div class="mx-4">
                            <input type="radio" id="isDelayedRadio2" v-model="isDelayed" :value="false" />
                            <label for="isDelayedRadio2">いいえ</label>
                        </div>
                    </div>
                    <div class="pt-5">
                        <button type="button" @click="showMatchDelayModal = true" :disabled="!isDelayed"
                            :class="[registerBtnBase, isDelayed ? 'bg-amber-600' : 'bg-gray-300 cursor-not-allowed']"><span
                                class="text-xl text-white"
                                :class="isDelayed ? 'bg-amber-600' : 'bg-gray-300 '">延期登録</span></button>
                    </div>
                </div>
            </div>
            <a href="/connecter/select-reporting-match"
                class="block text-center text-blue-600 underline mt-50">速報対象試合検索画面に戻る</a>
        </div>
        <CopyrightComp />

        <Teleport to="body">
            <select-extra-halves-pk-modal :show="showSelectExtraHalvesPkModal" :game-status="gameStatus"
                :is-after-second-half="gameStatus === '後半終了'" :is-after-extra-second-half="gameStatus === '延長後半終了'"
                @close="showSelectExtraHalvesPkModal = false" @register-extra-halves="registerExtraHalves"
                @register-pk="registerPk" @handle-game-status="handleGameStatus">
            </select-extra-halves-pk-modal>
        </Teleport>
        <Teleport to=" body">
            <register-score-modal :show="showHomeClubPlusModal" :is-home="isHome" :is-plus-score="isPlusScore"
                @close="showHomeClubPlusModal = false" @plus-score="plusScore">
                <template v-slot:body>
                    <p><span class="text-red-500 font-bold">{{ homeClubName
                    }}</span>に１点を追加します。<br />よろしいですか？</p>
                </template>
            </register-score-modal>
        </Teleport>
        <Teleport to="body">
            <register-score-modal :show="showHomeClubMinusModal" :is-home="isHome" :is-minus-score="isMinusScore"
                @close="showHomeClubMinusModal = false" @minus-score="minusScore">
                <template v-slot:body>
                    <p><span class="text-red-500 font-bold">{{ homeClubName
                            }}</span>の１点を取り消します。<br />よろしいですか？</p>
                </template>
            </register-score-modal>
        </Teleport>
        <Teleport to="body">
            <register-score-modal :show="showAwayClubPlusModal" :is-away="isAway" :is-plus-score="isPlusScore"
                @close="showAwayClubPlusModal = false" @plus-score="plusScore">
                <template v-slot:body>
                    <p><span class="text-red-500 font-bold">{{ awayClubName
                            }}</span>に１点を追加します。<br />よろしいですか？</p>
                </template>
            </register-score-modal>
        </Teleport>
        <Teleport to="body">
            <register-score-modal :show="showAwayClubMinusModal" :is-away="isAway" :is-minus-score="isMinusScore"
                @close="showAwayClubMinusModal = false" @minus-score="minusScore">
                <template v-slot:body>
                    <p><span class="text-red-500 font-bold">{{ awayClubName
                            }}</span>の１点を取り消します。<br />よろしいですか？</p>
                </template>
            </register-score-modal>
        </Teleport>
        <Teleport to="body">
            <register-extra-halves-modal :show="showExtraHalvesCancelModal" :is-cancel="true"
                @close="showExtraHalvesCancelModal = false" @register-extra-halves="registerExtraHalves">
                <template v-slot:body>
                    <p>延長戦を取り消します。延長戦の得点がすべて取り消されます。<br />試合状態は後半終了に変わります。<br />よろしいですか？
                    </p>
                </template>
            </register-extra-halves-modal>
        </Teleport>
        <Teleport to="body">
            <register-extra-halves-modal :show="showExtraHalvesApplyModal" :is-apply="true"
                @close="showExtraHalvesApplyModal = false" @register-extra-halves="registerExtraHalves">
                <template v-slot:body>
                    <p>延長前半を開始します。よろしいですか？</p>
                </template>
            </register-extra-halves-modal>
        </Teleport>
        <Teleport to="body">
            <register-pk-modal :show="showPkCancelModal" :is-cancel="true" @close="showPkCancelModal = false"
                @register-pk="registerPk">
                <template v-slot:body>
                    <p v-if="hasExtraHalves">PK戦を取り消します。PK戦の得点がすべて取り消されます。<br />試合状態は延長後半終了に変わります。<br />よろしいですか？</p>
                    <p v-if="!hasExtraHalves">PK戦を取り消します。PK戦の得点がすべて取り消されます。<br />試合状態は後半終了に変わります。<br />よろしいですか？</p>
                </template>
            </register-pk-modal>
        </Teleport>
        <Teleport to="body">
            <register-pk-modal :show="showPkApplyModal" :is-apply="true" @close="showPkApplyModal = false"
                @register-pk="registerPk">
                <template v-slot:body>
                    <p>PK戦を開始します。よろしいですか？</p>
                </template>
            </register-pk-modal>
        </Teleport>
        <Teleport to="body">
            <register-match-result-modal :show="showMatchResultModal" @close="showMatchResultModal = false"
                @register-match-result="registerMatchResult">
                <template v-slot:body>
                    <p>試合結果を登録します。<br />よろしいですか？</p>
                </template>
            </register-match-result-modal>
        </Teleport>
        <Teleport to="body">
            <register-match-result-modal :show="showRegisterMatchResultModal"
                @close="showRegisterMatchResultModal = false">
                <template v-slot:body>
                    <p>得点を確認して、結果登録ボタンを押してください。</p>
                </template>
            </register-match-result-modal>
        </Teleport>
        <Teleport to="body">
            <register-match-delay-modal :show="showMatchDelayModal" @close="showMatchDelayModal = false"
                @register-match-delay="registerMatchDelay">
                <template v-slot:body>
                    <p>試合の延期を登録します。<br />よろしいですか？</p>
                </template>
            </register-match-delay-modal>
        </Teleport>
    </div>
</template>

<style></style>