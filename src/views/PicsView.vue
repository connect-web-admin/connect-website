<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>
<template>
    <div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-18（ユース）</h2>
            <ul>
                <li class="p-2"><router-link to="/pics-list" class="block w-full">高円宮杯 JFA U-18 サッカー2025北海道 ブロックリーグ札幌</router-link></li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-15（ジュニアユース）</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-12（ジュニア）</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>

        <div>
            <h2 class="font-bold bg-gray-200 p-2">WOMAN</h2>
            <ul>
                <li class="p-2">写真が登録されていません。</li>
            </ul>
        </div>

    </div>
</template>
<style></style>