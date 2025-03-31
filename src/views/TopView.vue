<script setup>
import { onMounted } from 'vue';
import PickupNewsCompForTop from '@/components/PickupNewsCompForTop.vue';
import MediaCompForTop from '@/components/MediaCompForTop.vue';
const sampleChampionshipName = '第102回 全国高校サッカー選手権大会'
const sampleRound = '札幌地区予選会';
const sampleRoundName = 'Aブロック';


onMounted(async () => {
});
</script>

<template>
<div class="px-2 pt-2">
    <div >
        <h1 class="text-xl">今週の試合</h1>
        <div class="bg-black text-white w-fit px-1 mb-1">2025.2.22(Sat)</div>
        <div class="flex justify-between items-center border-t-1 border-gray-300 py-2">
            <div class="text-center px-2 mx-auto">
                <div>
                    <p>{{ sampleChampionshipName }}</p>
                    <p>{{ sampleRound }}</p>
                    <p>{{ sampleRoundName }}第一試合</p>
                </div>
                <div class="flex justify-between">
                    <div class="w-2/5 ">発寒南FC</div>
                    <div class="w-1/5 text-xl text-[#231815]">2 - 2</div>
                    <div class="w-2/5 ">清田FC</div>
                </div>
                <div>
                    <span class="text-[#F24D11] font-bold">2 PK 3</span>
                </div>
            </div>
        </div>
    </div>

    <div class="my-8">
        <h1 class="text-xl text-[#090A0A] border-b-1 border-gray-200">ピックアップニュース</h1>
        <PickupNewsCompForTop />
        <router-link to="/pickup-news" class="flex justify-end mt-5">
            <button class="bg-black text-white text-center px-5 py-2 rounded-md shadow-lg" >もっと読む</button>
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
                    <img src="@/assets/banners/jleague-club/consadole-banner.svg" alt="北海道コンサドーレ札幌" class="w-full h-8/10" />
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
                <img src="@/assets/banners/regional-association/hakodate-assoc.svg" alt="函館地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/otaru-assoc.svg" alt="小樽地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/sorachi-assoc.svg" alt="空知地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/asahikawa-assoc.svg" alt="旭川地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/kushiro-assoc.svg" alt="釧路地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/tokachi-assoc.svg" alt="十勝地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/muroran-assoc.svg" alt="室蘭地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/tomakomai-assoc.svg" alt="苫小牧地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/kitasorachi-assoc.svg" alt="北空知地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/chitose-assoc.svg" alt="千歳地区サッカー協会" class="w-full" />
                <img src="@/assets/banners/regional-association/okhotsk-assoc.svg" alt="オホーツク地区サッカー協会" class="w-full" />
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