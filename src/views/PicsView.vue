<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MATCH_API_URL, THIS_FISCAL_YEAR, ID_TOKEN_FOR_AUTH } from "@/utils/constants";

const router = useRouter();
const championshipInfo = ref([]);
const noChampionshipMsg = ref('');
const isLoading = ref(true);
const failedMsg = ref('');

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

    const idToken = localStorage.getItem(ID_TOKEN_FOR_AUTH);
    if (!idToken) {
        failedMsg.value = '認証トークンが見つかりません。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
        console.error('認証トークンが見つかりません。');
        isLoading.value = false;
        return;
    }

    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            failedMsg.value = '認証が無効です。ブラウザを更新しても改善しない場合は、画面右上のMenu最下部のログアウトボタンで一度ログアウトしてからログインをし直し、再度お試しください。';
            console.error('認証が無効です。');
            isLoading.value = false;
            return;
        }

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
            const categoryData = groupedData[category] || [];
            // 各カテゴリー内でchampionship_idの昇順でソート
            sortedData[category] = categoryData.sort((a, b) => {
                return a.championship_id.localeCompare(b.championship_id);
            });
        });

        championshipInfo.value = sortedData;
        console.log('championshipInfo', championshipInfo.value);

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
            <div v-if="failedMsg" class="p-4">
                <p>{{ failedMsg }}</p>
            </div>
            <div v-else>
                <div v-for="(championships, category) in championshipInfo" :key="category">
                    <div v-if="category === 'U-12（ジュニア）'">
                        <h2 class="font-bold bg-gray-200 p-2">{{ category }}</h2>
                        <div v-for="championship in championships" :key="championship.championship_id">
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === 'Ｕ―１２サッカーリーグｉｎ北海道 札幌地区リーグ2025（2部Aブロック）'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === 'U11 RISE LEAGUE'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div v-if="category === 'U-15（ジュニアユース）'">
                        <h2 class="font-bold bg-gray-200 p-2">{{ category }}</h2>
                        <div v-for="championship in championships" :key="championship.championship_id">
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === '高円宮杯 JFA U-15サッカーリーグ2025 第17回札幌ブロックカブスリーグ'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === '2025年度 第17回札幌地区カブスリーグU-15 Bグループ'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === '2025年度 第17回札幌地区カブスリーグU-15 Cグループ'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name === '2025年度 第17回札幌地区カブスリーグU-15 Dグループ'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div v-if="category === 'U-18（ユース）'">
                        <h2 class="font-bold bg-gray-200 p-2">{{ category }}</h2>
                        <div v-for="championship in championships" :key="championship.championship_id">
                            <div class="px-4 py-2 not-last:border-b-1 border-gray-300" v-if="championship.championship_name !== '第78回札幌支部高等学校サッカー選手権大会'">
                                <router-link :to="`/pics-match-list/${championship.championship_name}/${championship.championship_id}`" class="w-full text-blue-600 flex justify-between items-center">
                                    <p class="pr-2">{{ championship.championship_name }}</p>
                                    <img src="../assets/icons/arrow-right.png" alt="右矢印" class="w-4 h-4 inline-block">
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style></style>
