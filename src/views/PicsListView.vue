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
const matchDates = ref([]);
const failedMsg = ref("");
const noTargetPicsMsg = ref("");

const openModal = (index) => {
    selectedImage.value = index;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedImage.value = null;
};

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

    const queryUrl = new URL(`${MATCH_API_URL}/match-dates`);
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

        matchDates.value = await response.json();
    } catch (error) {
        failedMsg.value =
            "大会情報の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。";
        console.error("大会情報の取得に失敗しました。");
    } finally {
        isLoading.value = false;
    }
};

const getTargetPics = async (matchDate) => {
    isLoading.value = true;

    const queryUrl = new URL(`${PICS_API_URL}/get-target-pics`);

    // GET用パラメータを追加
    queryUrl.searchParams.append("championshipId", championshipId.value);
    const targetDate = toIsoDate(matchDate);
    queryUrl.searchParams.append("matchDate", targetDate);

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

        targetPics.value = await response.json();

        if (targetPics.value.length === 0) {
            noTargetPicsMsg.value = "該当する画像はありません。";
        }
        if (targetPics.value.length > 0) {
            noTargetPicsMsg.value = "";
        }
    } catch (error) {
        failedMsg.value =
            "画像の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。";
        console.error("画像の取得に失敗しました。");
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
        <div class="p-2 text-sm">
            <h1 class="text-lg font-bold py-2">{{ championshipName }}</h1>
            <p>試合日を選択してください。</p>
            <span
                v-for="matchDate in matchDates"
                :key="matchDate.article_id"
                class="not-last:mr-3"
            >
                <span
                    class="cursor-pointer text-blue-600"
                    @click="getTargetPics(matchDate)"
                    >{{ matchDate }}</span
                >
            </span>
        </div>
        <div>
            <div v-if="isLoading" class="mt-20">
                <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
            </div>
            <div v-else>
                <div v-if="noTargetPicsMsg" class="mt-20">
                    <p class="text-center text-gray-500">{{ noTargetPicsMsg }}</p>
                </div>
                <div v-else class="grid grid-cols-3 gap-3 px-2">
                    <div v-for="(pic, index) in targetPics" :key="index" class="relative cursor-pointer aspect-square"
                        @click="openModal(index)">
                        <img :src="pic.pic_url" alt="高円宮杯 JFA U-18 サッカー2025北海道 ブロックリーグ札幌" class="w-full h-full object-cover">
                    </div>
                </div>
                <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    @click="closeModal">
                    <div class="relative w-[98vw] flex items-center justify-center">
                        <img :src="targetPics[selectedImage].pic_url" alt="高円宮杯 JFA U-18 サッカー2025北海道 ブロックリーグ札幌" class="w-full h-auto object-contain">
                        <button @click.stop="closeModal"
                            class="absolute top-2 right-2 text-white bg-black/50 rounded-full w-5 h-5 flex items-center justify-center">
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
