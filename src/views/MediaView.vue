<script setup>
import { ref, onMounted } from 'vue';
// import { MEDIA_API_URL, THIS_FISCAL_YEAR } from '@/utils/constants';
// import { useRoute } from 'vue-router';
// const route = useRoute();
// const articleId = route.params.articleId;
// const article = ref(null);
// const failedMsg = ref('');
// const isLoading = ref(false);

// const getTargetArticle = async () => {
//     const queryUrl = new URL(`${MEDIA_API_URL}/get-target-article`);
//     queryUrl.searchParams.append('articleId', articleId);
//     queryUrl.searchParams.append('fiscalYear', THIS_FISCAL_YEAR);
//     try {
//         const response = await fetch(queryUrl, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         article.value = await response.json();
//         isLoading.value = false;
//         console.log(article.value);
//     } catch (error) {
//         failedMsg.value = 'メディア記事の取得に失敗しました。';
//         console.error('メディア記事の取得に失敗しました。');
//     }
// }

onMounted(async () => {
    // await getTargetArticle();
    
    // ページ読み込み時にスクロール位置を最上部に移動
    window.scrollTo(0, 0);
});
</script>
<template>
    <div>
        <!-- <div v-if="isLoading">
            <img src="../assets/loading.gif" alt="loading" class="w-10 h-10" />
            <p>読み込み中……</p>
        </div>
        <div v-else>
            <div v-if="failedMsg">
                <p>{{ failedMsg }}</p>
            </div>
            <div v-else> -->
                <article class="p-4">
                    <h1 class="text-xl font-bold mb-4">70秒静止PKで話題となった札幌大谷・大石蓮斗、イタリア留学へ</h1>
                    <img src="@/assets/top-sample/OishiRento.jpg" alt="大石蓮斗" class="w-full h-auto" />
                    <section class="[&>:not(:last-child)]:my-7">
                        <p>この冬の全国高校サッカー選手権に出場した札幌大谷２年のＤＦ大石蓮斗（１７）が海外武者修行で世界トップ基準を体感している。
                        本サッカー協会（ＪＦＡ）とアディダスジャパンの共同プロジェクト「ドリームロード」の２４年度最後の第５弾として、
                        イタリア・セリエＡの「コモ」へ５選手の短期留学を実施。その一員に選出された大石が１５日の深夜に日本を発ち、４月１日まで現地に滞在する。</p>
                        <p>　昨年、夏と冬に全国舞台を２度経験した１m８５cmの大型センターバックは「世界の基準がある程度わかると思う。日本とのサッカーの違いや価値観の違いが楽しみ」と目を輝かせる。
                        全国高校サッカー選手権では２回戦で優勝候補の大津（熊本）に１―２で破れたが、大石は１月に同大会で活躍した４０選手らが招集されたＵ―１７日本高校サッカー選抜選考合宿（静岡）にも参加した。
                        そこでは落選したが、１m８５cmの長身を生かした空中戦の強さや非凡なサッカーセンスを持つ大石のポテンシャルが高く評価され、イタリア行きの切符をつかんだ。<br />
                        　イタリアではＵ―１８の練習に参加しており、トップチームの練習見学やセリエＡを観戦する機会もあるという。人生初の海外だが「イタリア語も頑張っている。
                        コミュニケーションや食事など環境に慣れることも大事にやっていきたい」という大石にとって、目標である海外でのプレーへ向け貴重な機会となるはずだ。</p>
                        <p>　昨年１１月にＵ―１６日本代表候補に初選出。自身の課題や実力を知れたことで練習への取り組み方や意識も変化し、目標もさらに高いものに変わった。
                        さらに今季Ｊ２今治に入団しすでにリーグ戦デビューも飾ったＭＦ笹修大から刺激を受けている。</p>
                        <p>　１学年上の笹は大石が落選した昨年の日本高校選抜に選出されたが、欧州留学は経験していない。
                        「僕もプロになりたいので羨ましい。身近な人がプロで活躍する姿を見て、やっぱり自分もピッチに立ちたいと思うし負けてられない」。イタリア留学をプロへの道をこじ開けるきっかけにする。</p>
                    </section>

                    <aside class="my-7">
                        ◇大石　蓮斗（おおいし・れんと）２００８年３月１６日、札幌市生まれの１７歳。７歳の時に札幌常盤サッカー少年団で競技を始め、
                        中学時はアンフィニＭＡＫＩ．ＦＣでプレー。札幌大谷ではセンターバックで今年度の全国高校選手権に出場し、
                        １回戦の藤井学園寒川（香川）戦の１分以上静止して決めたＰＫで話題をさらった。
                        Ｕ―１６日本代表候補、Ｕ―１７日本高校選抜候補。１m８５cm、６５キロ。右利き。家族は両親と妹。
                    </aside>
                    <aside>
                        ◇コモ１９０７　イタリア・ロンバルディア州コモを本拠地とするサッカークラブ。セリエＢ在籍が長い中堅クラブで
                        今季２３年ぶりにトップリーグを戦っている。過去には元イタリア代表ＤＦザンブロッタが在籍。
                        今季は１７日時点で１３位につけており、レアル・マドリードにも在籍したフランス代表ＤＦラファエル・ヴァランや、
                        元スペイン代表ＧＫのぺぺ・レイナ、元バルセロナのＭＦセルジ・ロベルトらが在籍している。
                    </aside>
                </article>
            <!-- </div>
        </div> -->
    </div>
</template>
<style></style>