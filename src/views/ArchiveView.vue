<script setup>
import { ref } from 'vue';

const selectedImage = ref(null);
const selectedAlt = ref('');
const isModalOpen = ref(false);

const openModal = (imgUrl, alt) => {
    selectedImage.value = imgUrl;
    selectedAlt.value = alt;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedImage.value = null;
    selectedAlt.value = '';
};

const category2 = [
    { championshipName: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌", imgUrl: "【画像リンク入力】", alt: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌" },
    { championshipName: "2024年度 札幌支部高等学校サッカー春季大会", imgUrl: "【画像リンク入力】", alt: "2024年度 札幌支部高等学校サッカー春季大会" },
    { championshipName: "第77回札幌支部高等学校サッカー選手権　兼 第77回北海道高等学校サッカー選手権札幌支部予選会", imgUrl: "【画像リンク入力】", alt: "第77回札幌支部高等学校サッカー選手権　兼 第77回北海道高等学校サッカー選手権札幌支部予選会" },
    { championshipName: "2024年度 第103回全国高校サッカー選手権大会 札幌地区予選会", imgUrl: "【画像リンク入力】", alt: "2024年度 第103回全国高校サッカー選手権大会 札幌地区予選会" },
    { championshipName: "全国戦績(第2種)", imgUrl: "【画像リンク入力】", alt: "全国戦績(第2種)" }
];

const category3 = [
    { championshipName: "高円宮杯 JFA U-15サッカーリーグ2024 第16回札幌ブロックカブスリーグ", imgUrl: "【画像リンク入力】", alt: "高円宮杯 JFA U-15サッカーリーグ2024 第16回札幌ブロックカブスリーグ" },
    { championshipName: "2024年度 第16回札幌地区カブスリーグU-15", imgUrl: "【画像リンク入力】", alt: "2024年度 第16回札幌地区カブスリーグU-15" },
    { championshipName: "第65回札幌市民スポーツ大会 中学生の部", imgUrl: "【画像リンク入力】", alt: "第65回札幌市民スポーツ大会 中学生の部" },
    { championshipName: "第27回札幌地区リーグカップU-15　兼 第55回札幌地区中学生サッカー選手権大会", imgUrl: "【画像リンク入力】", alt: "第27回札幌地区リーグカップU-15　兼 第55回札幌地区中学生サッカー選手権大会" },
    { championshipName: "2024年度 第17回SFAゆめカップ", imgUrl: "【画像リンク入力】", alt: "2024年度 第17回SFAゆめカップ" },
    { championshipName: "全国戦績(第3種)", imgUrl: "【画像リンク入力】", alt: "全国戦績(第3種)" }
];

const category4 = [
    { championshipName: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024", imgUrl: "【画像リンク入力】", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024" },
    { championshipName: "第20回山崎七郎杯8人制少年サッカー大会　兼 第21回岩内町長杯全道少年U-10サッカ-南北海道大会 札幌地区予選", imgUrl: "【画像リンク入力】", alt: "第20回山崎七郎杯8人制少年サッカー大会　兼 第21回岩内町長杯全道少年U-10サッカ-南北海道大会 札幌地区予選" },
    { championshipName: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選", imgUrl: "【画像リンク入力】", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選" },
    { championshipName: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選", imgUrl: "【画像リンク入力】", alt: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選" },
    { championshipName: "JFA 第48回全日本U-12サッカー選手権大会 札幌地区プレーオフ", imgUrl: "【画像リンク入力】", alt: "JFA 第48回全日本U-12サッカー選手権大会 札幌地区プレーオフ" },
    { championshipName: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo", imgUrl: "【画像リンク入力】", alt: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo" },
    { championshipName: "全道少年(U-12)8人制サッカー大会　兼 第22回JA全農杯全国小学生選抜サッカーIN北海道 札幌地区予選", imgUrl: "【画像リンク入力】", alt: "全道少年(U-12)8人制サッカー大会　兼 第22回JA全農杯全国小学生選抜サッカーIN北海道 札幌地区予選" },
    { championshipName: "全国戦績(第4種)", imgUrl: "【画像リンク入力】", alt: "全国戦績(第4種)" }
];

// 共通のスタイルクラス
const categorySectionClass = 'mt-2 p-2 border border-gray-300 rounded-lg';
const listItemClass = 'py-2 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-100';
</script>

<template>
    <div class="p-5">
        <div>
            <h1 class="text-xl font-bold">高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌</h1>
            <p>（成績表が作成され次第公開予定）</p>
            <!-- <img src="" alt="高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌 星取表" /> -->
        </div>
        <div class="mt-15">
            <h1 class="text-xl font-bold">アーカイブ</h1>
            <h2>2024年度（タップで画像を表示します）</h2>
            <div :class="categorySectionClass">
                <h3 class="text-xl font-semibold">２種</h3>
                <ul>
                    <li v-for="item in category2" :key="item.championshipName" 
                        :class="listItemClass"
                        @click="openModal(item.imgUrl, item.alt)">
                        {{ item.championshipName }}
                    </li>
                </ul>
            </div>
            <div :class="categorySectionClass">
                <h3 class="text-xl font-semibold mb-2">３種</h3>
                <ul>
                    <li v-for="item in category3" :key="item.championshipName" 
                        :class="listItemClass"
                        @click="openModal(item.imgUrl, item.alt)">
                        {{ item.championshipName }}
                    </li>
                </ul>
            </div>
            <div :class="categorySectionClass">
                <h3 class="text-xl font-semibold mb-2">４種</h3>
                <ul>
                    <li v-for="item in category4" :key="item.championshipName" 
                        :class="listItemClass"
                        @click="openModal(item.imgUrl, item.alt)">
                        {{ item.championshipName }}
                    </li>
                </ul>
            </div>
        </div>

        <!-- モーダル -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-4 rounded-lg max-w-4xl w-full mx-4">
                <div class="flex justify-end">
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mt-2">
                    <img v-if="selectedImage" :src="selectedImage" :alt="selectedAlt" class="max-w-full h-auto" />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>