<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold text-center mb-6">札幌市中央区ジュニアチームA</h1>
        <img src="../assets/top-sample/football-club-players-photo.jpg" alt="札幌市中央区ジュニアチームA" class="w-full h-auto">
        <div class="space-y-2">
            <p><strong>HP:</strong> <a href="#" class="text-blue-500 underline">https://sapporoshichuoukujuniorteama.com</a></p>
            <p><strong>所在地:</strong> 札幌市中央区南S条西T丁目U-V</p>
            <p><strong>電話番号:</strong> 011-XXXX-XXXX</p>
            <p><strong>実績:</strong></p>
            <ul class="list-disc list-inside ml-4">
                <li>A大会 優勝</li>
                <li>B大会 ベスト8</li>
            </ul>
            <p><strong>監督名:</strong> 田中 太郎</p>
            <p><strong>コーチ名:</strong> 佐藤 花子</p>
            <p><strong>在籍者数:</strong> 25名</p>
            <p><strong>所有カテゴリ:</strong> 第２種,第３種,第４種, WOMAN</p>
            <p><strong>セールスポイント:</strong></p>
            <p class="border-l-4 border-blue-500 pl-4">
                札幌市中央区ジュニアチームAは、札幌市中央区を拠点に活動するチームです。技術と戦術の向上を重視し、
                幅広い世代のプレイヤーが活躍できる環境を提供しています。
            </p>
        </div>
    </div>
</div>
</template>

<style></style>
