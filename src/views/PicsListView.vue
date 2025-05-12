<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
    THIS_FISCAL_YEAR,
    PICS_API_URL,
    ID_TOKEN_FOR_AUTH
} from "../utils/constants";

const router = useRouter();
const isLoading = ref(true);
const failedMsg = ref("");

const championshipId = ref(null);
const championshipName = ref(null);
const matchId = ref(null);
const club1 = ref(null);
const club2 = ref(null);
const matchDate = ref(null);
const selectedImage = ref(null);
const showModal = ref(false);
const targetPics = ref([]);
const noTargetPicsMsg = ref("");
const matchDateAfterChampionshipName = ref("");

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

const getTargetPics = async () => {
    isLoading.value = true;
    const queryUrl = new URL(`${PICS_API_URL}/get-target-pics-by-matchId`);

    // GET用パラメータを追加
    queryUrl.searchParams.append("championshipId", championshipId.value);
    queryUrl.searchParams.append("matchId", matchId.value);

    const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    if (!idToken) {
        failedMsg.value = '認証が無効です。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
        console.error('認証トークンが見つかりません。');
        return;
    }
    try {
        const response = await fetch(queryUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
            },
        });

        if (response.status === 401) {
            failedMsg.value = '認証が無効です。画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
            console.error('認証が無効です。');
            return;
        }

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
    matchId.value = router.currentRoute.value.params.matchId;
    matchDate.value = router.currentRoute.value.params.matchDate;
    club1.value = router.currentRoute.value.params.club1;
    club2.value = router.currentRoute.value.params.club2;

    await getTargetPics();
});
</script>
<template>
    <div class="p-2">
        <h1 class="text-lg font-bold py-2">
            {{ championshipName }}_{{ matchDate }}<br>{{ club1 }}&nbsp;-&nbsp;{{ club2 }}
        </h1>
        <div>
            <div v-if="isLoading" class="mt-20">
                <img
                    src="../assets/icons/loading.gif"
                    alt="読み込み中"
                    class="w-10 h-10 mx-auto"
                />
            </div>
            <div v-else>
                <div v-if="noTargetPicsMsg" class="mt-20">
                    <p class="text-center text-gray-500">
                        {{ noTargetPicsMsg }}
                    </p>
                </div>
                <div v-else class="grid grid-cols-3 gap-3 px-2">
                    <div
                        v-for="(pic, index) in targetPics"
                        :key="index"
                        class="relative cursor-pointer aspect-square"
                        @click="openModal(index)"
                    >
                        <img
                            :src="pic.pic_url"
                            :alt="championshipName"
                            class="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div
                    v-if="showModal"
                    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    @click="closeModal"
                >
                    <div
                        class="relative w-[98vw] flex items-center justify-center"
                    >
                        <img
                            :src="targetPics[selectedImage].pic_url"
                            :alt="championshipName"
                            class="w-full h-auto object-contain"
                        />
                        <button
                            @click.stop="closeModal"
                            class="absolute top-2 right-2 text-white bg-black/50 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
