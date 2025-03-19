<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedImage = ref(null);
const showModal = ref(false);

const images = [
    { src: '/src/assets/top-sample/mirai-1.png', caption: '札幌未来杯の様子1' },
    { src: '/src/assets/top-sample/mirai-2.png', caption: '札幌未来杯の様子2' },
    { src: '/src/assets/top-sample/mirai-3.png', caption: '札幌未来杯の様子3' },
    { src: '/src/assets/top-sample/mirai-4.png', caption: '札幌未来杯の様子4' }
];

const openModal = (index) => {
    selectedImage.value = index;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedImage.value = null;
};
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold py-2">札幌未来杯</h1>
        <div class="flex flex-wrap gap-4 justify-center">
            <div v-for="(image, index) in images" :key="index" class="relative cursor-pointer"
                @click="openModal(index)">
                <img :src="image.src" alt="札幌未来杯" class="object-cover">
                <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-black/50 p-2">
                    <p class="text-white text-left bg-black/10">{{ image.caption }}</p>
                </div>
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