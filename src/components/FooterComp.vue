<script setup>
const imgSize = 'w-[40px] h-auto';
</script>

<template>
<div class="flex flex-row justify-center gap-x-8 pb-2 items-end border-t-1 bg-white">
    <router-link to="/top"><img src="@/assets/icons/top.svg" alt="ホーム" :class="imgSize"></router-link>
    <router-link to="/archive"><img src="@/assets/icons/archive.svg" alt="大会日程" :class="imgSize"></router-link>
    <router-link to="/latest-results"><img src="@/assets/icons/live-report.svg" alt="試合速報" :class="imgSize"></router-link>
    <router-link to="/contact"><img src="@/assets/icons/contact.svg" alt="コンタクト" :class="imgSize"></router-link>
    <router-link to="/coupon"><img src="@/assets/icons/coupon.svg" alt="クーポン" :class="imgSize"></router-link>
</div>
</template>

<style></style>