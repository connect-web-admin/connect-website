<script setup>

import FooterComp from '../components/FooterComp.vue'
</script>

<template>
<div class=contents-wrapper>
    <h1>ここにはイベントのタイトルが入ります</h1>
    <!-- <img src="../assets/header-logo.svg" /> -->
    <p>
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります
        ここにはイベントの説明が入ります

    </p>
    
</div>
<FooterComp />
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .contents-wrapper {
        margin: 0 auto;
        text-align: center;
        /* display: flex;
        flex-direction: column; */
    } 
}
</style>
