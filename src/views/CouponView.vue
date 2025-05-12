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
    <div class="p-5">
        <img src="https://connect-website-bucket0c0f1-dev.s3.ap-northeast-1.amazonaws.com/coupon/TUNERS_coupon.jpg" class="w-full h-auto" />
    </div>
</template>
<style></style>