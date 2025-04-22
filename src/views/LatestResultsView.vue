<script setup>
import { ref, onMounted, watch } from 'vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR } from '@/utils/constants';
import MatchesInThisWeekComp from '@/components/MatchesInThisWeekComp.vue';
import { useRoute } from 'vue-router';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');
const isLoading = ref(false);
const route = useRoute();

/**
 * アクセス日から次の日曜日までに開催予定の試合を取得
 */
const getMatchesInThisWeek = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${MATCH_API_URL}/matches-in-this-week`);
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

        matchInfo.value = await response.json();
        if (matchInfo.value.length > 0) {
            return true;
        } else {
            noThisWeekMatchesMsg.value = '今週開催予定の試合はありません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

const scrollToTodayMatch = () => {
    // 日本時間で今日の日付を取得（YYYY-MM-DD形式）
    const today = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' }).split('/').map((num, index) => {
        if (index === 0) return num;
        return num.padStart(2, '0');
    }).join('-');
    
    // 今日の日付の要素を探す
    const todayElement = document.querySelector(`[data-date="${today}"]`);
    
    // 要素が見つかった場合、その要素の50ピクセル上までスクロール
    if (todayElement) {
        const elementPosition = todayElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - 110,
            behavior: 'smooth'
        });
    }
}

const scrollToCategory = (category) => {
    // カテゴリーに対応するmatch_categoryの値を設定
    const categoryMapping = {
        '２種': 'U-18',
        '３種': 'U-15',
        '４種・女子': 'U-12'
    };

    // 対応するmatch_categoryを持つ要素を探す
    const targetElement = document.querySelector(`[data-match-category="${categoryMapping[category]}"]`);
    
    // 要素が見つかった場合、その要素までスクロール
    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - 110,
            behavior: 'smooth'
        });
    }
}

const scrollToChampionship = (championshipName) => {
    // 大会名に対応する要素を探す
    const targetElement = document.querySelector(`[data-championship="${championshipName}"]`);
    
    // 要素が見つかった場合、その要素までスクロール
    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - 110,
            behavior: 'smooth'
        });
    }
}

// URLのクエリパラメータが変更されたときの処理
const handleRouteChange = () => {
    // データが読み込まれている場合のみスクロール処理を実行
    if (matchInfo.value.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const matchCategory = urlParams.get('match_category');
        const championship = urlParams.get('championship');
        
        if (championship) {
            scrollToChampionship(championship);
        } else if (matchCategory) {
            // match_categoryの値に基づいて対応するカテゴリー名を取得
            const categoryMapping = {
                'U-18': '２種',
                'U-15': '３種',
                'U-12': '４種・女子'
            };
            
            const category = categoryMapping[matchCategory];
            if (category) {
                scrollToCategory(category);
            }
        } else {
            scrollToTodayMatch();
        }
    }
};

// ルートのクエリパラメータの変更を監視
watch(() => route.query, () => {
    handleRouteChange();
});

onMounted(async () => {
    await getMatchesInThisWeek();
    // データが読み込まれた後に少し待ってからスクロール
    setTimeout(() => {
        handleRouteChange();
    }, 500);
});
</script>

<template>
    <div class="px-2 pt-2">
        <div class="flex flex-col justify-between items-center">
            <div v-if="isLoading" class="flex justify-center items-center mt-10">
                <img src="../assets/icons/loading.gif" alt="loading" class="w-10 h-10">
            </div>
            <div v-else>
                <MatchesInThisWeekComp :match-info="matchInfo" />
            </div>
        </div>
    </div>
</template>

<style></style>