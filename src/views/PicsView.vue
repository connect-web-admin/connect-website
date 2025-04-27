<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MATCH_API_URL, THIS_FISCAL_YEAR } from "@/utils/constants";

const router = useRouter();
const championshipInfo = ref([]);
const noChampionshipMsg = ref('');
const isLoading = ref(true);

// カテゴリーの表示順序を定義
const categoryOrder = [
    'U-12（ジュニア）',
    'U-15（ジュニアユース）',
    'U-18（ユース）',
    'WOMAN'
];

const getChampionshipInfo = async () => {
    const queryUrl = new URL(`${MATCH_API_URL}/championship-names-ids`);
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

        const data = await response.json();
        
        // カテゴリーごとにデータをグループ化
        const groupedData = data.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        // カテゴリーの順序に従ってソート
        const sortedData = {};
        categoryOrder.forEach(category => {
            // データが存在しない場合でも空の配列を設定
            sortedData[category] = groupedData[category] || [];
        });

        championshipInfo.value = sortedData;

        if (Object.keys(championshipInfo.value).length > 0) {
            return true;
        } else {
            noChampionshipMsg.value = '大会情報がありません。';
            return false;
        }
    } catch (error) {
        console.error('速報対象試合の取得に失敗しました。');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: "auto",
    });

    // 大会情報を取得
    await getChampionshipInfo();
});
</script>
<template>
    <div>
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else>
            <div v-for="(championships, category) in championshipInfo" :key="category">
                <div v-if="category === 'U-18（ユース）'">
                    <h2 class="font-bold bg-gray-200 p-2">{{ category }}</h2>
                    <ul>
                        <li class="p-2 not-last:border-b-1 border-gray-300" v-for="championship in championships" :key="championship.championship_id">
                            <span v-if="championship.championship_id === 'TakamadonomiyaCup2025HokkaidoSapporoBlock'">
                                <router-link :to="`/pics-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </span>
                            <span v-else>
                                {{ championship.championship_name }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
