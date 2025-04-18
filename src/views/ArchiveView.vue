<script setup>
import { ref, onMounted } from 'vue';

const selectedImage = ref(null);
const selectedImgAlt = ref('');
const isModalOpen = ref(false);

const openModal = (imgUrl, imgAlt) => {
    selectedImage.value = imgUrl;
    selectedImgAlt.value = imgAlt;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedImage.value = null;
    selectedImgAlt.value = '';
};

const category2 = [
    {
        championshipName: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/%E9%AB%98%E5%86%86%E5%AE%AE%E6%9D%AF+JFA+U-18%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC2024%E5%8C%97%E6%B5%B7%E9%81%93+%E3%83%95%E3%82%99%E3%83%AD%E3%83%83%E3%82%AF%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%9C%AD%E5%B9%8C_page-0001.jpg", alt: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/%E9%AB%98%E5%86%86%E5%AE%AE%E6%9D%AF+JFA+U-18%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC2024%E5%8C%97%E6%B5%B7%E9%81%93+%E3%83%95%E3%82%99%E3%83%AD%E3%83%83%E3%82%AF%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%9C%AD%E5%B9%8C_page-0002.jpg", alt: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/%E9%AB%98%E5%86%86%E5%AE%AE%E6%9D%AF+JFA+U-18%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC2024%E5%8C%97%E6%B5%B7%E9%81%93+%E3%83%95%E3%82%99%E3%83%AD%E3%83%83%E3%82%AF%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%9C%AD%E5%B9%8C_page-0003.jpg", alt: "高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌 画像3" }
        ]
    },
    {
        championshipName: "2024年度 札幌支部高等学校サッカー春季大会",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/2024%E5%B9%B4%E5%BA%A6+%E6%9C%AD%E5%B9%8C%E6%94%AF%E9%83%A8%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E6%98%A5%E5%AD%A3%E5%A4%A7%E4%BC%9A_page-0001.jpg", alt: "2024年度 札幌支部高等学校サッカー春季大会 画像1" }
        ]
    },
    {
        championshipName: "第77回札幌支部高等学校サッカー選手権　兼 第77回北海道高等学校サッカー選手権札幌支部予選会",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/%E7%AC%AC77%E5%9B%9E%E6%9C%AD%E5%B9%8C%E6%94%AF%E9%83%A8%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9+%E5%85%BC+%E7%AC%AC77%E5%9B%9E%E5%8C%97%E6%B5%B7%E9%81%93%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9%E6%9C%AD%E5%B9%8C%E6%94%AF%E9%83%A8%E4%BA%88%E9%81%B8%E4%BC%9A_page-0001.jpg", alt: "第77回札幌支部高等学校サッカー選手権　兼 第77回北海道高等学校サッカー選手権札幌支部予選会 画像1" }
        ]
    },
    {
        championshipName: "2024年度 第103回全国高校サッカー選手権大会 札幌地区予選会",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC103%E5%9B%9E%E5%85%A8%E5%9B%BD%E9%AB%98%E6%A0%A1%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A+%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8%E4%BC%9A_page-0001.jpg", alt: "2024年度 第103回全国高校サッカー選手権大会 札幌地区予選会 画像1" }
        ]
    },
    {
        championshipName: "全国戦績(第2種)",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat2/%E5%85%A8%E5%9B%BD%E6%88%A6%E7%B8%BE(%E7%AC%AC2%E7%A8%AE)_page-0001.jpg", alt: "全国戦績(第2種) 画像1" }
        ]
    }
];

const category3 = [
    {
        championshipName: "高円宮杯 JFA U-15サッカーリーグ2024 第16回札幌ブロックカブスリーグ",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/%E9%AB%98%E5%86%86%E5%AE%AE%E6%9D%AF+JFA+U-15%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024+%E7%AC%AC16%E5%9B%9E%E6%9C%AD%E5%B9%8C%E3%83%95%E3%82%99%E3%83%AD%E3%83%83%E3%82%AF%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99_page-0001.jpg", alt: "高円宮杯 JFA U-15サッカーリーグ2024 第16回札幌ブロックカブスリーグ 画像1" }
        ]
    },
    {
        championshipName: "2024年度 第16回札幌地区カブスリーグU-15",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC16%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99U-15_page-0001.jpg", alt: "2024年度 第16回札幌地区カブスリーグU-15 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC16%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99U-15_page-0002.jpg", alt: "2024年度 第16回札幌地区カブスリーグU-15 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC16%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99U-15_page-0003.jpg", alt: "2024年度 第16回札幌地区カブスリーグU-15 画像3" },
            { number: 4, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC16%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99U-15_page-0004.jpg", alt: "2024年度 第16回札幌地区カブスリーグU-15 画像4" }
        ]
    },
    {
        championshipName: "第65回札幌市民スポーツ大会 中学生の部",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/%E7%AC%AC65%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%B8%82%E6%B0%91%E3%82%B9%E3%83%9B%E3%82%9A%E3%83%BC%E3%83%84%E5%A4%A7%E4%BC%9A+%E4%B8%AD%E5%AD%A6%E7%94%9F%E3%81%AE%E9%83%A8_page-0001.jpg", alt: "第65回札幌市民スポーツ大会 中学生の部 画像1" }
        ]
    },
    {
        championshipName: "第27回札幌地区リーグカップU-15　兼 第55回札幌地区中学生サッカー選手権大会",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/%E7%AC%AC27%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E3%82%AB%E3%83%83%E3%83%95%E3%82%9AU-15+%E5%85%BC+%E7%AC%AC55%E5%9B%9E%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%B8%AD%E5%AD%A6%E7%94%9F%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A_page-0001.jpg", alt: "第27回札幌地区リーグカップU-15　兼 第55回札幌地区中学生サッカー選手権大会 画像1" }
        ]
    },
    {
        championshipName: "2024年度 第17回SFAゆめカップ",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/2024%E5%B9%B4%E5%BA%A6+%E7%AC%AC17%E5%9B%9ESFA%E3%82%86%E3%82%81%E3%82%AB%E3%83%83%E3%83%95%E3%82%9A_page-0001.jpg", alt: "2024年度 第17回SFAゆめカップ 画像1" }
        ]
    },
    {
        championshipName: "全国戦績(第3種)",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat3/%E5%85%A8%E5%9B%BD%E6%88%A6%E7%B8%BE(%E7%AC%AC3%E7%A8%AE)_page-0001.jpg", alt: "全国戦績(第3種) 画像1" }
        ]
    }
];

const category4 = [
    {
        championshipName: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0001.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0002.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0003.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像3" },
            { number: 4, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0004.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像4" },
            { number: 5, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0005.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像5" },
            { number: 6, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0006.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像6" },
            { number: 7, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0007.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像7" },
            { number: 8, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/U-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%20in%20%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992024_page-0008.jpg", alt: "U-12サッカーリーグ in 北海道 札幌地区リーグ2024 画像8" }
        ]
    },
    {
        championshipName: "第20回山崎七郎杯8人制少年サッカー大会　兼 第21回岩内町長杯全道少年U-10サッカ-南北海道大会 札幌地区予選",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E7%AC%AC20%E5%9B%9E%E5%B1%B1%E5%B4%8E%E4%B8%83%E9%83%8E%E6%9D%AF8%E4%BA%BA%E5%88%B6%E5%B0%91%E5%B9%B4%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E5%85%BC%20%E7%AC%AC21%E5%9B%9E%E5%B2%A9%E5%86%85%E7%94%BA%E9%95%B7%E6%9D%AF%E5%85%A8%E9%81%93%E5%B0%91%E5%B9%B4U-10%E3%82%B5%E3%83%83%E3%82%AB-%E5%8D%97%E5%8C%97%E6%B5%B7%E9%81%93%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0001.jpg", alt: "第20回山崎七郎杯8人制少年サッカー大会　兼 第21回岩内町長杯全道少年U-10サッカ-南北海道大会 札幌地区予選 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E7%AC%AC20%E5%9B%9E%E5%B1%B1%E5%B4%8E%E4%B8%83%E9%83%8E%E6%9D%AF8%E4%BA%BA%E5%88%B6%E5%B0%91%E5%B9%B4%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E5%85%BC%20%E7%AC%AC21%E5%9B%9E%E5%B2%A9%E5%86%85%E7%94%BA%E9%95%B7%E6%9D%AF%E5%85%A8%E9%81%93%E5%B0%91%E5%B9%B4U-10%E3%82%B5%E3%83%83%E3%82%AB-%E5%8D%97%E5%8C%97%E6%B5%B7%E9%81%93%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0002.jpg", alt: "第20回山崎七郎杯8人制少年サッカー大会　兼 第21回岩内町長杯全道少年U-10サッカ-南北海道大会 札幌地区予選 画像2" }
        ]
    },
    {
        championshipName: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%95%E3%82%B7%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3%E3%82%AF%E3%82%99%E3%83%AB%E3%83%BC%E3%83%95%E3%82%9APresents%202024%E3%83%AD%E3%83%8F%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3CUP%E7%AC%AC56%E5%9B%9E%E5%85%A8%E9%81%93%28U-12%29%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%B0%91%E5%B9%B4%E5%9B%A3%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0001.jpg", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%95%E3%82%B7%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3%E3%82%AF%E3%82%99%E3%83%AB%E3%83%BC%E3%83%95%E3%82%9APresents%202024%E3%83%AD%E3%83%8F%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3CUP%E7%AC%AC56%E5%9B%9E%E5%85%A8%E9%81%93%28U-12%29%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%B0%91%E5%B9%B4%E5%9B%A3%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0002.jpg", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%95%E3%82%B7%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3%E3%82%AF%E3%82%99%E3%83%AB%E3%83%BC%E3%83%95%E3%82%9APresents%202024%E3%83%AD%E3%83%8F%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3CUP%E7%AC%AC56%E5%9B%9E%E5%85%A8%E9%81%93%28U-12%29%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%B0%91%E5%B9%B4%E5%9B%A3%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0003.jpg", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選 画像3" },
            { number: 4, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%95%E3%82%B7%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3%E3%82%AF%E3%82%99%E3%83%AB%E3%83%BC%E3%83%95%E3%82%9APresents%202024%E3%83%AD%E3%83%8F%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3CUP%E7%AC%AC56%E5%9B%9E%E5%85%A8%E9%81%93%28U-12%29%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%B0%91%E5%B9%B4%E5%9B%A3%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0004.jpg", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選 画像4" },
            { number: 5, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%95%E3%82%B7%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3%E3%82%AF%E3%82%99%E3%83%AB%E3%83%BC%E3%83%95%E3%82%9APresents%202024%E3%83%AD%E3%83%8F%E3%82%99%E3%83%8F%E3%82%9A%E3%83%B3CUP%E7%AC%AC56%E5%9B%9E%E5%85%A8%E9%81%93%28U-12%29%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%B0%91%E5%B9%B4%E5%9B%A3%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0005.jpg", alt: "フジパングループPresents 2024ロバパンCUP　第56回全道(U-12)サッカー少年団大会 札幌地区予選 画像5" }
        ]
    },
    {
        championshipName: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E5%8D%94%E4%BC%9A%E6%9D%AF%20%E7%AC%AC36%E5%9B%9E%E5%85%A8%E9%81%93U-11%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0001.jpg", alt: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E5%8D%94%E4%BC%9A%E6%9D%AF%20%E7%AC%AC36%E5%9B%9E%E5%85%A8%E9%81%93U-11%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0002.jpg", alt: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E5%8D%94%E4%BC%9A%E6%9D%AF%20%E7%AC%AC36%E5%9B%9E%E5%85%A8%E9%81%93U-11%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0003.jpg", alt: "トラック協会杯 第36回全道U-11サッカー大会 札幌地区予選 画像3" }
        ]
    },
    {
        championshipName: "JFA 第48回全日本U-12サッカー選手権大会 札幌地区プレーオフ",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/JFA%20%E7%AC%AC48%E5%9B%9E%E5%85%A8%E6%97%A5%E6%9C%ACU-12%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%81%B8%E6%89%8B%E6%A8%A9%E5%A4%A7%E4%BC%9A%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E3%83%95%E3%82%9A%E3%83%AC%E3%83%BC%E3%82%AA%E3%83%95_page-0001.jpg", alt: "JFA 第48回全日本U-12サッカー選手権大会 札幌地区プレーオフ 画像1" }
        ]
    },
    {
        championshipName: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat4/%E7%AC%AC56%E5%9B%9E%E4%BC%9A%E9%95%B7%E6%9D%AF+%E5%85%BC+%E4%B8%AD%E5%B3%B6LC+supportship+%E7%AC%AC11%E5%9B%9E+Savanna+Cup+Sapporo_page-0001.jpg", alt: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo 画像1" },
            { number: 2, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat4/%E7%AC%AC56%E5%9B%9E%E4%BC%9A%E9%95%B7%E6%9D%AF+%E5%85%BC+%E4%B8%AD%E5%B3%B6LC+supportship+%E7%AC%AC11%E5%9B%9E+Savanna+Cup+Sapporo_page-0002.jpg", alt: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo 画像2" },
            { number: 3, url: "https://annual-report-championship-result.s3.ap-northeast-1.amazonaws.com/cat4/%E7%AC%AC56%E5%9B%9E%E4%BC%9A%E9%95%B7%E6%9D%AF+%E5%85%BC+%E4%B8%AD%E5%B3%B6LC+supportship+%E7%AC%AC11%E5%9B%9E+Savanna+Cup+Sapporo_page-0003.jpg", alt: "第56回会長杯 兼 中島LC supportship 第11回 Savanna Cup Sapporo 画像3" }
        ]
    },
    {
        championshipName: "全道少年(U-12)8人制サッカー大会　兼 第22回JA全農杯全国小学生選抜サッカーIN北海道 札幌地区予選",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E5%85%A8%E9%81%93%E5%B0%91%E5%B9%B4%28U-12%298%E4%BA%BA%E5%88%B6%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E5%A4%A7%E4%BC%9A%20%E5%85%BC%20%E7%AC%AC22%E5%9B%9EJA%E5%85%A8%E8%BE%B2%E6%9D%AF%E5%85%A8%E5%9B%BD%E5%B0%8F%E5%AD%A6%E7%94%9F%E9%81%B8%E6%8A%9C%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BCIN%E5%8C%97%E6%B5%B7%E9%81%93%20%E6%9C%AD%E5%B9%8C%E5%9C%B0%E5%8C%BA%E4%BA%88%E9%81%B8_page-0001.jpg", alt: "全道少年(U-12)8人制サッカー大会　兼 第22回JA全農杯全国小学生選抜サッカーIN北海道 札幌地区予選 画像1" }
        ]
    },
    {
        championshipName: "全国戦績(第4種)",
        images: [
            { number: 1, url: "https://annual-report-championship-result.s3.amazonaws.com/cat4/%E5%85%A8%E5%9B%BD%E6%88%A6%E7%B8%BE%28%E7%AC%AC4%E7%A8%AE%29_page-0001.jpg", alt: "全国戦績(第4種) 画像1" }
        ]
    }
];

// 共通のスタイルクラス
const categorySectionClass = 'mt-2 p-2 border border-gray-300 rounded-lg';
const listItemClass = 'py-2 border-b border-gray-200 last:border-b-0';
const imageNumberClass = 'inline-block px-1 mx-2 text-blue-500 border-b-1 cursor-pointer';

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>

<template>
    <div class="p-5">
        <h1 class="text-xl font-bold">大会日程／アーカイブ</h1>
        <div class="space-y-4 mt-8">
            <div class="space-y-3 border-b border-gray-200 pb-3">
                <h2>高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌</h2>
                <div class="flex flex-row justify-between gap-4">
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">大 会 概 要</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">組 み 合 せ</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center" @click="openModal('https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/archive/2025-04-12%2C2025-04-13/00_%E9%AB%98%E5%86%86%E5%AE%AE%E6%9D%AF_%E6%9C%AD%E5%B9%8C%E3%83%95%E3%82%99%E3%83%AD%E3%83%83%E3%82%AF%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%992025+(1%E7%AF%80%E8%A9%A6%E5%90%88%E7%B5%90%E6%9E%9C).jpg', '高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌')">試 合 結 果</p>
                </div>
            </div>

            <div class="space-y-3 border-b border-gray-200 pb-3">
                <h2>第19回北海道カブスリーグU-15 兼 高円宮杯JFAサッカーリーグ2025北海道１部</h2>
                <div class="flex flex-row justify-between gap-4">
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">大 会 概 要</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">組 み 合 せ</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center" @click="openModal('https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/archive/2025-04-12%2C2025-04-13/2025%E5%8C%97%E6%B5%B7%E9%81%93%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%98%9F%E5%8F%96%E8%A1%A8+U15%EF%BC%91%E9%83%A8.jpg', '第19回北海道カブスリーグU-15 兼 高円宮杯JFAサッカーリーグ2025北海道１部')">試 合 結 果</p>
                </div>
            </div>

            <div class="space-y-3 border-b border-gray-200 pb-3">
                <h2>第19回北海道カブスリーグU-15 兼 高円宮杯JFAサッカーリーグ2025北海道２部</h2>
                <div class="flex flex-row justify-between gap-4">
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">大 会 概 要</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">組 み 合 せ</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center" @click="openModal('https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/archive/2025-04-12%2C2025-04-13/2025%E5%8C%97%E6%B5%B7%E9%81%93%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%98%9F%E5%8F%96%E8%A1%A8+U15%EF%BC%92%E9%83%A8.jpg', '第19回北海道カブスリーグU-15 兼 高円宮杯JFAサッカーリーグ2025北海道２部')">試 合 結 果</p>
                </div>
            </div>

            <div class="space-y-3 border-b border-gray-200 pb-3">
                <h2>2025年度第17回北海道カブスリーグU-13 １部</h2>
                <div class="flex flex-row justify-between gap-4">
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">大 会 概 要</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">組 み 合 せ</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center" @click="openModal('https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/archive/2025-04-12%2C2025-04-13/2025%E5%8C%97%E6%B5%B7%E9%81%93%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%98%9F%E5%8F%96%E8%A1%A8+U13+1%E9%83%A8.jpg', '2025年度第17回北海道カブスリーグU-13 １部')">試 合 結 果</p>
                </div>
            </div>

            <div class="space-y-3 border-b border-gray-200 pb-3">
                <h2>2025年度第17回北海道カブスリーグU-13 ２部</h2>
                <div class="flex flex-row justify-between gap-4">
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">大 会 概 要</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center">組 み 合 せ</p>
                    <p class="text-white bg-black w-1/3 py-1 text-xs text-center" @click="openModal('https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/archive/2025-04-12%2C2025-04-13/2025%E5%8C%97%E6%B5%B7%E9%81%93%E3%82%AB%E3%83%95%E3%82%99%E3%82%B9%E3%83%AA%E3%83%BC%E3%82%AF%E3%82%99%E6%98%9F%E5%8F%96%E8%A1%A8+U15%EF%BC%92%E9%83%A8.jpg', '2025年度第17回北海道カブスリーグU-13 ２部')">試 合 結 果</p>
                </div>
            </div>

        </div>

        <div class="mt-15">
            <h2 class="text-2xl font-bold">2024年度</h2>
            <div :class="categorySectionClass">
                <h3 class="text-lg font-semibold">２種</h3>
                <ul>
                    <li v-for="item in category2" :key="item.championshipName" :class="listItemClass">
                        <div class="font-medium">{{ item.championshipName }}</div>
                        <div class="mt-2">
                            <span v-for="image in item.images" :key="image.number" :class="imageNumberClass"
                                @click="openModal(image.url, image.alt)">
                                {{ image.number }}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
            <div :class="categorySectionClass">
                <h3 class="text-lg font-semibold mb-2">３種</h3>
                <ul>
                    <li v-for="item in category3" :key="item.championshipName" :class="listItemClass">
                        <div class="font-medium">{{ item.championshipName }}</div>
                        <div class="mt-2">
                            <span v-for="image in item.images" :key="image.number" :class="imageNumberClass"
                                @click="openModal(image.url, image.alt)">
                                {{ image.number }}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
            <div :class="categorySectionClass">
                <h3 class="text-lg font-semibold mb-2">４種</h3>
                <ul>
                    <li v-for="item in category4" :key="item.championshipName" :class="listItemClass">
                        <div class="font-medium">{{ item.championshipName }}</div>
                        <div class="mt-2">
                            <span v-for="image in item.images" :key="image.number" :class="imageNumberClass"
                                @click="openModal(image.url, image.alt)">
                                {{ image.number }}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- モーダル -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click="closeModal">
            <div class="bg-white p-4 rounded-lg max-w-4xl w-full mx-4" @click.stop>
                <div class="flex justify-end">
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mt-2">
                    <img v-if="selectedImage" :src="selectedImage" :alt="selectedImgAlt" class="max-w-full h-auto" />
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