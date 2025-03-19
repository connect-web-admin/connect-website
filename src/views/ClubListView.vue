<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ClubIntroductionComp from '@/views/ClubIntroductionView.vue';
const router = useRouter();
const isClubSelected = ref(false);
// import { CLUB_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants'



// const isLoading = ref(false)
// const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)
// const clubInfo = ref({})

// const getAllClubInfo = async () => {
//     isLoading.value = true

//     // API URLの組み立て
//     const url = new URL(`${ CLUB_API_URL }/active`)

//     try {
//         // 試合情報取得
//         const response = await fetch(url, { 
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${ idTokenForAuth }`
//             }
//         });

//         const originalData = await response.json()
//         clubInfo.value = originalData
//     } catch(error) {
//         console.error('クラブ情報の取得に失敗しました。', error)
//     } finally {
//         isLoading.value = false
//     }
// }
</script>

<template>
<div>
    <div class="bg-gray-200 p-2 flex flex-row gap-5 justify-center">
        <select class="bg-white p-2 rounded-md">
            <option value="年代" selected disabled> 年代</option>
            <option value="第2種">第2種</option>
            <option value="第3種">第3種</option>
            <option value="第4種・WOMAN">第4種・WOMAN</option>
        </select>
        <select class="bg-white p-2 rounded-md">
            <option value="地域" selected disabled>地域</option>
            <option value="札幌市中央区">札幌市中央区</option>
            <option value="札幌市北区">札幌市北区</option>
            <option value="札幌市東区">札幌市東区</option>
        </select>
        <button type="button" class="bg-blue-500 text-white py-2 px-4 rounded-md">検索</button>
    </div>
    <div>
        <div class="flex flex-col gap-10 justify-center items-center my-10">
            <div class="w-8/10">
                <router-link to="/club-introduction">
                    <img src="@/assets/top-sample/football-club-players-photo.jpeg" alt="チーム集合写真" class="w-full h-auto" />
                    <h2 class="text-center text-xl">
                        札幌市中央区ジュニアチームA
                        <span class="block bg-red-400 text-white text-xs px-2 py-1 ml-4 rounded-md">クリック可能</span>
                    </h2>
                </router-link>
            </div>
            <div class="w-8/10">
                <img src="@/assets/top-sample/football-club-players-photo.jpeg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市中央区ジュニアチームA</h2>
            </div>
            <div class="w-8/10">
                <img src="@/assets/top-sample/football-club-players-photo.jpeg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市北区ジュニアチームA</h2>
            </div>
            <div class="w-8/10">
                <img src="@/assets/top-sample/football-club-players-photo.jpeg" alt="チーム集合写真" class="w-full h-auto" />
                <h2 class="text-center text-xl">札幌市東区ジュニアチームA</h2>
            </div>
        </div>
    </div>
</div>
</template>

<style></style>
