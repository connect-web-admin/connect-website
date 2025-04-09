<script setup>
import { ref } from 'vue';

// const isLoading = ref(false);
// const failedMsg = ref('');
// CSS
const eachChampionship = 'p-3 border-b border-gray-200'
const categorySection = 'mt-2 p-2 border border-gray-300 rounded-lg'
const listItemStyle = 'py-2 border-b border-gray-200 last:border-b-0'
</script>

<template>
    <div class="p-5">
        <div>
            <h1 class="text-xl font-bold">高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌</h1>
            <!-- <img src="" alt="高円宮杯 JFA U-18サッカーリーグ2025北海道 ブロックリーグ札幌 星取表" /> -->
        </div>
        <div class="mt-15">
            <h1 class="text-xl font-bold">アーカイブ</h1>
            <h2>2024年度（タップで画像を表示します）</h2>
            <div :class="categorySection" >
                <h3 class="text-xl font-semibold">２種</h3>
                <ul>
                    <li :class="listItemStyle">高円宮杯 JFA U-18サッカー2024北海道 ブロックリーグ札幌</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                </ul>
            </div>
            <div :class="categorySection">
                <h3 class="text-xl font-semibold mb-2">３種</h3>
                <ul>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                </ul>
            </div>
            <div :class="categorySection">
                <h3 class="text-xl font-semibold mb-2">４種</h3>
                <ul>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                    <li :class="listItemStyle">【大会名入力】</li>
                </ul>
            </div>
        </div>
    </div>
</template>
<style></style>