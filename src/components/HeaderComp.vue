<script setup>
import { ref, onMounted, onUnmounted } from 'vue'


const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    signOut: {
        type: Function,
        default: () => {}
    },
    isAccountAvailable: Boolean
})

// ハンバーガーメニュー、アコーディオンメニューの表示・非表示
const isActive = ref(false)
const isMenuOpen = ref(false)
const isResultReportMenuOpen = ref(false)
const isPicVidMenuOpen = ref(false)
const hideBanner = ref(false);

// ハンバーガーメニュー、アコーディオンメニューの表示・非表示
const toggleMenu = () => {
    isActive.value = !isActive.value
    isMenuOpen.value = !isMenuOpen.value
}
const toggleResultReportMenuOpen = () => {
    isResultReportMenuOpen.value = !isResultReportMenuOpen.value
}
const togglePicVidMenuOpen = () => {
    isPicVidMenuOpen.value = !isPicVidMenuOpen.value
}

const handleScroll = () => {
    // スクロール位置を取得
    const scrollTop = window.scrollY;

    // 特定のスクロール位置でブロックを非表示にする
    hideBanner.value = scrollTop > 35; // 35pxを閾値として設定
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
})
</script>

<template>
<div class="header-wrapper">
    <div class="top-contents">
        <div class="account-info-container">
            <img src="../assets/icons/icon_account.png" />
            <span>会員情報</span>
        </div>

        <div>
            <img src="../assets/connect_title_logo.png" />
        </div>

        <div class="hamburger-menu-container">
            <div class="hamburger-menu" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div v-if="isMenuOpen" class="hamburger-menu-state">
                <span>B</span>
                <span>a</span>
                <span>c</span>
                <span>k</span>
            </div>
            <div v-else class="hamburger-menu-state">
                <span>M</span>
                <span>e</span>
                <span>n</span>
                <span>u</span>
            </div>
        </div>
        <nav v-show="isMenuOpen" class="nav-menu">
            <div class="item-in-nav-menu">
                <p>TOP</p>
            </div>
            <div @click="toggleResultReportMenuOpen" class="item-in-nav-menu align-both-ends">
                <p>結果速報</p>
                <span v-if="isResultReportMenuOpen">▲</span>
                <span v-else>▼</span>
            </div>
            <div v-show="isResultReportMenuOpen">
                <ul>
                    <li class="item-in-nav-menu sub-item">高校生</li>
                    <li class="item-in-nav-menu sub-item">中学生</li>
                    <li class="item-in-nav-menu sub-item">小学生</li>
                </ul>
            </div>
            <div class="item-in-nav-menu">
                <p>チーム紹介</p>
            </div>
            <div @click="togglePicVidMenuOpen" class="item-in-nav-menu align-both-ends">
                <p>写真・動画</p>
                <span v-if="isPicVidMenuOpen">▲</span>
                <span v-else>▼</span>
            </div>
            <div v-show="isPicVidMenuOpen">
                <ul>
                    <li class="item-in-nav-menu sub-item">写真</li>
                    <li class="item-in-nav-menu sub-item">動画</li>
                </ul>
            </div>
            <div class="item-in-nav-menu">
                <p>アーカイブ</p>
            </div>
            <div class="item-in-nav-menu">
                <p>メディア</p>
            </div>
            <div class="sns-icons-container">
                <div class="sns-icons-inner">
                    <img src="../assets/sns_logos/x_icon.png" />
                    <img src="../assets/sns_logos/facebook_icon.png" />
                    <img src="../assets/sns_logos/youtube_icon.png" />
                </div>
            </div>
            <aside class="nav-menu-aside">会社概要</aside>
            <aside class="nav-menu-aside">プライバシーポリシー</aside>
            <div class="auth-buttons">
                <template v-if="user">
                    <button @click="signOut" class="auth-btn logout-btn">Log Out</button>
                </template>
                <template v-else>
                    <button @click="$router.push('/login')" class="auth-btn login-btn">Log In</button>
                    <button @click="$router.push('/signup')" class="auth-btn signup-btn">Sign Up</button>
                </template>
            </div>
        </nav>
    </div>

    <div v-show="!hideBanner" class="banner-wrapper">
        <div class="banner-container-partners">
            <div class="banner-index-partners">
                <span>協</span>
                <span>賛</span>
            </div>
            <div class="banner-partners">
                <img class="banner-partners-1" src="../assets/banners/partner/JFA.png" />
                <img class="banner-partners-2" src="../assets/banners/partner/HFA.png" />
                <img class="banner-partners-3" src="../assets/banners/partner/SFA.png" />
            </div>
        </div>
        
        <div class="banner-container-links">
            <div class="banner-index-links">
                <span>リ</span>
                <span>ン</span>
                <span>ク</span>
            </div>
            <div class="banner-links">
                <div class="banner-links-first-line">
                    <img class="banner-links-first-line-1" src="../assets/banners/link/consa.png" />
                    <img class="banner-links-first-line-2" src="../assets/banners/link/espo.png" />
                    <img class="banner-links-first-line-3" src="../assets/banners/link/sjfa.png" />
                </div>
                <div class="banner-links-second-line">
                    <img class="banner-links-second-line-1" src="../assets/banners/link/hfutsal.png" />
                    <img class="banner-links-second-line-2" src="../assets/banners/link/sfs.png" />
                </div>
            </div>
        </div>
    </div>

    <div class="menu-wrapper">
        <ul class="menu-container">
            <li class="menu-item"><span class="active-red-line">TOP</span></li>
            <li class="menu-item"><router-link to="/latest-results"><span class="active-red-line">結果速報</span></router-link></li>
            <li class="menu-item"><router-link to="/club-list"><span class="active-red-line">チーム紹介</span></router-link></li>
            <li class="menu-item"><span class="active-red-line">写真</span></li>
            <li class="menu-item"><span class="active-red-line">アーカイブ</span></li>
            <li class="menu-item"><span class="active-red-line">メディア</span></li>
        </ul>
    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .header-wrapper {
        width: 100%;
        background: linear-gradient(#F5FCFF 50%, #7FCDEC);
        padding-top: 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    .top-contents {
        height: 60px;
        padding: 5px 30px 15px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
    }

    /* --------------
    ハンバーガーメニュー
    ---------------*/
    .hamburger-menu-container {
        width: 35px;
        height: 33px;
    }

    .hamburger-menu {
        width: 33px;
        height: 18px;
        position: relative;
        margin: 0 auto;
    }

    .hamburger-menu span {
        display: block;
        position: absolute;
        height: 1px;
        width: 100%;
        background: #333;
        border-radius: 3px;
        left: 0;
        transition: all 0.3s ease-out;
    }

    .hamburger-menu span:nth-child(1) {
        top: 0;
    }

    .hamburger-menu span:nth-child(2) {
        top: 50%;
        transform: translateY(-50%);
    }

    .hamburger-menu span:nth-child(3) {
        bottom: 0;
    }

    .hamburger-menu.active span:nth-child(1) {
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
    }

    .hamburger-menu.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger-menu.active span:nth-child(3) {
        bottom: 50%;
        transform: translateY(50%) rotate(-45deg);
    }

    .hamburger-menu-state {
        font-size: 0.8em;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    /* ---------------------------------
    ハンバーガーメニューで開閉されるナビメニュー
    --------------------------------- */
    .nav-menu {
        position: absolute;
        top: 100px;
        left: 0;
        width: 100%;
        height: 80vh;
        background-color: #d9f5ff;
        padding: 20px;
        z-index: 10;
        background: linear-gradient(#F5FCFF 50%, #7FCDEC);
    }

    .item-in-nav-menu {
        width: 70%;
        margin: 0 auto 1em;
        padding: 0.3em 1.3em;
        letter-spacing: 0.3em;
        box-shadow: 0px 3px 5px 0px rgba(138,138,138,0.75);
        -webkit-box-shadow: 0px 3px 5px 0px rgba(138,138,138,0.75);
        -moz-box-shadow: 0px 3px 5px 0px rgba(138,138,138,0.75);
    }

    /* ナビメニューの結果速報と写真・動画の表記と▲▼を両端に配置 */
    .align-both-ends {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .sub-item {
        text-align: right;
    }

    /* ----------------------------------------
    ナビメニューのX, facebook, YouTubeのSNSアイコン
    ---------------------------------------- */
    .sns-icons-container {
        margin: 3.2em auto 2em;
    }

    .sns-icons-inner {
        text-align: center;
    }

    .sns-icons-inner img {
        height: 1.4em;
    }

    .sns-icons-inner img:nth-child(2) {
        margin: 0 1.2em;
    }

    /* ナビメニューの会社概要とプライバシーポリシー */
    .nav-menu-aside {
        font-size: 0.5em;
        margin-bottom: 2em;
        text-align: center;
        letter-spacing: 0.4em;
    }

    /* ------------
    会員情報へのリンク
    ------------ */
    .account-info-container {
        width: 40px;
        height: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .account-info-container span {
        font-size: 0.6em;
    }

    /* ---------
    協賛バナー広告
    --------- */
    .banner-wrapper {
        margin: 0 30px;
    }

    /* 協賛とリンクの文言のデザイン */
    .banner-index-partners, .banner-index-links {
        color: #FFF;
        font-size: 8px;
        background-color: #000;
        padding: 2px;
        margin-right: 2px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }

    .banner-index-partners {
        height: 40px;
    }

    .banner-index-links {
        height: 66px;
    }

    /* 文言とバナー群を横並べ */
    .banner-container-partners, .banner-container-links {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .banner-container-partners {
        margin-bottom: 4px;
    }

    .banner-partners {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .banner-partners-1 {
        max-width: 113px;
        width: 30%;
        height: auto;
    }
    .banner-partners-2 {
        max-width: 59px;
        width: 20%;
        height: auto;
    }
    .banner-partners-3 {
        max-width: 173px;
        width: 50%;
        height: auto;
    }

    .banner-links {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .banner-links-first-line, .banner-links-second-line {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    
    .banner-links-first-line-1 {
        max-width: 97px;
        width: 30%;
        height: auto;
    }
    .banner-links-first-line-2 {
        max-width: 141px;
        width: 45%;
        height: auto;
    }
    .banner-links-first-line-3 {
        max-width: 99px;
        width: 25%;
        height: auto;
    }
    .banner-links-second-line-1 {
        max-width: 173px;
        width: 55%;
        height: auto;
    }
    .banner-links-second-line-2 {
        max-width: 171px;
        width: 45%;
        height: auto;
    }

    /* ------------------
    ヘッダー下部のメニューバー
    ------------------ */
    .menu-wrapper {
        width: 100%;
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        overflow: hidden;
        overflow-x: auto;
        white-space: nowrap;
    }

    .menu-container {
        display: flex;
        flex-direction: row;
    }

    .menu-item {
        color: #ffffff;
        font-size: 1em;
        font-weight:bold;
        padding: 0.5em 1em 10px;
    }

    .active-red-line:active {
        color: #ff0000;
        padding-bottom: 3px;
        border-bottom: 2px solid #ff0000;
    }
}

.auth-buttons {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.auth-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-weight: 500;
}

.login-btn {
    background-color: #007bff;
    color: white;
}

.signup-btn {
    background-color: #28a745;
    color: white;
}

.logout-btn {
    background-color: #dc3545;
    color: white;
}

.auth-btn:hover {
    opacity: 0.9;
}
</style>