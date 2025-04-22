<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MATCH_API_URL, FEP_API_URL } from "@/utils/constants";

const router = useRouter();
const championshipInfo = ref([]);

const getChampionshipInfo = async () => {
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

    // 大会情報を取得
    // const championshipId = router.currentRoute.value.params.championshipId;
    // console.log(championshipId);
});
</script>
<template>
    <div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-18（ユース）</h2>
            <ul>
                <li class="p-2">
                    <router-link to="/pics-list" class="block w-full"
                        >高円宮杯 JFA U-18 サッカー2025北海道
                        ブロックリーグ札幌</router-link
                    >
                </li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-15（ジュニアユース）</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-12（ジュニア）</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">WOMAN</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>
    </div>
</template>
<style></style>
