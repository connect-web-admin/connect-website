<script setup>

import { ref, onBeforeMount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CONNECTER_API_URL, ID_TOKEN_FOR_AUTH, USER_ATTR_SUB, THIS_FISCAL_YEAR, CHAMPIONSHIPS, CATEGORIES } from '@/utils/constants';

// ルーティング
const router = useRouter();

// ローディング画面切り替え及び試合情報取得の成否を管理
const isLoading = ref(false);
const isFetchingSuccessful = ref(false);
const failedFetchingMsg = ref('');

// ユーザー属性サブジェクト
const userAttrSub = localStorage.getItem(USER_ATTR_SUB); // ConnecterDDBにあるconnecter_idと同じ値
// REST APIで使う認証トークンを取得
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH);
// 当年度の大会情報を取得（年度ごとに一つの大会名群を保持しているのでfindで見つかるのは常に一つ）
const championshipsFilteredByFiscalYear = CHAMPIONSHIPS.find(item => {
    return item['年度'] === THIS_FISCAL_YEAR;
});

// 試合情報
const matchInfo = ref([]); // 選択中のカテゴリ
const selectedCategory = ref(''); // 選択中の大会名
const selectedChampionship = ref('');
const selectedMatchDate = ref(''); // 選択中の試合開催日
const selectedVenue = ref(''); // 選択中の試合開催日の試合会場

// 結果入力をする試合を選択するために試合情報を取得
const getMatchInfoToRegisterResult = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${CONNECTER_API_URL}/object/${userAttrSub}/${THIS_FISCAL_YEAR}`)

    try {
        // 試合情報取得
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            }
        })

        if (response.ok) {
            isFetchingSuccessful.value = true
            const data = await response.json()
            matchInfo.value = data;
        } else {
            failedFetchingMsg.value = '試合情報の取得に失敗しました。ページを更新するか、ログアウトしてから再度ログインをしてください。それでも問題が解決しない場合は、コネクトまでご連絡ください。'
        }
    } catch (error) {
        console.error('試合情報の取得に失敗しました。')
    } finally {
        isLoading.value = false
    }
}

/**
 * ▼▼▼▼▼　カテゴリー、大会名、試合開催日、試合会場の順で絞り込み　ここから　▼▼▼▼▼
 */
// 選択可能な大会をカテゴリーから絞り込み
const championshipsFilteredByCategory = computed(() => {
    // 当年度の大会情報から、選択中のカテゴリーに対応するものを抽出
    if (selectedCategory.value === '') {
        return ['（選択肢が表示されます）'];
    } else {
        const preChampionshipsFilteredByCategory = championshipsFilteredByFiscalYear['カテゴリー'][selectedCategory.value];

        // 該当する大会がない場合は、メッセージを返す
        if (preChampionshipsFilteredByCategory.length === 0) {
            return ['該当する大会はありません。'];
        } else {
            return preChampionshipsFilteredByCategory;
        }
    }
})

/**
 * 年度と大会名と試合開催日から試合会場を絞り込む。
 */
const venuesFilteredByChampionshipAndMatchDate = computed(() => {
    // 選択中の大会に絞り込み
    // 選択中の大会は、championshipsFilteredByCategoryで絞り込んだものの中から選択されているので、必ずどれかの大会名が入っている
    const matchesFilteredByChampionship = matchInfo.value.filter(item => {
        return item.championshipName === selectedChampionship.value;
    });

    // 選択中の試合開催日に絞り込み
    // 選択中の大会は、championshipsFilteredByCategoryで絞り込んだものの中から選択されているので、必ず大会名に対応する試合開催日が入っている
    const matchesFilteredByMatchDate = matchesFilteredByChampionship.filter(item => {
        return item.match.match_date === selectedMatchDate.value;
    });

    // 選択された試合開催日に対応する試合会場を抽出
    const venuesFilteredBySelectedMatchDate = []
    for (const item of matchesFilteredByMatchDate) {
        venuesFilteredBySelectedMatchDate.push(item.match.venue)
    }

    // 試合開催日に対応する試合会場がない場合は、メッセージを返す
    if (venuesFilteredBySelectedMatchDate.length === 0) {
        return ['試合がありません'];
    } else {
        // 重複を削除してソート
        const deleteRepeatedVenuesAndSort = [...new Set(venuesFilteredBySelectedMatchDate)].sort()
        return deleteRepeatedVenuesAndSort;
    }
})

// 結果入力可能な試合を一覧で表示
const matchesToRegisterResult = computed(() => {
    // 選択中の大会に絞り込み
    const matchesFilteredByChampionship = matchInfo.value.filter(item => {
        return item.championshipName === selectedChampionship.value;
    });

    // 選択中の試合開催日に絞り込み
    const matchesFilteredByMatchDate = matchesFilteredByChampionship.filter(item => {
        return item.match.match_date === selectedMatchDate.value;
    });

    // 選択中の試合会場に絞り込み
    const matchesFilteredByVenue = matchesFilteredByMatchDate.filter(item => {
        return item.match.venue === selectedVenue.value;
    });

    return matchesFilteredByVenue;
})

// カテゴリーが選択された時に自動的に大会名を選択
watch(selectedCategory, (newCategory) => {
    if (newCategory !== '') {
        // カテゴリーが選択され、かつ選択肢が存在する場合、最初の選択肢を自動選択
        selectedChampionship.value = championshipsFilteredByCategory.value[0];
        // 試合開催日をリセット
        selectedMatchDate.value = '';
        // 試合会場をリセット
        selectedVenue.value = '';
    } else {
        // それ以外の場合は空にする
        selectedChampionship.value = '';
        // selectedMatchDate.value = '';
        selectedVenue.value = '';
    }
});

// 大会名が変更された時に試合開催日と試合会場をリセット
watch(selectedChampionship, () => {
    selectedMatchDate.value = '';
    selectedVenue.value = '';
});

// 試合開催日が選択された時に自動的に試合会場を選択
watch(selectedMatchDate, (newMatchDate) => {
    if (newMatchDate !== '') {
        selectedVenue.value = venuesFilteredByChampionshipAndMatchDate.value[0];
    } else {
        selectedVenue.value = '';
    }
});

// 新しいウィンドウで結果入力画面を開く
const moveToRegisterMatchResult = (championshipId, matchId) => {
    // 新しいウィンドウで開くためにルーティングを解決（URLを生成）
    const route = router.resolve({
        name: 'RegisterMatchResult',
        params: {
            championshipId: championshipId,
            matchId: matchId
        }
    });
    window.open(route.href, '_blank');
}

// ページ表示前にConnecterDDBから試合情報抽出
onBeforeMount(async () => {
    await getMatchInfoToRegisterResult()
})

// CSS
const eachMenuContainer = 'border-1 border-gray-300 rounded-sm';
const menuHeading = 'py-1 bg-blue-200';
const eachSelect = 'w-full px-2 py-1';
const instructionText = 'px-2 py-1 text-left';
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
</script>

<template>
    <div class="w-full h-full px-10 py-4">
        <div v-if="isLoading" class="text-center">
            読み込み中
        </div>
        <div v-else class="text-center mx-auto">
            <div v-if="isFetchingSuccessful">
                <!-- カテゴリーで絞り込み -->
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">カテゴリー</h2>
                    <select v-model="selectedCategory" :class="eachSelect" id="category-select">
                        <option value="" disabled>最初にカテゴリーを選択してください。</option>
                        <option v-for="(category, idx) in CATEGORIES" :key="idx" :value="category">
                            {{ category }}
                        </option>
                    </select>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <!-- 大会名で絞り込み -->
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">大会名</h2>
                    <select v-model="selectedChampionship" :class="eachSelect" id="championship-select">
                        <option v-if="championshipsFilteredByCategory.includes('（選択肢が表示されます）')" value="" disabled>
                            （選択肢が表示されます）</option>
                        <option v-else v-for="(championship, idx) in championshipsFilteredByCategory" :key="idx"
                            :value="championship">
                            {{ championship }}
                        </option>
                    </select>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <!-- 試合開催日で絞り込み -->
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">試合開催日</h2>
                    <div v-if="selectedChampionship === ''">
                        <p :class="instructionText">（日付を選択できるようになります）</p>
                    </div>
                    <div v-else>
                        <input type="date" v-model="selectedMatchDate" :class="eachSelect" id="match-date-input">
                    </div>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <!-- 試合会場で絞り込み -->
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">試合会場</h2>
                    <select v-model="selectedVenue" :class="eachSelect" id="venue-select">
                        <option value="" disabled>（試合会場が表示されます）</option>
                        <option
                            v-if="selectedMatchDate && !venuesFilteredByChampionshipAndMatchDate.includes('試合がありません')"
                            v-for="(venue, idx) in venuesFilteredByChampionshipAndMatchDate" :key="idx" :value="venue">
                            {{ venue }}
                        </option>
                        <option v-else-if="selectedMatchDate" disabled>試合がありません</option>
                    </select>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <!-- 結果入力可能な試合を一覧で表示-->
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">結果入力　対象試合一覧</h2>
                    <div v-if="selectedVenue === ''">
                        <p :class="instructionText">（全ての項目が選択されると表示されます）</p>
                    </div>
                    <div v-else class="px-2 py-2">
                        <div v-for="(item, idx) in matchesToRegisterResult" :key="idx" class="group not-last:mb-2">
                            <div class="flex">
                                <form @submit.prevent="moveToRegisterMatchResult(item.championshipId, item.match.match_id)">
                                    <button type="submit" class="h-12 px-4 mr-4 bg-amber-200 border-1 rounded-sm">選択</button>
                                </form>
                                <div>
                                    <p class="text-left">{{ item.match.scheduled_match_start_time }}（開始予定時刻）</p>
                                    <p class="text-left">
                                        {{ item.match.home_club.club_name }}
                                        <span class="mx-2">対</span>
                                        {{ item.match.away_club.club_name }}
                                    </p>
                                </div>
                            </div>
                            <div class="group-not-last:border-b-1 group-not-last:border-gray-300 mt-2"></div>
                        </div>
                    </div>
                </div>
                <p class="text-left text-red-900 font-bold">選択ボタンを押すと新しいウィンドウを開きます。</p>
            </div>
            <div v-else>
                {{ failedFetchingMsg }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>