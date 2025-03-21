<script setup>
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR, CATEGORIES } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const router = useRouter();
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH);
const isLoading = ref(false);
const isFetchingSuccessful = ref(false);
const failedFetchingMsg = ref('');
const matchInfo = ref([]); // 試合情報
const isAccessible = ref(false); // 速報対象試合が存在するかどうか
const inaccessibleMsg = ref(''); // 速報対象試合が存在しない場合のメッセージ

/**
 * ユーザーが選択した項目
 */
const selectedCategory = ref(''); // カテゴリー
const selectedChampionshipName = ref(''); // 大会名
const selectedVenue = ref(''); // 試合会場

// プラグインを設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

/**
 * 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
 */
const getMatchCurrentMatches = async () => {
    isLoading.value = true

    const queryUrl = new URL(`${MATCH_API_URL}/current-matches`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // アクセスする日が、「ある試合の当日から見て前日の午前8時から翌日の23時59分まで」に含まれる場合、アクセス許可とする
        // そういう試合が一つでもあればアクセス許可、なければアクセス拒否
        const allMatchDates = await response.json();
        if (allMatchDates.length > 0) {
            matchInfo.value = allMatchDates;
            return true;
        } else {
            inaccessibleMsg.value = 'アクセス可能期間外です。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

/**
 * 選択された試合の速報画面に遷移
 * 大会IDと試合IDをパラメーターとして渡す
 */
const moveToRegisterMatchResult = async (matchId, isResultAlreadyRegistered) => {
    if (selectedCategory.value && selectedChampionshipName.value && selectedVenue.value) {
        // 選択されたカテゴリーから大会英を抽出
        const filteredByCategory = matchInfo.value.filter(match => match['category'] === selectedCategory.value);
        // 選択された大会名から大会情報を抽出
        const filteredByChampionship = filteredByCategory.find(match => match['championship_name'] === selectedChampionshipName.value);
        // 選択された大会情報から大会IDを抽出
        const championshipId = filteredByChampionship['championship_id'];

        // 大会IDと試合IDから当該試合の情報を抽出
        // 試合結果が登録済みの試合の結果を再度入力しようとした場合、確認させる
        if (isResultAlreadyRegistered) {
            if (!confirm('この試合の結果はすでに登録されています。修正しますか？')) {
                return;
            }
            router.push({
                name: 'RegisterMatchResult', // TODO:修正用ページに遷移するように書き換えること
                params: {
                    championshipId: championshipId,
                    matchId: matchId
                }
            });
        } else {
            // 速報登録後に戻ってきた時に、前回選択時の項目を復元するためにローカルストレージ情報を保存            
            localStorage.setItem('selectedCategory', selectedCategory.value); // カテゴリー
            localStorage.setItem('selectedChampionshipName', selectedChampionshipName.value); // 大会名 
            localStorage.setItem('selectedVenue', selectedVenue.value); // 試合会場
            // 上記で設定したローカルストレージの有効期限をひとまとめにして定める。
            const todayEnd = dayjs().hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm:ss');
            localStorage.setItem('selectedItemsExpiration', todayEnd); // 有効期限

            // 大会IDと試合IDをパラメーターとして渡す
            router.push({
                name: 'RegisterMatchResult',
                params: {
                    championshipId: championshipId,
                    matchId: matchId
                }
            });
        }
    } else {
        alert('試合が正しく選択されていません。ブラウザを更新してから、もう一度お試しください。改善しない場合は、コネクトまでご連絡ください。');
    }
}

/**
 * カテゴリーを選択したら、大会名を取得
 * カテゴリーと大会はcoonstant.jsに記述されているものを参照
 */
const championshipsFilteredByCategory = computed(() => {
    const championshipNames = [];
    matchInfo.value.forEach(match => {
        if (match['category'] === selectedCategory.value) {
            championshipNames.push(match['championship_name']);
        }
    });
    return championshipNames;
});

/**
 * カテゴリーと大会名を選択したら、試合会場を取得
 * （本日から数えて前後一週間に開催される試合会場のみ）
 */
const venuesFilteredByCategoryAndChampionship = computed(() => {
    if (selectedCategory.value && selectedChampionshipName.value) {
        // カテゴリーで絞り込み。一つひとつのカテゴリーは複数の大会を持つのでfilter
        const filteredByCategory = matchInfo.value.filter(match => match['category'] === selectedCategory.value);
        // 大会で絞り込み。各カテゴリーに同名の大会は二つ以上存在しないのでfind
        const filteredByChampionship = filteredByCategory.find(match => match['championship_name'] === selectedChampionshipName.value);
        // あとで処理しやすいようにmatchesだけを取得
        const mathchesInTheChampionship = filteredByChampionship['matches'];

        // 試合会場だけを取得
        const originalVenues = [];
        for (const round in mathchesInTheChampionship) {
            for (const match in mathchesInTheChampionship[round]) {
                originalVenues.push(mathchesInTheChampionship[round][match]['venue']);
            }
        }

        // 重複を除いた試合会場を取得
        const uniqueVenues = [...new Set(originalVenues)];

        return uniqueVenues;
    } else {
        return '';
    }
});

/**
 * カテゴリーと大会名と試合会場を選択したら、試合を取得
 */
const matchesFilteredByCategoryAndChampionshipAndVenue = computed(() => {
    if (selectedCategory.value && selectedChampionshipName.value && selectedVenue.value) {
        const filteredByCategory = matchInfo.value.filter(match => match['category'] === selectedCategory.value);
        const filteredByChampionship = filteredByCategory.find(match => match['championship_name'] === selectedChampionshipName.value);

        // 選択された試合会場を持つmatchだけを抽出
        const filteredMatchesByVenue = []
        const matches = filteredByChampionship['matches'];
        for (const round in matches) {
            for (const match in matches[round]) {
                if (matches[round][match]['venue'] === selectedVenue.value) {
                    filteredMatchesByVenue.push(matches[round][match]);
                }
            }
        }

        // 選択された試合会場を持つmatchを表示するためのデータを作成
        const displayDataOfMatches = [];
        filteredMatchesByVenue.forEach(match => {
            // 試合開催日を表示用に整形
            const matchDate = new Date(match['match_date']);
            const matchDateToDisplay = matchDate.toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric'
            });

            const data = {
                matchId: match['match_id'],
                matchDate: matchDateToDisplay,
                hasPk: match['has_pk'],
                homeClubName: match['home_club']['club_name'],
                awayClubName: match['away_club']['club_name'],
                homeClubFinalScore: match['home_club']['final_score'],
                awayClubFinalScore: match['away_club']['final_score'],
                homeClubPkScore: match['home_club']['pk_score'],
                awayClubPkScore: match['away_club']['pk_score'],
                isResultRegistered: match['is_result_registered']
            };

            displayDataOfMatches.push(data);
        });

        // 日付の降順でソート
        displayDataOfMatches.sort((a, b) => {
            const [aMonth, aDay] = a.matchDate.split('/').map(Number);
            const [bMonth, bDay] = b.matchDate.split('/').map(Number);

            if (aMonth !== bMonth) {
                return bMonth - aMonth;  // 月で比較
            }
            return bDay - aDay;  // 日で比較
        });

        return displayDataOfMatches;
    } else {
        return '';
    }
});

/**
 * カテゴリーが変更されたら、大会名と会場の選択をリセット
 * 一度カテゴリーが選択され、表示された大会名を選択した後に再度カテゴリーを選択し直した場合、警告が出るため
 * （選択された大会名を含むカテゴリーではなくなるため）
 */
watch(selectedCategory, () => {
    selectedChampionshipName.value = '';
    selectedVenue.value = '';
});

/**
 * ローカルストレージに保存された選択項目を復元
 */
const setSelectedItems = () => {
    // カテゴリーを復元
    if (localStorage.getItem('selectedCategory')) {
        selectedCategory.value = localStorage.getItem('selectedCategory');
    }

    // 少し遅延させて大会名を復元（カテゴリー選択後にcomputedが更新されるのを待つ）
    setTimeout(() => {
        if (localStorage.getItem('selectedChampionshipName') &&
            championshipsFilteredByCategory.value.includes(localStorage.getItem('selectedChampionshipName'))) {
            selectedChampionshipName.value = localStorage.getItem('selectedChampionshipName');

            // さらに遅延させて会場を復元（大会名選択後にcomputedが更新されるのを待つ）
            setTimeout(() => {
                if (localStorage.getItem('selectedVenue') &&
                    venuesFilteredByCategoryAndChampionship.value.includes(localStorage.getItem('selectedVenue'))) {
                    selectedVenue.value = localStorage.getItem('selectedVenue');
                }
            }, 150);
        }
    }, 150);
};
/**
 * ローカルストレージに保存された選択項目の有効期限を確認   
 * 有効期限が切れていれば、ローカルストレージから選択項目を削除
 */
const checkExpiration = () => {
    if (localStorage.getItem('selectedItemsExpiration')) {
        const expiration = localStorage.getItem('selectedItemsExpiration');
        if (dayjs().isAfter(dayjs(expiration))) {
            localStorage.removeItem('selectedCategory');
            localStorage.removeItem('selectedChampionshipName');
            localStorage.removeItem('selectedVenue');
            localStorage.removeItem('selectedItemsExpiration');
        }
    }
};

// ページ表示前にConnecterDDBから試合情報抽出
onBeforeMount(async () => {
    // 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
    isAccessible.value = await getMatchCurrentMatches();

    // selectedItemsExpirationが有効期限内かどうかを確認
    checkExpiration();

    // ページ表示前にローカルストレージに保存された選択項目を復元
    // データ取得後に選択項目を復元するため、少し遅延させる
    setTimeout(() => {
        setSelectedItems();
    }, 250);
});

// CSS
const eachMenuContainer = 'border-1 border-gray-300 rounded-lg';
const menuHeading = 'px-2 py-1 bg-blue-200 rounded-t-md';
const eachSelect = 'px-2 py-1 not-last:border-b-1 not-last:border-gray-300 not-last:cursor-pointer';
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
const selectBtn = 'mr-2 min-w-12 h-10 rounded-md';
</script>

<template>
    <div>
        <div class="mt-8">
            <img src="@/assets/connect-title-logo.svg" alt="コネクト" class="mx-auto">
        </div>
        <div v-if="isLoading" class="mt-20">
            <img src="@/assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            <p class="text-center">読み込み中……</p>
        </div>
        <div v-else class="w-full h-full px-10 pt-4 pb-50">
            <div v-if="isAccessible">
                <h1 class="text-2xl text-center my-2">速報対象試合検索</h1>
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">カテゴリー</h2>
                    <div v-for="(category, idx) in CATEGORIES" :key="idx"
                        :class="[eachSelect, { 'bg-amber-100': selectedCategory === category }, { 'rounded-b-lg': idx === CATEGORIES.length - 1 }]">
                        <label :for="'category-selector-' + idx" class="block w-full cursor-pointer">
                            <input type="radio" :value="category" v-model="selectedCategory"
                                :id="'category-selector-' + idx" class="appearance-none" />
                            {{ category }}
                        </label>
                    </div>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">大会名</h2>
                    <div v-if="!selectedCategory">
                        （大会名が表示されます）
                    </div>
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="selectedCategory" class="rounded-b-lg">
                            <div v-for="(championship, idx) in championshipsFilteredByCategory" :key="idx"
                                :class="[eachSelect, { 'bg-amber-100': selectedChampionshipName === championship }, { 'rounded-b-lg': idx === championshipsFilteredByCategory.length - 1 }]">
                                <label :for="'championship-selector-' + idx" class="block w-full cursor-pointer">
                                    <input type="radio" :value="championship" v-model="selectedChampionshipName"
                                        :id="'championship-selector-' + idx" class="appearance-none" />
                                    {{ championship }}
                                </label>
                            </div>
                        </div>
                    </Transition>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">試合会場</h2>
                    <div v-if="!selectedChampionshipName">
                        （会場が表示されます）
                    </div>
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="selectedChampionshipName" class="rounded-b-lg">
                            <div v-for="(venue, idx) in venuesFilteredByCategoryAndChampionship" :key="idx"
                                :class="[eachSelect, { 'bg-amber-100': selectedVenue === venue }, { 'rounded-b-lg': idx === venuesFilteredByCategoryAndChampionship.length - 1 }]">
                                <label :for="'venue-selector-' + idx" class="block w-full cursor-pointer">
                                    <input type="radio" :value="venue" v-model="selectedVenue"
                                        :id="'venue-selector-' + idx" class="appearance-none" />
                                    {{ venue }}
                                </label>
                            </div>
                        </div>
                    </Transition>
                </div>
                <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">試合一覧（本日と前日の開催分）</h2>
                    <div v-if="!selectedVenue">
                        （試合が表示されます）
                    </div>
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="selectedVenue" class="rounded-b-lg">
                            <div v-for="(match, idx) in matchesFilteredByCategoryAndChampionshipAndVenue" :key="idx"
                                class="not-last:border-b-1 not-last:border-gray-300 rounded-b-md">
                                <div v-if="match.isResultRegistered"
                                    class="flex items-center px-2 py-1 bg-gray-200 rounded-b-md">
                                    <div class="w-full">
                                        <p class="block">開催日：{{ match.matchDate }}
                                            <span class="text-left text-red-600 ml-5">登録済み</span>
                                        </p>
                                        <p>{{ match.homeClubName }}&nbsp;vs&nbsp;{{ match.awayClubName }}</p>
                                    </div>
                                </div>
                                <div v-else class="px-2 py-1 last:rounded-b-md">
                                    <div class="flex items-center">
                                        <button type="button"
                                            @click="moveToRegisterMatchResult(match.matchId, match.isResultRegistered)"
                                            :class="selectBtn" class="bg-green-200 border-1 border-black">選択</button>
                                        <div class="w-full">
                                            <div class="text-left">
                                                開催日：{{ match.matchDate }}
                                            </div>
                                            <div>
                                                {{ match.homeClubName }}
                                                <span class="mx-2">対</span>
                                                {{ match.awayClubName }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
            <div v-else>
                <h1 class="text-2xl text-center mt-30">{{ inaccessibleMsg }}</h1>
            </div>
        </div>
        <CopyrightComp />
    </div>
</template>

<style></style>