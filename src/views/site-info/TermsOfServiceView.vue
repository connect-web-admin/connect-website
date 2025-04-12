<script setup>
import { ref } from 'vue';

const paymentSection = ref(null);
const paymentLink = ref(null);

const scrollToPaymentSection = () => {
    if (paymentSection.value) {
        const yOffset = -200; // ヘッダーの高さを考慮して200px上に調整
        const y = paymentSection.value.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};

const scrollToPaymentLink = () => {
    if (paymentLink.value) {
        const yOffset = -200; // ヘッダーの高さを考慮して200px上に調整
        const y = paymentLink.value.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};
</script>
<template>
    <div class="my-4 px-4">
        <h1 class="text-2xl font-bold mb-4">利用規約</h1>
        <p class="mb-4 text-red-600">試合会場の状況等により、速報内容の更新に時間がかかる場合がございます。あらかじめご了承ください。</p>
        <ol class="list-decimal ml-5 space-y-2">
            <li>利用者は、本規約を誠実に遵守し、本サービスを利用してください。</li>
            <li>当社は、利用者への事前の通知なく本規約の内容を変更できるものとします。</li>
            <li>有料コンテンツ・サービス（以下「有料サービス」といいます。）の利用については、別途、当社所定ページまたは第三者所定ページをご確認ください。（未成年者は法定代理人の同意を得た上で有料コンテンツ・サービスの購入を行うものとします。）
            </li>
            <li ref="paymentLink">有料サービスにかかる情報料の支払いについては、<a href="#payment" @click.prevent="scrollToPaymentSection"
                    class="text-blue-500 underline">コチラ</a>をご参照ください。</li>
            <li>当社は、いかなる理由があっても既に支払われた情報提供料は一切返還しません。</li>
            <li>本サービスの利用にあたり通信が発生する場合には、通信事業者所定の通信料が別途かかります。</li>
            <li>利用者は当社からＩＤおよびパスワード等が付与された場合、これらを第三者に開示・漏洩することのないよう注意して取り扱ってください。ＩＤおよびパスワードの管理不十分、使用上の過誤、第三者使用等による損害について、当社は一切責任を負いません。
                <ul class="space-y-2">
                    <li>(1) 本サービスで利用しうる情報の改ざん</li>
                    <li>(2) 当社および第三者の著作権を侵害し、または侵害する恐れのある行為</li>
                    <li>(3) 有害なコンピュータプログラム等の送信および書き込み</li>
                    <li>(4) 当社もしくは第三者を誹謗中傷し、または名誉を傷つける行為</li>
                    <li>(5) プライバシーを侵害し、または侵害する恐れのある行為</li>
                    <li>(6) 公序良俗に反する行為またはわいせつな文書や図画を他人に公開する行為</li>
                    <li>(7) 営利を目的とした行為</li>
                    <li>(8) 宗教活動および政治的勧誘に該当する行為</li>
                    <li>(9) 本サービスの運用・利用を妨げる行為</li>
                    <li>(10) その他、法令に違反する行為または違反する恐れのある行為</li>
                </ul>
            </li>
            <li>当社は、利用者に事前の通知をすることなく本サービスの内容の一部または全部を変更、ないしは本サービスの提供を終了することがあります。</li>
            <li>当社は、運用上あるいは技術上の理由から、利用者に通知することなく一時的に本サービスの提供を中断し、または利用の制限をすることがあります。また同様の理由から、本サービスの提供に遅滞を生ずることがあります。
            </li>
            <li>通信環境、利用者の端末環境その他の理由により本サービスが正常にご利用いただけない場合があります。</li>
            <li>当社は、本サービスの内容の充実や提供される情報の正確性等についていかなる保証も行なうものではありません。</li>
            <li>利用者が本サービスの利用にあたり損害を被ることがあっても、当社は一切責任を負いません。</li>
            <li>本サービスに関し利用者と当社との間で紛争が生じた場合の準拠法はこれを日本法とし、専属合意管轄裁判所は、訴額に応じて札幌簡易裁判所あるいは札幌地方裁判所とします。</li>
        </ol>
        <div class="mt-4" ref="paymentSection" id="payment">
            <h2 class="text-lg font-bold mb-2">クレジットカード決済（月額）</h2>
            <p>○支払時期・方法</p>
            <ul class="list-disc ml-5 space-y-2">
                <li>毎月指定の口座より決済</li>
                <li>決済日時はクレジットカード各社が指定する日時</li>
            </ul>
            <p>※　利用者から当社に提供されるクレジット情報については、当社は、厳に管理し、情報料の集金に関する目的にのみ使用します。</p>
            <p>※　クレジット契約者と当該クレジット会社の間で紛争が発生した場合には、当該当事者双方で解決するものとし、当社には一切責任がないものとします。</p>
            <br />
            <p>○課金期間・課金タイミング</p>
            <ul class="list-disc ml-5 space-y-2">
                <li>月額有料サービス登録完了後、登録月から解約手続が完了した日の属する月までの各月について課金（日割計算は行いません。）。</li>
                <li>登録月から解約月までの期間が1ヶ月に満たない場合も、1ヶ月分課金されます（日割計算は行いません。）。</li>
                <li>月額有料サービスの解約・再登録を繰り返された場合は、その都度、登録回数分の情報料が発生。</li>
            </ul>
            <div class="mt-4 text-right">
                <a href="#" @click.prevent="scrollToPaymentLink" class="text-blue-500 underline">戻る</a>
            </div>
        </div>
        <p class="mt-4">以上</p>
    </div>
</template>
<style></style>