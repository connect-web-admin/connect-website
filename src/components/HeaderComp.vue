<script setup>
import { MEMBER_API_URL, USER_ATTR_SESSION_ID, USER_ATTR_EMAIL } from '@/utils/constants';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

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
const route = useRoute();

const EXTREME_LEFT_MENU_INDEX = 0;
const EXTREME_RIGHT_MENU_INDEX = 6;

/**
* スライダー表示
* onMountedでオブジェクトに設定された秒数ごとに画像を切り替える
* onUnmountedでインターバルをクリア
*/

// 画像リスト
const imageList = ref([
    { src: 'https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/banner-link-img/slider/banner-coconosusukino.png', alt: "ココノススキノ", duration: 10000, url: 'https://cocono-susukino.jp' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/banner-link-img/slider/banner-sd-entertainment.jpg', alt: "SDエンターテイメント株式会社", duration: 10000, url: 'https://www.sd-fit.jp/' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/banner-link-img/slider/banner-tuners.png', alt: "株式会社TUNERS", duration: 10000, url: 'https://tuners-japan.com' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/banner-link-img/%E6%9C%AD%E5%B9%8C%E6%B5%B7%E9%AE%AE%E4%B8%B8%E3%83%8F%E3%82%99%E3%83%8A%E3%83%BC%EF%BC%88%E5%87%BA%E5%89%8D%E5%AF%BF%E5%8F%B8%E8%A1%A8%E8%A8%98%EF%BC%89.jpg', alt: "札幌海鮮丸", duration: 10000, url: 'https://www.kaisenmaru.co.jp/' },
]);

const currentIndex = ref(0);
let interval = null;

// アニメーション方向を制御するための変数を追加
const isForward = ref(true);

// 特定のインデックスの画像に移動する関数を追加
const goToImage = (index) => {
    isForward.value = index > currentIndex.value;
    currentIndex.value = index;
    clearInterval(interval);
    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
};


// 次の画像を表示することを繰り返す
const nextImage = () => {
    isForward.value = true;

    // 0, 1, 2の繰り返し。配列のインデックス
    currentIndex.value = (currentIndex.value + 1) % imageList.value.length;

    // 次の画像の表示時間に合わせてインターバルを設定
    clearInterval(interval);

    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
};



// 前の画像に移動する関数を追加
const prevImage = () => {
    isForward.value = false;
    currentIndex.value = (currentIndex.value - 1 + imageList.value.length) % imageList.value.length;
    clearInterval(interval);
    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
};

/**
* スライダー下のメニュー表示
*/

const menuList = [
    { name: 'TOP', path: '/top', position: 0 },
    { name: '結果速報', path: '/latest-results', position: 0 },
    { name: 'お知らせ', path: '/pickup-news', position: 0 },
    { name: 'メディア', path: '/media', position: 0 },
    { name: '大会日程', path: '/archive', position: 0 },
    { name: 'チーム紹介', path: '/club-list', position: 0 },
    { name: '写真', path: '/pics', position: 0 }
];

const activeMenu = ref(0);
const isResultsSubmenuOpen = ref(false);

// メニュー項目の位置を更新する関数
const updateMenuPositions = () => {
    const menuItems = document.querySelectorAll('.overflow-x-auto ul li');
    menuItems.forEach((item, index) => {
        if (menuList[index]) {
            const rect = item.getBoundingClientRect();
            menuList[index].position = rect.left + (rect.width / 2) - 52.5; // サブメニューの幅の半分を引く
        }
    });
};

// メニュー項目をクリックしたときのナビゲーション処理
const navigateTo = (path, index) => {
    if (menuList[index].submenu) {
        updateMenuPositions(); // サブメニューを開く前に位置を更新
        isResultsSubmenuOpen.value = !isResultsSubmenuOpen.value;
    } else {
        activeMenu.value = index;
        isResultsSubmenuOpen.value = false; // 他のメニューをクリックした時にサブメニューを非表示にする
        router.push(path);
    }
};

// ハンバーガーメニューの開閉
const isMenuOpen = ref(false);

// スクロール時にヘッダーを非表示にする
const hideSlider = ref(false);
const handleScroll = () => {
    // スクロール位置を取得
    const scrollTop = window.scrollY;

    // スクロール位置が0の時だけスライダーを表示
    hideSlider.value = scrollTop !== 0;
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

// ルートの変更を監視してactiveMenuを更新
watch(() => route.path, (newPath) => {
    let index = menuList.findIndex(menu => menu.path === newPath);
    
    // 完全一致しない場合、部分一致をチェック
    if (index === -1) {
        const pathPrefix = newPath.split('/')[1]; // パスの最初の部分を取得
        switch (pathPrefix) {
            case 'latest-results-by-championship':
                index = menuList.findIndex(menu => menu.path === '/latest-results');
                break;
            case 'pickup-news':
                index = menuList.findIndex(menu => menu.path === '/pickup-news');
                break;
            case 'media':
                index = menuList.findIndex(menu => menu.path === '/media');
                break;
            case 'archive':
                index = menuList.findIndex(menu => menu.path === '/archive');
                break;
            case 'club-list':
                index = menuList.findIndex(menu => menu.path === '/club-list');
                break;
            case 'pics':
                index = menuList.findIndex(menu => menu.path === '/pics');
                break;
        }
    }
    
    if (index !== -1) {
        activeMenu.value = index;
    }
}, { immediate: true });

onMounted(() => {
    // 最初の画像の表示時間でタイマーを開始
    interval = setTimeout(nextImage, imageList.value[currentIndex.value].duration);
    // 下にスクロールするとスライダーを非表示にするスクロールイベントを追加
    window.addEventListener('scroll', handleScroll);
    // ウィンドウのリサイズ時にメニュー位置を更新
    window.addEventListener('resize', updateMenuPositions);
});

onUnmounted(() => {
    // スライダーのインターバルをクリア
    clearInterval(interval);

    // 下にスクロールするとスライダーを非表示にするスクロールイベントを削除
    window.removeEventListener('scroll', handleScroll);
    document.body.style.overflow = 'auto';

    // ウィンドウのリサイズ時にメニュー位置を更新
    window.removeEventListener('resize', updateMenuPositions);

});



// CSS
const navMenu = 'flex justify-between items-center px-4 h-[29px] border-b-1 border-gray-200';
const navMenuWithSubMenu = 'border-b-1 border-gray-200';
const subMenuLiNotLastChild = 'flex justify-between items-center h-[29px] pr-4 pl-8 border-b-1 border-gray-200 border-dashed';
const routerLinkClass = 'flex justify-between items-center w-full';

// 画像クリック時の処理を追加
const handleImageClick = (url) => {
    window.open(url, '_blank');
};
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
                                    <li @click="isMenuOpen = !isMenuOpen" :class="navMenu">
                                        <router-link to="/latest-results" :class="routerLinkClass">
                                            結果速報
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
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
                                        <span
                                            class="block h-[29px] pl-4 border-b-1 border-gray-200 border-dashed">写真</span>
                                        <ul>
                                            <li @click="isMenuOpen = !isMenuOpen" :class="subMenuLiNotLastChild">
                                                <router-link to="/pics" :class="routerLinkClass">
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
                                        <router-link to="/coupon" :class="routerLinkClass">
                                            クーポン
                                            <img src="@/assets/icons/arrow-right.png" alt="矢印" class="h-[16px]">
                                        </router-link>
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
                                </ul>
                            </div>
                        </div>
                    </Transition>
                </nav>
            </div>
        </div>
        <!-- スライダー -->
        <div v-show="!hideSlider"
            class="flex items-center justify-center overflow-hidden w-full h-20 bg-black relative">
            <!-- 前の画像ボタン -->
            <button @click="prevImage"
                class="absolute left-0 z-10 text-white hover:text-gray-300 transition-colors w-20 h-full flex items-center justify-center">
                <img src="@/assets/icons/arrow-backward.svg" alt="前の画像" class="h-7 w-7">
            </button>
            <!-- 次の画像ボタン -->
            <button @click="nextImage"
                class="absolute right-0 z-10 text-white hover:text-gray-300 transition-colors w-20 h-full flex items-center justify-center">
                <img src="@/assets/icons/arrow-forward.svg" alt="次の画像" class="h-7 w-7">
            </button>
            <Transition
                :enter-active-class="isForward ? 'transition-transform duration-500 ease-in-out' : 'transition-transform duration-500 ease-in-out'"
                :enter-from-class="isForward ? 'translate-x-full' : '-translate-x-full'"
                :leave-to-class="isForward ? '-translate-x-full' : 'translate-x-full'"
                :leave-active-class="isForward ? 'transition-transform duration-500 ease-in-out' : 'transition-transform duration-500 ease-in-out'"
                mode="out-in">
                <img :key="currentIndex" :src="imageList[currentIndex].src" :alt="imageList[currentIndex].alt"
                    @click="handleImageClick(imageList[currentIndex].url)"
                    class="absolute w-[428px] max-w-full h-full object-contain shadow-md cursor-pointer" />
            </Transition>
            <!-- ナビゲーションドット -->
            <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-6 z-10">
                <button v-for="(_, index) in imageList" :key="index" @click="goToImage(index)"
                    class="w-2 h-2 flex items-center justify-center rounded-full transition-colors duration-200"
                    :class="currentIndex === index ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'">
                    <div class="w-1 h-1 rounded-full" :class="currentIndex === index ? 'bg-black' : 'bg-white'"></div>
                </button>
            </div>
        </div>
        <!-- スライダー直下の横スクロールメニュー -->
        <div class="overflow-x-auto">
            <ul
                class="flex flex-row justify-center items-end whitespace-nowrap bg-black pt-1 text-white min-w-max px-4 relative">
                <li v-for="(menu, index) in menuList" :key="index" @click="navigateTo(menu.path, index)" :class="[
                    'pb-1',
                    index === EXTREME_LEFT_MENU_INDEX ? 'ml-2 mr-4' : index === EXTREME_RIGHT_MENU_INDEX ? 'ml-4 mr-2' : 'mx-4',
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