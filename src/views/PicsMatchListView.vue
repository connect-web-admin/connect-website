<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
    MATCH_API_URL,
    THIS_FISCAL_YEAR,
    PICS_API_URL,
} from "../utils/constants";

const router = useRouter();
const selectedImage = ref(null);
const showModal = ref(false);
const championshipId = ref(null);
const championshipName = ref(null);
const isLoading = ref(true);
const targetPics = ref([]);
const matchesWithPics = ref([]);
const failedMsg = ref("");
const noTargetPicsMsg = ref("");
const matchDateAfterChampionshipName = ref("");
const championshipInfo = ref([]);

/**
 * "M/D" または "MM/DD" 形式の文字列を
 * "YYYY-MM-DD" 形式に変換
 */
function toIsoDate(mAndD) {
    // スラッシュで分割して数値化
    const [m, d] = mAndD.split("/").map((n) => parseInt(n, 10));
    // 2桁ゼロパディング
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${THIS_FISCAL_YEAR}-${mm}-${dd}`;
}

const getTargetChampionshipInfo = async () => {
    isLoading.value = true;

    const queryUrl = new URL(`${MATCH_API_URL}/target-championship`);
    queryUrl.searchParams.append("championshipId", championshipId.value);
    queryUrl.searchParams.append("fiscalYear", THIS_FISCAL_YEAR);

    try {
        const response = await fetch(queryUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        championshipInfo.value = await response.json();
        matchesWithPics.value = Object.values(championshipInfo.value.matches)
            .flatMap(block =>
                Object.entries(block)
                .filter(([key, match]) => key !== 'round_id' && match.has_pics)
                .map(([_, match]) => match)
            )
            .sort((a, b) => b.match_date.localeCompare(a.match_date));
    } catch (error) {
        failedMsg.value =
            "大会情報の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。";
        console.error("大会情報の取得に失敗しました。");
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: "auto",
    });

    // 大会IDをルートから取得
    championshipId.value = router.currentRoute.value.params.championshipId;
    championshipName.value = router.currentRoute.value.params.championshipName;

    // 大会IDをもとに、大会情報を取得
    await getTargetChampionshipInfo();
});
</script>
<template>
    <div>
        <div class="p-2 text-sm space-y-3">
            <h1 class="text-lg font-bold py-2">
                {{ championshipName }}&nbsp;{{ matchDateAfterChampionshipName }}
            </h1>
            <p>表示対象試合を選択してください。</p>
            <div
                v-for="match in matchesWithPics"
                :key="match.match_id"
                class="text-blue-600 underline"
            >
                <router-link :to="`/pics-list/${championshipName}/${championshipId}/${match.match_id}/${match.match_date}/${match.home_club.club_name}/${match.away_club.club_name}`" class="w-full text-blue-600 flex justify-between items-center">
                    <p>{{ match.match_date }}&nbsp;{{ match.home_club.club_name }}&nbsp;-&nbsp;{{ match.away_club.club_name }}</p>
                </router-link>
            </div>
        </div>
    </div>
</template>
<style></style>
