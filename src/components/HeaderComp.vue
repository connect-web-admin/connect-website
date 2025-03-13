<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// スライダー表示の画像URLを配列に入れると正しく動作しないので個別に指定
import firstSquare from '@/assets/slider/first-square.svg';
import sfa from '@/assets/slider/sfa-slider-banner.svg';
import sugenoTakanori from '@/assets/slider/sugeno-slider-banner.svg';

const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    signOut: {
        type: Function,
        default: () => { }
    },
    isAccountAvailable: Boolean
});

const router = useRouter();

/**
 * スライダー表示
 * onMountedでオブジェクトに設定された秒数ごとに画像を切り替える
 * onUnmountedでインターバルをクリア
 */
// 画像リスト
const imageList = ref([
    { src: firstSquare, alt: "株式会社ファーストスクエア", duration: 1000 },
    { src: sfa, alt: "札幌地区サッカー協会", duration: 2000 },
    { src: sugenoTakanori, alt: "菅野孝憲公式アプリ", duration: 5000 },
]);
const currentIndex = ref(0);
let interval = null;
// 次の画像を表示することを繰り返す
const nextImage = () => {
    // 0, 1, 2の繰り返し。配列のインデックス
    currentIndex.value = (currentIndex.value + 1) % imageList.value.length;
    // 次の画像の表示時間に合わせてインターバルを設定
    clearInterval(interval);
    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
};

/**
 * スライドバー下のメニュー表示
 */
const menuList = [
  { name: 'TOP', path: '/top' },
  { name: '結果速報', path: '/live-report-for-user' },
  { name: 'お知らせ', path: '/pickup-news' },
  { name: 'メディア', path: '/media' },
  { name: '大会日程', path: '/archive' },
  { name: 'チーム紹介', path: '/club-introduction' },
  { name: '写真', path: '/pics' }
];
const activeMenu = ref(0);

// メニュー項目をクリックしたときのナビゲーション処理
const navigateTo = (path, index) => {
  activeMenu.value = index;
  router.push(path);
};

/**
 * ハンバーガーメニューの開閉
 */
const isMenuOpen = ref(false);

/**
 * スクロール時にヘッダーを非表示にする
 */
const hideSlider = ref(false);
const handleScroll = () => {
    // スクロール位置を取得
    const scrollTop = window.scrollY;
    // スクロール位置が0の時だけスライダーを表示
    hideSlider.value = scrollTop !== 0;
}

// デバウンス関数の実装
const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};

// デバウンスされたスクロールハンドラー
const debouncedHandleScroll = debounce(handleScroll, 200); // デバウンス時間を2000msから200msに短縮 ー`

onMounted(() => {
    // 最初の画像の表示時間でタイマーを開始
    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
    // 下にスクロールするとスライダーを非表示にするスクロールイベントを追加
    window.addEventListener('scroll', debouncedHandleScroll);
});

onUnmounted(() => {
    // スライダーのインターバルをクリア
    clearInterval(interval);
    // 下にスクロールするとスライダーを非表示にするスクロールイベントを削除
    window.removeEventListener('scroll', debouncedHandleScroll);
});

// CSS
const navMenu = 'flex justify-between items-center px-4 h-[29px] border-b-1 border-gray-200';
const navMenuWithSubMenu = 'border-b-1 border-gray-200';
const subMenuLiNotLastChild = 'flex justify-between items-center h-[29px] pr-4 pl-8 border-b-1 border-gray-200 border-dashed';
const routerLinkClass = 'flex justify-between items-center w-full';
</script>

<template>
    <div>
        <div class="flex justify-between items-end pt-20 px-4 pb-4 h-20 border-b-1">
            <div>
                <img src="@/assets/icons/user-info.svg" alt="会員情報">
            </div>
            <div>
                <img src="@/assets/connect-title-logo.svg" alt="connectロゴ">
            </div>
            <div>
                <div @click="isMenuOpen = !isMenuOpen" class="cursor-pointer flex flex-col items-center">
                    <div class="w-[33px] h-0.5 bg-gray-400 mb-2"></div>
                    <div class="w-[33px] h-0.5 bg-gray-400 mb-2"></div>
                    <div class="w-[33px] h-0.5 bg-gray-400 "></div>
                    <div class="flex justify-center items-center w-[40px] text-gray-600">
                        <span class="text-[12px]">M</span>
                        <span class="text-[12px]">e</span>
                        <span class="text-[12px]">n</span>
                        <span class="text-[12px]">u</span>
                    </div>
                </div>
                <!-- ハンバーガーメニューの中身 -->
                <nav v-if="isMenuOpen" class="h-full pb-20">
                    <Transition enter-active-class="transition-transform duration-300 ease-in-out"
                        enter-from-class="translate-x-full" leave-to-class="translate-x-full"
                        leave-active-class="transition-transform duration-300 ease-in-out" mode="out-in">
                        <div class="absolute top-0 right-0 w-full z-9998 max-h-screen overflow-y-auto pb-50">
                            <div class="flex justify-between items-centerpx-3 pt-10 pb-6 border-b-1">
                                <div class="w-[33px] h-[33px]"></div>
                                <div class="text-center w-fit">メニュー</div>
                                <!-- ハンバーガーメニューを閉じるためのアイコン -->
                                <div @click="isMenuOpen = !isMenuOpen" class="cursor-pointer pr-4.5">
                                    <div class="w-[20px] h-0.5 my-2.5 bg-gray-400 mb-2 rotate-45"></div>
                                    <div class="w-[20px] h-0.5 -my-2.5 bg-gray-400 mb-2 -rotate-45"></div>
                                </div>
                            </div>
                            <div class="h-[43px] bg-[#090A0A]"></div>
                            <ul>
                                <li @click="isMenuOpen = !isMenuOpen" class="pt-2 pl-4">
                                    <router-link to="/login" class="flex items-center">
                                        <img src="@/assets/icons/person-portrait.svg" alt="ログイン" class="h-[16px]">
                                        ログイン
                                    </router-link>
                                </li>
                                <li class="flex items-end pl-4 h-[63px] bg-[#F1F2F4]">
                                    コンテンツ
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/" :class="routerLinkClass">
                                        <span>TOP</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li :class='navMenuWithSubMenu'>
                                    <span
                                        class="block h-[29px] pl-4 border-b-1 border-gray-200 border-dashed">結果速報</span>
                                    <ul>
                                        <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                            <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                <span>U-12（ジュニア）</span>
                                                <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                            </router-link>
                                        </li>
                                        <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                            <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                <span>U-15（ジュニアユース）</span>
                                                <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                            </router-link>
                                        </li>
                                        <li @click="isMenuOpen = !isMenuOpen"
                                            class="flex justify-between items-center h-[29px] pr-4 pl-8">
                                            <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                <span>U-18（ユース）</span>
                                                <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                            </router-link>
                                        </li>
                                    </ul>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/pickup-news" :class="routerLinkClass">
                                        <span>お知らせ</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/media" :class="routerLinkClass">
                                        <span>メディア</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/championship-schedule" :class="routerLinkClass">
                                        <span>大会日程</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/club-introduction" :class="routerLinkClass">
                                        <span>チーム紹介</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li :class='navMenuWithSubMenu'>
                                    <span class="block h-[29px] pl-4 border-b-1 border-gray-200 border-dashed">写真</span>
                                    <ul>
                                        <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                            <router-link to="/pics" :class="routerLinkClass">
                                                <span>写真</span>
                                                <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                            </router-link>
                                        </li>
                                        <li @click="isMenuOpen = !isMenuOpen"
                                            class="flex justify-between items-center h-[29px] pr-4 pl-8">
                                            <router-link to="/videos" :class="routerLinkClass">
                                                <span>動画</span>
                                                <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                            </router-link>
                                        </li>
                                    </ul>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                    <router-link to="/faq" :class="routerLinkClass">
                                        <span>FAQ</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                    <router-link to="/company-info" :class="routerLinkClass">
                                        <span>企業情報</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                    <router-link to="/specified-commercial-transactions-law-notations"
                                        :class="routerLinkClass">
                                        <span>特定商取引法に基づく表記</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                    <router-link to="/terms-of-service" :class="routerLinkClass">
                                        <span>利用規約</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                    <router-link to="/privacy-policy" :class="routerLinkClass">
                                        <span>プライバシーポリシー</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li>
                                <!-- <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                    <router-link to="/copyright-info" :class="routerLinkClass">
                                        <span>著作権情報</span>
                                        <img src="@/assets/icons/arrow_right.png" alt="矢印" class="h-[16px]">
                                    </router-link>
                                </li> -->
                            </ul>
                        </div>
                    </Transition>
                </nav>
            </div>
        </div>
        <!-- スライダー -->
        <div v-show="!hideSlider"
            class="flex items-center justify-center overflow-hidden w-full h-27 bg-black relative">
            <Transition enter-active-class="transition-transform duration-500 ease-in-out"
                enter-from-class="translate-x-full" leave-to-class="-translate-x-full"
                leave-active-class="transition-transform duration-500 ease-in-out" mode="out-in">
                <img :key="currentIndex" :src="imageList[currentIndex].src" :alt="imageList[currentIndex].alt"
                    class="absolute w-[428px] max-w-full h-full object-contain shadow-md" />
            </Transition>
        </div>
        <!-- スライダー直下の横スクロールメニュー -->
        <div class="overflow-x-auto">
            <ul class="flex justify-start items-end whitespace-nowrap bg-black text-white h-11 min-w-max px-4">
                <li v-for="(menu, index) in menuList" :key="index" @click="navigateTo(menu.path, index)" :class="[
                    'pb-1',
                    index === 0 ? 'ml-2 mr-4' : index === 6 ? 'ml-4 mr-2' : 'mx-4',
                    activeMenu === index ? 'text-[#7FCDEC] border-[#7FCDEC]' : 'text-white border-transparent',
                    'cursor-pointer border-b-2 transition-colors duration-200'
                ]">
                    {{ menu.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style></style>