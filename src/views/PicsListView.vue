<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedImage = ref(null);
const showModal = ref(false);

const images = [
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7881.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7884.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7886.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7892.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7893.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7895.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7898.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7903.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7904.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7909.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7913.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7916.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7920.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7922.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7924.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7925.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7926.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7927.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7930.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7933.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7934.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7935.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7936.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7937.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7939.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7944.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7945.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7947.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7954.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7955.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7957.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7961.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7970.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7975.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7980.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7984.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7988.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7990.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7992.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7993.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7994.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7997.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_7998.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8000.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8005.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8006.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8008.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8011.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8012.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8016.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8018.JPG' },
    { src: 'https://connect-website-bucket0c0f1-dev.s3.amazonaws.com/pic/TakamadonomiyaCup2025HokkaidoSapporoBlock/04-12/IMG_8023.JPG' }
];

const openModal = (index) => {
    selectedImage.value = index;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedImage.value = null;
};

// const getPics = async () => {
//     const data = await response.json();
// };

// onMounted(async () => {
//     await getPics();
// });

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
        <h1 class="text-2xl font-bold py-2">高円宮杯 JFA U-18 サッカー2025北海道 ブロックリーグ札幌</h1>
        <div class="grid grid-cols-3 gap-4">
            <div v-for="(image, index) in images" :key="index" class="relative cursor-pointer aspect-square"
                @click="openModal(index)">
                <img :src="image.src" alt="高円宮杯 JFA U-18 サッカー2025北海道 ブロックリーグ札幌" class="w-full h-full object-cover">
            </div>
        </div>

        <!-- モーダル -->
        <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click="closeModal">
            <div class="relative w-[98vw] flex items-center justify-center">
                <img :src="images[selectedImage].src" alt="札幌未来杯" class="w-full h-auto object-contain">
                <button @click.stop="closeModal"
                    class="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                    ✕
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fixed {
    position: fixed;
}
</style>