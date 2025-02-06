<script setup>
import { ref, onMounted } from 'vue'
import { CLUB_API_URL, ID_TOKEN_FOR_AUTH } from '@/utils/constants'

const isLoading = ref(false)
const idTokenForAuth = localStorage.getItem(ID_TOKEN_FOR_AUTH)
const clubInfo = ref({})

const getTargetClubInfo = async () => {
    isLoading.value = true

    // API URLの組み立て
    const url = new URL(`${ CLUB_API_URL }`)

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

onMounted(async () =>{
    await getTargetClubInfo()
})
</script>

<template>
{{ clubInfo }}
</template>

<style scoped>
</style>