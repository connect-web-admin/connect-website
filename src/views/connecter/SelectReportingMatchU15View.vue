<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';
import CopyrightComp from '@/components/CopyrightComp.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const CATEGORY = 'U-15（ジュニアユース）';

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
 * 速報対象試合検索　アクセス日に開催予定の試合を取得
 */
const getCurrentMatches = async () => {
    isLoading.value = true

    const queryUrl = new URL(`${MATCH_API_URL}/current-matches`);
    queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);
    queryUrl.searchParams.append('category', CATEGORY);

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
const moveToRegisterMatchResult = async (matchId) => {
    if (selectedCategory.value && selectedChampionshipName.value && selectedVenue.value) {
        // 選択されたカテゴリーから大会英を抽出
        const filteredByCategory = matchInfo.value.filter(match => match['category'] === selectedCategory.value);
        // 選択された大会名から大会情報を抽出
        const filteredByChampionship = filteredByCategory.find(match => match['championship_name'] === selectedChampionshipName.value);
        // 選択された大会情報から大会IDを抽出
        const championshipId = filteredByChampionship['championship_id'];

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
    } else {
        alert('試合が正しく選択されていません。ブラウザを更新してから、もう一度お試しください。改善しない場合は、コネクトまでご連絡ください。');
    }
}

/**
 * 選択された試合の修正画面に遷移
 * 大会IDと試合IDをパラメーターとして渡す
 */
const moveToEditMatchResult = async (matchId) => {
    if (selectedCategory.value && selectedChampionshipName.value && selectedVenue.value) {
        // 選択されたカテゴリーから大会英を抽出
        const filteredByCategory = matchInfo.value.filter(match => match['category'] === selectedCategory.value);
        // 選択された大会名から大会情報を抽出
        const filteredByChampionship = filteredByCategory.find(match => match['championship_name'] === selectedChampionshipName.value);
        // 選択された大会情報から大会IDを抽出
        const championshipId = filteredByChampionship['championship_id'];

        // 速報登録後に戻ってきた時に、前回選択時の項目を復元するためにローカルストレージ情報を保存            
        localStorage.setItem('selectedCategory', selectedCategory.value); // カテゴリー
        localStorage.setItem('selectedChampionshipName', selectedChampionshipName.value); // 大会名 
        localStorage.setItem('selectedVenue', selectedVenue.value); // 試合会場
        // 上記で設定したローカルストレージの有効期限をひとまとめにして定める。
        const todayEnd = dayjs().hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm:ss');
        localStorage.setItem('selectedItemsExpiration', todayEnd); // 有効期限

        // 大会IDと試合IDをパラメーターとして渡す
        router.push({
            name: 'EditMatchResult',
            params: {
                championshipId: championshipId,
                matchId: matchId
            }
        });
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
            // round_idを除外
            if (round === 'round_id') continue;
            
            for (const match in mathchesInTheChampionship[round]) {
                const venue = mathchesInTheChampionship[round][match]['venue'];
                if (venue) {  // venueがnullでない場合のみ追加
                    originalVenues.push(venue);
                }
            }
        }

        // 重複を除いた試合会場を取得
        const uniqueVenues = [...new Set(originalVenues)];

        // 試合会場を昇順でソート。AコートやBコートなどの順序が付いているときのため
        uniqueVenues.sort((a, b) => a.localeCompare(b));
        return uniqueVenues;
    } else {
        return [];
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
            // round_idを除外
            if (round === 'round_id') continue;
            
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
                scheduledMatchStartTime: match['scheduled_match_start_time'],
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

        // 時間の昇順でソート
        displayDataOfMatches.sort((a, b) => {
            const [aHour, aMinute] = a.scheduledMatchStartTime.split(':').map(Number);
            const [bHour, bMinute] = b.scheduledMatchStartTime.split(':').map(Number);

            if (aHour !== bHour) {
                return aHour - bHour;  // 時で比較
            }
            return aMinute - bMinute;  // 分で比較
        });

        return displayDataOfMatches;
    } else {
        return [];
    }
});

/**
 * カテゴリーが変更されたら、大会名と会場の選択をリセット
 */
watch(selectedCategory, () => {
    selectedChampionshipName.value = '';
    selectedVenue.value = '';
});

/**
 * 大会名が変更されたら、会場の選択をリセット
 */
watch(selectedChampionshipName, () => {
    selectedVenue.value = '';
});

/**
 * ローカルストレージに保存された選択項目を復元
 */
const setSelectedItems = () => {
    // カテゴリーを設定（U-18固定）
    selectedCategory.value = CATEGORY;

    // 少し遅延させて大会名を復元（カテゴリー設定後にcomputedが更新されるのを待つ）
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
            }, 250);
        }
    }, 250);
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
onMounted(async () => {
    // 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
    isAccessible.value = await getCurrentMatches();

    // selectedItemsExpirationが有効期限内かどうかを確認
    checkExpiration();

    // ページ表示前にローカルストレージに保存された選択項目を復元
    // データ取得後に選択項目を復元するため、少し遅延させる
    setTimeout(() => {
        setSelectedItems();
    }, 250);
});

// CSS
const eachMenuContainer = 'border-1 border-gray-300';
const menuHeading = 'px-2 py-1 bg-blue-200 border-b-1 border-gray-300';
const eachSelect = 'px-2 py-1 not-last:border-b-1 not-last:border-gray-300 not-last:cursor-pointer';
const arrowDownwardIcon = 'w-5 my-2 mx-auto';
const selectBtn = 'mr-2 min-w-12 h-10';
</script>

<template>
    <div>
        <div class="mt-5">
            <img src="@/assets/connect-title-logo.svg" alt="コネクト" class="mx-auto">
        </div>
        <div v-if="isLoading" class="mt-20">
            <img src="@/assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else class="w-full h-full px-6 pt-4 pb-50">
            <div v-if="isAccessible">
                <h1 class="text-2xl text-center my-2">速報対象試合検索</h1>
                <h2 class="text-center my-2 text-red-600 text-sm">本ウェブサイトは速報業務専用です。第三者へのURLやリンクの共有はお控えください。場合により、アクセス方法を変更させていただくことがあります。</h2>
                <h2 class="text-center my-2 text-sm">処理に時間がかかる場合がありますので、ボタンを押しても表示が切り替わらない場合は少々お待ちください。</h2>
                <div :class="eachMenuContainer">
                    <h2 :class="menuHeading">カテゴリー</h2>
                    <p class="px-4 py-1 bg-amber-100">{{ CATEGORY }}</p>
                    <!-- <div v-for="(category, idx) in CATEGORIES" :key="idx"
                        :class="[eachSelect, { 'bg-amber-100': selectedCategory === category }]">
                        <label :for="'category-selector-' + idx" class="block w-full cursor-pointer">
                            <input type="radio" :value="category" v-model="selectedCategory"
                                :id="'category-selector-' + idx" class="appearance-none" />
                            {{ category }}
                        </label>
                    </div> -->
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
                        <div v-if="true">
                            <div v-for="(championship, idx) in championshipsFilteredByCategory" :key="idx"
                                :class="[eachSelect, { 'bg-amber-100': selectedChampionshipName === championship }]">
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
                        <div v-if="selectedChampionshipName">
                            <div v-for="(venue, idx) in venuesFilteredByCategoryAndChampionship" :key="idx"
                                :class="[eachSelect, { 'bg-amber-100': selectedVenue === venue }]">
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
                    <h2 :class="menuHeading">試合一覧（本日開催分）</h2>
                    <div v-if="!selectedVenue">
                        （試合が表示されます）
                    </div>
                    <Transition enter-active-class="transition-opacity duration-300 ease-in"
                        leave-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
                        leave-to-class="opacity-0">
                        <div v-if="selectedVenue">
                            <div v-for="(match, idx) in matchesFilteredByCategoryAndChampionshipAndVenue" :key="idx">
                                <!-- 速報がまだ終わっていない試合情報を先にループ。速報終了済みの試合を下段に表示するため -->
                                <div v-if="!(match.isResultRegistered)" class="px-2 py-1 flex flex-row items-center border-b-1 border-gray-300">
                                    <button type="button" @click="moveToRegisterMatchResult(match.matchId)"
                                        :class="selectBtn"
                                        class="bg-green-200 border-1 border-black rounded-xl">選択</button>
                                    <div class="w-full pl-2">
                                        <div class="text-left">
                                            開催日時：{{ match.matchDate }}&nbsp;-&nbsp;{{ match.scheduledMatchStartTime }}
                                        </div>
                                        <div>
                                            {{ match.homeClubName }}
                                            <span class="mx-2">対</span>
                                            {{ match.awayClubName }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-for="(match, idx) in matchesFilteredByCategoryAndChampionshipAndVenue" :key="idx">
                                <div v-if="match.isResultRegistered"
                                    class="flex flex-row items-center px-2 py-1 bg-gray-200 border-b-1 border-gray-300">
                                    <button type="button" @click="moveToEditMatchResult(match.matchId)"
                                        :class="selectBtn"
                                        class="bg-gray-200 border-1 border-black rounded-xl">修正</button>
                                    <div class="w-full pl-2 bg-white">
                                        <p class="block">開催日時：{{ match.matchDate }}&nbsp;-&nbsp;{{
                                            match.scheduledMatchStartTime }}
                                            <span class="text-left text-red-600 ml-5">速報終了</span>
                                        </p>
                                        <p>{{ match.homeClubName }}&nbsp;vs&nbsp;{{ match.awayClubName }}</p>
                                        <p class="text-red-600 font-bold">{{ match.homeClubFinalScore }}&nbsp;-&nbsp;{{
                                            match.awayClubFinalScore }}
                                            <span v-if="match.hasPk">
                                                (PK {{ match.homeClubPkScore }}&nbsp;-&nbsp;{{ match.awayClubPkScore }})
                                            </span>
                                        </p>
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