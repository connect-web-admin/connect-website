<script setup>
import { ref, onMounted } from 'vue'
import { CLUB_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants'

const isLoading = ref(false)
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)
const clubInfo = ref({})

const getAllClubInfo = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ CLUB_API_URL }/active`)

    try {
        // 試合情報取得
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ idTokenForAuth }`
            }
        });

        const originalData = await response.json()
        clubInfo.value = originalData
    } catch(error) {
        console.error('クラブ情報の取得に失敗しました。', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    await getAllClubInfo()
})
</script>

<template>
<div class="main-wrapper">
    <div v-if="isLoading">
        読み込み中
    </div>
    <div v-else class="team-logos-wrapper">
        <p>ENTRY TEAMS</p>
        <div v-for="item in clubInfo" class="each-logo-container">
            {{ item['club_images']['introduction_image']['image_url'] }}
            <p>{{ item['club_name'] }}</p>
        </div>
    </div>
</div>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .main-wrapper {
        height: 100vh;
        background: linear-gradient(#F5FCFF, #7FCDEC);
    }

    .team-logos-wrapper {
        padding: 50px;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
    } 

    .each-logo-container {
        max-width: 180px;
        width: 45%;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
    }

    .each-logo-container img {
        height: 120px;
        width: auto;
    }
}
</style>
