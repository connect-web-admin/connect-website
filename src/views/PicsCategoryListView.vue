<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();


</script>
<template>
    <div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-12（ジュニア）</h2>
            <ul>
                <li class="p-2 border-b-1 border-gray-300">北海道ジュニア選手権大会札幌ブロック</li>
                <li class="p-2">札幌未来杯<span class="bg-red-400 text-white text-xs px-2 py-1 ml-4 rounded-md">クリック可能</span></li>
            </ul>
        </div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-15（ジュニアユース）</h2>
            <ul>
                <li class="p-2 border-b-1 border-gray-300">北海道ジュニアユース選手権大会札幌ブロック</li>
                <li class="p-2">中学校体育大会</li>
            </ul>
        </div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">U-18（ユース）</h2>
            <ul>
                <li class="p-2 border-b-1 border-gray-300">北海道ユース選手権大会札幌ブロック</li>
                <li class="p-2">高等学校体育大会</li>
            </ul>
        </div>
        <div>
            <h2 class="font-bold bg-gray-200 p-2">WOMAN</h2>
            <ul>
                <li class="p-2 border-b-1 border-gray-300">北海道レディース選手権大会札幌ブロック</li>
                <li class="p-2">皇后杯北海道予選札幌ブロック</li>
            </ul>
        </div>

    </div>
</template>
<style></style>