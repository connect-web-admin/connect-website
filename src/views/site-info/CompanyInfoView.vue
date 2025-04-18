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
    <h2 class="text-xl font-bold mb-4">企業情報</h2>
    <div class="space-y-2">
        <p>株式会社 Connect</p>
        <p>代表取締役 櫻井拓未</p>
        <p>〒 001-0033</p>
        <p>札幌市北区北33条西2-1-15 KANTINE</p>
        <p>代表電話 011-790-6771</p>
        <p>連絡先 info■connect-goals.com（■を@に変換してください）</p>
    </div>
</div>
</template>
<style></style>