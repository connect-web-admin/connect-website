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
    <div class="p-4 h-100 flex items-center justify-center">
        <h1 class="text-2xl font-bold absolute top-4">クーポン</h1>
        <div class="text-xl">
            準備中
        </div>
    </div>
</template>
<style></style>