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
<div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">特定商取引法の表記(デジタルコンテンツ)</h1>

    <ol class="list-decimal space-y-6 pl-6">
        <li>
            <h2 class="font-bold">サイト名</h2>
            <p>コネクトニュース</p>
            <p>（URL <a href="https://connect-goals.com/" class="text-blue-600 hover:underline">https://connect-goals.com/</a>）</p>
        </li>

        <li>
            <h2 class="font-bold">販売業者</h2>
            <p>株式会社Connect</p>
        </li>

        <li>
            <h2 class="font-bold">代表者</h2>
            <p>代表取締役 櫻井拓未</p>
        </li>

        <li>
            <h2 class="font-bold">住所</h2>
            <p>札幌市北区北33条西2-1-15 KANTINE</p>
        </li>

        <li>
            <h2 class="font-bold">連絡先</h2>
            <p>代表電話 080-5277-4080</p>
        </li>

        <li>
            <h2 class="font-bold">メール発信送信元メールアドレス</h2>
            <p>info■connect-goals.com（■を@に変換してください）</p>
        </li>

        <li>
            <h2 class="font-bold">デジタルコンテンツ販売価格またはサービス提供価格</h2>
            <p>当サイト利用規約内に表示します。</p>
        </li>

        <li>
            <h2 class="font-bold">販売数量</h2>
            <p>原則として販売数量に制限はありません。なお、販売数量を指定させていただくデジタルコンテンツがある場合には、当該デジタルコンテンツ表示時に併せて表示します。</p>
        </li>

        <li>
            <h2 class="font-bold">購入申込の有効期限</h2>
            <p>原則としてありません。なお、先行販売商品など、販売期間を限定させていただくデジタルコンテンツがある場合には、当該デジタルコンテンツ表示時に併せて表示します。</p>
        </li>

        <li>
            <h2 class="font-bold">通信料・パケット代金、消費税等（デジタルコンテンツの代金以外に必要となる料金等）</h2>
            <p>当サイトのページの閲覧、デジタルコンテンツのダウンロード等に必要となる携帯電話の通信料金やパケット代金については、お客様の負担となります。それぞれの料金は、お客様がご利用の携帯電話事業者にお問合せください。消費税は内税として表示しております。</p>
        </li>

        <li>
            <h2 class="font-bold">デジタルコンテンツの引渡時期またはサービス利用時期</h2>
            <p>月額課金の場合:月額課金後、即時にサービス利用、またはデジタルコンテンツの閲覧が可能です。</p>
        </li>

        <li>
            <h2 class="font-bold">代金の支払時期、支払方法</h2>
            <p>支払時期はクレジットカード会社の定める規定によります。</p>
        </li>

        <li>
            <h2 class="font-bold">返品／キャンセル</h2>
            <p>購入完了後における、お客様のご都合による注文キャンセルには原則として応じられません。また、お支払いただいた代金の返金も致しません。予めご了承ください。また、デジタルコンテンツという商品の性格上、返品は一切お受けできません。</p>
        </li>
    </ol>
</div>
</template>
<style></style>