<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
    { src: firstSquare, alt: "株式会社ファーストスクエア", duration: 4000 },
    { src: sfa, alt: "札幌地区サッカー協会", duration: 4000 },
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
    { name: '結果速報', path: '/latest-results' },
    { name: 'お知らせ', path: '/pickup-news' },
    { name: 'メディア', path: '/media' },
    { name: '大会日程', path: '/archive' },
    { name: 'チーム紹介', path: '/club-list' },
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


/**
 * ログアウトしてローカルストレージのアイテムを削除
 */
const signOutAndDeleteItemsInLocalStorage = () => {
    // ローカルストレージのアイテムを削除
    localStorage.removeItem('email');
    localStorage.removeItem('idTokenForAuth');
    localStorage.removeItem('isAccountAvailable');
    localStorage.removeItem('userAttrSub');
    localStorage.removeItem('custom:membership_type');

    // ハンバーガーメニューを閉じる
    isMenuOpen.value = false;

    // Authenticator備え付けのログアウト用の関数
    props.signOut();

    router.push('/top');
}

// isMenuOpenの監視を追加
watch(isMenuOpen, (newValue) => {
    if (newValue) {
        // メニューが開いたときにbodyのスクロールを無効化
        document.body.style.overflow = 'hidden';
    } else {
        // メニューが閉じたときにbodyのスクロールを有効化
        document.body.style.overflow = 'auto';
    }
});

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
    document.body.style.overflow = 'auto';
});

// CSS
const navMenu = 'flex justify-between items-center px-4 h-[29px] border-b-1 border-gray-200';
const navMenuWithSubMenu = 'border-b-1 border-gray-200';
const subMenuLiNotLastChild = 'flex justify-between items-center h-[29px] pr-4 pl-8 border-b-1 border-gray-200 border-dashed';
const routerLinkClass = 'flex justify-between items-center w-full';
</script>

<template>
    <div class="bg-white">
        <div class="flex justify-between items-end py-2 border-b-1">
            <div class="ml-4">
                <router-link to="/member-info">
                    <img src="@/assets/icons/user-info.svg" alt="会員情報">
                </router-link>
            </div>
            <div>
                <router-link to="/top">
                    <img src="@/assets/connect-title-logo.svg" alt="connectロゴ">
                </router-link>
            </div>
            <div class="mr-4">
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
                <nav v-if="isMenuOpen" class="fixed inset-0 z-50">
                    <Transition enter-active-class="transition-transform duration-300 ease-in-out"
                        enter-from-class="translate-x-full" leave-to-class="translate-x-full"
                        leave-active-class="transition-transform duration-300 ease-in-out" mode="out-in">
                        <div class="absolute inset-0 bg-white overflow-y-auto">
                            <div class="min-h-full pb-[50px]">
                                <div class="flex justify-between items-center h-15">
                                    <div class="w-[33px] h-[33px]"></div>
                                    <div class="text-center">メニュー</div>
                                    <!-- ハンバーガーメニューを閉じるためのアイコン -->
                                    <div @click="isMenuOpen = !isMenuOpen" class="cursor-pointer pr-6">
                                        <div class="w-[20px] h-0.5 my-2.5 bg-gray-400 mb-2 rotate-45"></div>
                                        <div class="w-[20px] h-0.5 -my-2.5 bg-gray-400 mb-2 -rotate-45"></div>
                                    </div>
                                </div>
                                <div class="h-[43px] bg-[#090A0A]"></div>
                                <ul>
                                    <li @click="isMenuOpen = !isMenuOpen" class="flex items-center h-10 pl-4">
                                        <router-link to="/" class="flex items-center">
                                            <img src="@/assets/icons/person-shadow-portrait.svg" alt="ログイン"
                                                class="h-[16px]">
                                            ログイン
                                        </router-link>
                                    </li>
                                    <li class="flex items-end pl-4 h-10 bg-[#F1F2F4]">
                                        コンテンツ
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/" :class="routerLinkClass">
                                            TOP
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li :class='navMenuWithSubMenu'>
                                        <span
                                            class="block h-[29px] pl-4 border-b-1 border-gray-200 border-dashed">結果速報</span>
                                        <ul>
                                            <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                                <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                    U-12（ジュニア）
                                                    <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                                </router-link>
                                            </li>
                                            <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                                <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                    U-15（ジュニアユース）
                                                    <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                                </router-link>
                                            </li>
                                            <li @click="isMenuOpen = !isMenuOpen"
                                                class="flex justify-between items-center h-[29px] pr-4 pl-8">
                                                <router-link to="/live-report-for-user" :class="routerLinkClass">
                                                    U-18（ユース）
                                                    <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                                </router-link>
                                            </li>
                                        </ul>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/pickup-news" :class="routerLinkClass">
                                            お知らせ
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/media" :class="routerLinkClass">
                                            メディア
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/archive" :class="routerLinkClass">
                                            大会日程
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/club-list" :class="routerLinkClass">
                                            チーム紹介
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li :class='navMenuWithSubMenu'>
                                        <span class="block h-[29px] pl-4 border-b-1 border-gray-200 border-dashed">写真</span>
                                        <ul>
                                            <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                                <router-link to="/pics-category-list" :class="routerLinkClass">
                                                    写真
                                                    <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                                </router-link>
                                            </li>
                                            <li @click="isMenuOpen = !isMenuOpen"
                                                class="flex justify-between items-center h-[29px] pr-4 pl-8">
                                                <router-link to="/videos" :class="routerLinkClass">
                                                    動画
                                                    <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                                </router-link>
                                            </li>
                                        </ul>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/faq" :class="routerLinkClass">
                                            FAQ
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-gray-500">
                                        <router-link to="/site-info/company-info" :class="routerLinkClass">
                                            企業情報
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-gray-500">
                                        <router-link to="/site-info/specified-commercial-transactions-law-notations"
                                            :class="routerLinkClass">
                                            特定商取引法に基づく表記
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-gray-500">
                                        <router-link to="/site-info/terms-of-service" :class="routerLinkClass">
                                            利用規約
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-gray-500">
                                        <router-link to="/site-info/privacy-policy" :class="routerLinkClass">
                                            プライバシーポリシー
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li>
                                    <!-- <li @click="isMenuOpen = !isMenuOpen" :class="navMenu" class="text-xs">
                                        <router-link to="/copyright-info" :class="routerLinkClass">
                                            <span>著作権情報</span>
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
                                    </li> -->
                                </ul>
                                <router-link @click="signOutAndDeleteItemsInLocalStorage" to="/top" :class="routerLinkClass"
                                    class="text-gray-500 pl-4">
                                    ログアウト
                                </router-link>
                            </div>
                        </div>
                    </Transition>
                </nav>
            </div>
        </div>
        <!-- スライダー -->
        <div v-show="!hideSlider"
            class="flex items-center justify-center overflow-hidden w-full h-20 bg-black relative">
            <Transition enter-active-class="transition-transform duration-500 ease-in-out"
                enter-from-class="translate-x-full" leave-to-class="-translate-x-full"
                leave-active-class="transition-transform duration-500 ease-in-out" mode="out-in">
                <img :key="currentIndex" :src="imageList[currentIndex].src" :alt="imageList[currentIndex].alt"
                    class="absolute w-[428px] max-w-full h-full object-contain shadow-md" />
            </Transition>
        </div>
        <!-- スライダー直下の横スクロールメニュー -->
        <div class="overflow-x-auto">
            <ul
                class="flex flex-row justify-center items-end whitespace-nowrap bg-black pt-1 text-white min-w-max px-4">
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