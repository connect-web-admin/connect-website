<script setup>

import { ref, onBeforeMount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR, CATEGORIES } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';

const router = useRouter();

/**
 * 当日と、当日から一週間前の日付を取得
 * 試合一覧（本日{{today}}から{{oneWeekAgoToDisplay}}までの開催分）の表示用
 */
const today = new Date().toLocaleDateString('ja-JP', { 
    month: 'numeric', 
    day: 'numeric' 
});

const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const oneWeekAgoToDisplay = oneWeekAgo.toLocaleDateString('ja-JP', { 
    month: 'numeric', 
    day: 'numeric' 
});

const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH);
const isLoading = ref(false);
const isFetchingSuccessful = ref(false);
const failedFetchingMsg = ref('');

const matchInfo = ref([]);

const selectedCategory = ref('');
const selectedChampionshipName = ref('');
const selectedVenue = ref('');

/**
 * 当年度に開催される試合の中から、当日及び当日から一週間前の試合のみを取得
 */
const getMatchInfoInThisFiscalYear = async () => {
    isLoading.value = true

    const queryUrl = new URL(`${MATCH_API_URL}/all-championships`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idTokenForAuth}`
            }
        });

        if (response.ok) {
            isFetchingSuccessful.value = true;
            const data = await response.json();
            matchInfo.value = data;
        } else {
            failedFetchingMsg.value = '試合情報の取得に失敗しました。ページを更新するか、ブラウザを更新しても問題が解決しない場合は、コネクトまでご連絡ください。'
        }
    } catch (error) {
        console.error('試合情報の取得に失敗しました。');
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
                homeClubName: match['home_club']['club_name'],
                awayClubName: match['away_club']['club_name'],
                homeClubFinalScore: match['home_club']['final_score'],
                awayClubFinalScore: match['away_club']['final_score'],
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

// ページ表示前にConnecterDDBから試合情報抽出*
onBeforeMount(async () => {
    await getMatchInfoInThisFiscalYear();
});

// CSS
const eachMenuContainer = 'border-1 border-gray-300 rounded-lg';
const menuHeading = 'px-2 py-1 bg-blue-200 rounded-t-md';
const eachSelect = 'px-2 py-1 not-last:border-b-1 border-gray-300 cursor-pointer hover:bg-amber-100';
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
const selectBtn = 'mr-2 min-w-12 h-10 rounded-md';
</script>

<template>
<div class="w-full h-full px-10 pt-4 pb-50">
    <h1 class="text-2xl text-center">速報対象試合検索</h1>
    <div :class="eachMenuContainer">
        <h2 :class="menuHeading">カテゴリー</h2>
        <div v-for="(category, idx) in CATEGORIES" :key="idx" :class="[eachSelect, { 'bg-amber-100': selectedCategory === category }]">
            <label :for="'category-selector-' + idx" class="block w-full cursor-pointer">
                <input type="radio" :value="category" v-model="selectedCategory" :id="'category-selector-' + idx" class="appearance-none" />
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
        <Transition
            enter-active-class="transition-opacity duration-300 ease-in"
            leave-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
        >
            <div v-if="selectedCategory" class="championship-list">
                <div v-for="(championship, idx) in championshipsFilteredByCategory" :key="idx" :class="[eachSelect, { 'bg-amber-100': selectedChampionshipName === championship }]">
                    <label :for="'championship-selector-' + idx" class="block w-full cursor-pointer">
                        <input type="radio" :value="championship" v-model="selectedChampionshipName" :id="'championship-selector-' + idx" class="appearance-none" />
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
        <Transition
            enter-active-class="transition-opacity duration-300 ease-in"
            leave-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
        >
            <div v-if="selectedChampionshipName" class="venue-list">   
                <div v-for="(venue, idx) in venuesFilteredByCategoryAndChampionship" :key="idx" :class="[eachSelect, { 'bg-amber-100': selectedVenue === venue }]">
                    <label :for="'venue-selector-' + idx" class="block w-full cursor-pointer">
                        <input type="radio" :value="venue" v-model="selectedVenue" :id="'venue-selector-' + idx" class="appearance-none" />
                        {{ venue }}
                    </label>
                </div>
            </div>
        </Transition>
    </div>
    <img src="@/assets/icons/arrow_downward.png" alt="下向き矢印" :class="arrowDownwardIcon">
    <div :class="eachMenuContainer">
        <h2 :class="menuHeading">試合一覧（{{oneWeekAgoToDisplay}}から本日{{today}}までの開催分）</h2>
        <div v-if="!selectedVenue">
            （試合が表示されます）
        </div>
        <Transition
            enter-active-class="transition-opacity duration-300 ease-in"
            leave-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
        >
            <div v-if="selectedVenue" class="match-list">
                <div v-for="(match, idx) in matchesFilteredByCategoryAndChampionshipAndVenue" :key="idx" class="not-last:border-b-1 border-gray-300">
                    <div v-if="match.isResultRegistered" class="flex items-center px-2 py-1 bg-gray-200">
                        <button type="button" @click="moveToRegisterMatchResult(match.matchId, match.isResultRegistered)" :class="selectBtn" class="bg-gray-200 border-1 border-black">選択</button>
                        <div class="w-full">
                            <div class="text-left">
                                開催日：{{ match.matchDate }}
                            </div>
                            <div class="flex justify-start items-center w-full">
                                <div class="w-2/5">{{ match.homeClubName }}</div>
                                <div class="w-1/5 mx-3 italic text-center">{{ match.homeClubFinalScore }}<span class="mx-2">対</span>{{ match.awayClubFinalScore }}</div>
                                <div class="w-2/5">{{ match.awayClubName }}</div>
                            </div>
                            <div class="text-left text-red-600">
                                登録済み
                            </div>
                        </div>
                    </div>
                    <div v-else class="px-2 py-1 last:rounded-b-md">
                        <div class="flex items-center">
                            <button type="button" @click="moveToRegisterMatchResult(match.matchId, match.isResultRegistered)" :class="selectBtn" class="bg-green-200 border-1 border-black">選択</button>
                            <div class="w-full">
                                <div class="text-left">
                                    開催日：{{ match.matchDate }}
                                </div>
                                <div class="flex">
                                    <div>{{ match.homeClubName }}</div>
                                    <div><span class="mx-2">対</span></div>
                                    <div>{{ match.awayClubName }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
    <CopyrightComp />
</div>
</template>

<style>
</style>