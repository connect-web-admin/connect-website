<script setup>
import { computed, onMounted, ref } from 'vue';
import PickupNewsCompForTop from '@/components/PickupNewsCompForTop.vue';
import MediaCompForTop from '@/components/MediaCompForTop.vue';
import { MATCH_API_URL, ID_TOKEN_FOR_AUTH, THIS_FISCAL_YEAR, CATEGORIES } from '@/utils/constants';
import MatchesInThisWeekComp from '@/components/MatchesInThisWeekComp.vue';

const matchInfo = ref([]);
const noThisWeekMatchesMsg = ref('');

/**
 * 速報対象試合が、このページにアクセスした日の翌日に存在するかどうかで、ページ内容を表示するか判断
 */
const getMatchesInThisWeek = async () => {
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
    await getMatchesInThisWeek();
});
</script>

<template>
    <div class="px-2 pt-2">
        <div>
            <h1 class="text-xl pt-2">今週の試合</h1>
            <!-- <div class="bg-black text-white w-fit px-1 mb-1">2025.2.22(Sat)</div> -->
            <MatchesInThisWeekComp :match-info="matchInfo" />
        </div>

        <div class="my-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">ピックアップニュース</h1>
            <PickupNewsCompForTop />
            <router-link to="/pickup-news" class="flex justify-end mt-5">
                <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg">もっと読む</button>
            </router-link>
        </div>

        <div class="mb-8">
            <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">メディア</h1>
            <MediaCompForTop />
            <router-link to="/media" class="flex justify-end mt-5">
                <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg">もっと読む</button>
            </router-link>
        </div>

        <div>
            <div class="mb-8">
                <p class="bg-black text-white text-center font-light mb-2">提　携</p>
                <div class="flex justify-between">
                    <img src="@/assets/banners/partner/safa-banner.svg" alt="札幌地区サッカー協会" class="w-49/100" />
                    <img src="@/assets/banners/partner/sugeno-banner.svg" alt="菅野孝憲公式アプリ" class="w-49/100" />
                </div>
            </div>
            <div class="mb-8">
                <p class="bg-black text-white text-center font-light mb-2">リ　ー　グ　・　チ　ー　ム</p>
                <div class="grid grid-cols-3">
                    <div>
                        <img src="@/assets/banners/jleague-club/jleague-banner.svg" alt="Jリーグ" class="w-full" />
                    </div>
                    <div>
                        <img src="@/assets/banners/jleague-club/consadole-banner.svg" alt="北海道コンサドーレ札幌"
                            class="w-full h-8/10" />
                    </div>
                    <div>
                        <img src="@/assets/banners/jleague-club/espolada-banner.svg" alt="エスポラーダ北海道" class="w-full" />
                    </div>
                </div>
            </div>
            <div class="mb-8">
                <p class="bg-black text-white text-center font-light mb-2">サ　ッ　カ　ー　協　会</p>
                <div class="flex justify-between">
                    <img src="@/assets/banners/football-association/jfa.svg" alt="日本サッカー協会" class="w-49/100" />
                    <img src="@/assets/banners/football-association/hfa.svg" alt="北海道サッカー協会" class="w-49/100" />
                </div>
            </div>

            <div class="mb-8">
                <p class="bg-black text-white text-center font-light mb-2">地　区　協　会</p>
                <div class="grid grid-cols-2 gap-y-3 gap-x-2">
                    <img src="@/assets/banners/regional-association/hakodate-assoc.svg" alt="函館地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/otaru-assoc.svg" alt="小樽地区サッカー協会" class="w-full" />
                    <img src="@/assets/banners/regional-association/sorachi-assoc.svg" alt="空知地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/asahikawa-assoc.svg" alt="旭川地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/kushiro-assoc.svg" alt="釧路地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/tokachi-assoc.svg" alt="十勝地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/muroran-assoc.svg" alt="室蘭地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/tomakomai-assoc.svg" alt="苫小牧地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/kitasorachi-assoc.svg" alt="北空知地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/chitose-assoc.svg" alt="千歳地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/okhotsk-assoc.svg" alt="オホーツク地区サッカー協会"
                        class="w-full" />
                    <img src="@/assets/banners/regional-association/nemuro-assoc.svg" alt="根室地区サッカー協会" class="w-full" />
                    <img src="@/assets/banners/regional-association/souya-assoc.svg" alt="宗谷地区サッカー協会" class="w-full" />
                </div>
            </div>

            <div>
                <p class="bg-black text-white text-center font-light mb-2">そ　の　他　連　盟　等</p>
                <div class="grid grid-cols-2 gap-y-3 gap-x-2">
                    <img src="@/assets/banners/others/sp-takamadonomiya.svg" alt="札幌地区サッカー協会" class="w-full" />
                    <img src="@/assets/banners/others/sjfa.svg" alt="札幌地区少年サッカー連盟" class="h-full" />
                    <img src="@/assets/banners/others/hokkaido-futsal.svg" alt="北海道フットサル連盟" class="w-full" />
                    <img src="@/assets/banners/others/sapporo-futsal.svg" alt="札幌フットサル連盟" class="w-full" />
                    <img src="@/assets/banners/others/chutairen.svg" alt="北海道中学校体育連盟" class="w-full" />
                    <img src="@/assets/banners/others/jcy.svg" alt="日本クラブユースサッカー連盟" class="w-full" />
                    <img src="@/assets/banners/others/amusement.svg" alt="札幌サッカーアミューズメントパーク" class="w-full" />
                    <img src="@/assets/banners/others/highschool-soccer.svg" alt="高校サッカードットコム" class="h-full" />
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>