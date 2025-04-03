<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
const failedMsg = ref('');

</script>

<template>
    <div class="p-5">
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text- font-bold mb-5">U-18プリンスリーグの大会詳細結果について</h1>
            <div>
                <p>U-18プリンスリーグの大会詳細結果についてはこちらで見ることができます。</p>
                <a href="https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/" target="_blank"
                    class="text-blue-500 underline break-words">
                    https://www.jfa.jp/match/takamado_jfa_u18_prince2025/hokkaido/
                </a>
            </div>
        </div>
    </div>
</template>
<style></style>