<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>
<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold">チーム紹介</h1>
        <ul class="mt-8 space-y-3">
            <span class="text-lg font-bold">２種</span>
            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌第一高等学校サッカー部</p>
                <a
                    href="https://www.kibou.ac.jp/daiichi/schoollife/club/football/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.kibou.ac.jp/daiichi/schoollife/club/football/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌大谷高等学校サッカー部</p>
                <a
                    href="https://www.sapporo-otani.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporo-otani.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>北海高校サッカー部</p>
                <a
                    href="https://www.hokkai-soccer.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.hokkai-soccer.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌創成高校サッカー部</p>
                <a
                    href="https://www.sosei.jp/club/%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%83%A8"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sosei.jp/club/%E3%82%B5%E3%83%83%E3%82%AB%E3%83%BC%E9%83%A8</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌光星高校サッカー部</p>
                <a
                    href="https://www.footballnavi.jp/s-kosei/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/s-kosei/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>コンサドーレ札幌アカデミー U-18 札幌</p>
                <a
                    href="https://www.consadole-sapporo.jp/academy/team/u18/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.consadole-sapporo.jp/academy/team/u18/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>東海大札幌高校サッカー部</p>
                <a
                    href="https://www.sapporo.tokai.ed.jp/club/soccer/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporo.tokai.ed.jp/club/soccer/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>北星学園大学附属高等学校サッカー部</p>
                <a
                    href="https://www.hokusei-s-h.ed.jp/club/soccer/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.hokusei-s-h.ed.jp/club/soccer/</a
                >
            </li>

            <span class="text-lg font-bold">３種</span>
            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>コンサドーレ札幌アカデミー U-15 札幌</p>
                <a
                    href="https://www.consadole-sapporo.jp/academy/team/u15-sapporo/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.consadole-sapporo.jp/academy/team/u15-sapporo/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>アンフィニ札幌</p>
                <a
                    href="https://www.sapporo-am-sc.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporo-am-sc.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌ジュニア FC</p>
                <a
                    href="https://www.sapporojrfc.net/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporojrfc.net/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>SSS札幌サッカースクール</p>
                <a
                    href="https://sss-sports.org/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://sss-sports.org/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌大谷中学校サッカー部</p>
                <a
                    href="https://www.s-ohtani.ed.jp/junior/schoollife/club/soccer"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.s-ohtani.ed.jp/junior/schoollife/club/soccer</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>ベアフット北海道</p>
                <a
                    href="https://www.barefoot-hokkaido.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.barefoot-hokkaido.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>CLUB FIELDS（クラブフィールズ）</p>
                <a
                    href="https://www.footballnavi.jp/clubfields/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/clubfields/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>アプリーレ札幌</p>
                <a
                    href="https://www.footballnavi.jp/apriresapporo/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/apriresapporo/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>DOHTO</p>
                <a
                    href="https://www.ksc-dohtojr.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.ksc-dohtojr.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>FC DENOVA</p>
                <a
                    href="https://www.fcdenova.net/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.fcdenova.net/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>HKD FOOTBALL CLUB</p>
                <a
                    href="https://hkd-fc.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://hkd-fc.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>ＦＣフォルテ</p>
                <a
                    href="https://www.sapporoforte.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporoforte.com/</a
                >
            </li>

            <span class="text-lg font-bold">４種</span>
            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>SSS札幌サッカースクール</p>
                <a
                    href="https://sss-sports.org/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://sss-sports.org/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>HKD FOOTBALL CLUB</p>
                <a
                    href="https://hkd-fc.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://hkd-fc.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>ベアフット北海道</p>
                <a
                    href="https://www.barefoot-hokkaido.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.barefoot-hokkaido.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>コンサドーレ札幌アカデミー U-12 札幌</p>
                <a
                    href="https://www.consadole-sapporo.jp/academy/team/u12-sapporo/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.consadole-sapporo.jp/academy/team/u12-sapporo/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>CLUB FIELDS（クラブフィールズ）</p>
                <a
                    href="https://www.footballnavi.jp/clubfields/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/clubfields/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>アプリーレ札幌</p>
                <a
                    href="https://www.footballnavi.jp/apriresapporo/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/apriresapporo/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>DOHTO</p>
                <a
                    href="https://www.ksc-dohtojr.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.ksc-dohtojr.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>アンフィニ札幌</p>
                <a
                    href="https://www.sapporo-am-sc.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporo-am-sc.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>ワンエイトFC</p>
                <a
                    href="https://one-eight-fc.jimdosite.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                >https://one-eight-fc.jimdosite.com/</a>
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>FC北郷</p>
                <a
                    href="https://www.fc-kitago-pivo.net/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                >https://www.fc-kitago-pivo.net/</a>
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>FC DENOVA</p>
                <a
                    href="https://www.fcdenova.net/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.fcdenova.net/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌ジュニア FC</p>
                <a
                    href="https://www.sapporojrfc.net/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.sapporojrfc.net/</a
                >
            </li>

            ー女子ー
            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>CLUB FIELDS（クラブフィールズ）</p>
                <a
                    href="https://www.footballnavi.jp/clubfields/page.php?pno=1057"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.footballnavi.jp/clubfields/page.php?pno=1057</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>Habatake</p>
                <a
                    href="https://www.facebook.com/HABATAKE1975/?locale=ja_JP"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.facebook.com/HABATAKE1975/?locale=ja_JP</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>札幌大谷中学校女子サッカー部</p>
                <a
                    href="https://www.s-ohtani.ed.jp/high/schoollife/club/soccer_f"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.s-ohtani.ed.jp/high/schoollife/club/soccer_f</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>ノルディーア北海道</p>
                <a
                    href="https://www.norddea.jp/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://www.norddea.jp/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>文教大学女子サッカー部</p>
                <a
                    href="https://bunkyo-girlsfc.jimdofree.com/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                    >https://bunkyo-girlsfc.jimdofree.com/</a
                >
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>リラコンサドーレ</p>
                <a
                    href="https://chsc.jp/team/lilas/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                >https://chsc.jp/team/lilas/</a>
            </li>

            <li class="border-1 border-gray-300 rounded-md p-4">
                <p>東札幌商業</p>
                <a
                    href="https://www.instagram.com/sattosho_josaka/"
                    class="break-all text-blue-500 underline"
                    target="_blank"
                >https://www.instagram.com/sattosho_josaka/</a>
            </li>
        </ul>
    </div>
</template>

<!-- <script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ClubIntroductionComp from '@/views/ClubIntroductionView.vue';
const router = useRouter();
const isClubSelected = ref(false);
// import { CLUB_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants'



// const isLoading = ref(false)
// const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)
// const clubInfo = ref({})

// const getAllClubInfo = async () => {
//     isLoading.value = true

//     // API URLの組み立て
//     const url = new URL(`${ CLUB_API_URL }/active`)

//     try {
//         // 試合情報取得
//         const response = await fetch(url, { 
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${ idTokenForAuth }`
//             }
//         });

//         const originalData = await response.json()
//         clubInfo.value = originalData
//     } catch(error) {
//         console.error('クラブ情報の取得に失敗しました。', error)
//     } finally {
//         isLoading.value = false
//     }
// }
</script>

<template>
<div>
    <div class="bg-gray-200 p-2 flex flex-row gap-5 justify-center">
        <select class="bg-white p-2 rounded-md">
            <option value="年代" selected disabled> 年代</option>
            <option value="第2種">第2種</option>
            <option value="第3種">第3種</option>
            <option value="第4種・WOMAN">第4種・WOMAN</option>
        </select>
        <select class="bg-white p-2 rounded-md">
            <option value="地域" selected disabled>地域</option>
            <option value="札幌市中央区">札幌市中央区</option>
            <option value="札幌市北区">札幌市北区</option>
            <option value="札幌市東区">札幌市東区</option>
        </select>
        <button type="button" class="bg-blue-500 text-white py-2 px-4 rounded-md">検索</button>
    </div>
    <div>
        <div class="flex flex-col gap-10 justify-center items-center my-10">
            <div class="w-8/10">
                <router-link to="/club-introduction">
                    <img src="../assets/top-sample/football-club-players-photo.jpg" alt="チーム集合写真" class="w-full h-auto" />
                    <h2 class="text-center text-xl">
                        札幌市中央区ジュニアチームA
                        <span class="block bg-red-400 text-white text-xs px-2 py-1 ml-4 rounded-md">クリック可能</span>
                    </h2>
                </router-link>
            </div>
            <div class="w-8/10">
                <img src="../assets/top-sample/football-club-players-photo.jpg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市中央区ジュニアチームA</h2>
            </div>
            <div class="w-8/10">
                <img src="../assets/top-sample/football-club-players-photo.jpg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市北区ジュニアチームA</h2>
            </div>
            <div class="w-8/10">
                <img src="../assets/top-sample/football-club-players-photo.jpg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市東区ジュニアチームA</h2>
            </div>
        </div>
    </div>
</div>
</template>

<style></style> -->
