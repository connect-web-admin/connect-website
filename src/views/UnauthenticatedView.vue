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
    <div class="p-4 h-100">
        <h1 class="text-xl font-bold">アクセス権限エラー</h1>
        <div>
            本コンテンツはレギュラー会員専用です。<br />
            <router-link to="/member-info" class="text-blue-600 underline">会員情報</router-link>から会員種別を変更すると、ご利用いただけるようになります。
        </div>
    </div>
</template>
<style></style>