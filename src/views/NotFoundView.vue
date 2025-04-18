<script setup>
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();
const router = useRouter();

const goToTop = () => {
    router.push('/');
};

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center p-10">
        <div class="mt-8">
            <h2 class="text-2xl mb-4">ページが見つかりません</h2>
            <p class="text-lg text-gray-600 mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
            <button @click="goToTop" class="bg-blue-500 text-white py-3 px-6 rounded cursor-pointer">TOPに戻る</button>
        </div>
    </div>
</template>

<style></style>