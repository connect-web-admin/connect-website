<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { USER_ATTR_SESSION_ID, USER_ATTR_EMAIL, MEMBER_API_URL } from '@/utils/constants';

const router = useRouter();

const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    signOut: {
        type: Function,
        default: () => { }
    },
});

/**
 * session_idを削除する関数
 */
const removeSessionIdInMemberDDB = async () => {
    const idTokenForAuth = localStorage.getItem('idTokenForAuth');

    try {
        const putUrl = new URL(`${MEMBER_API_URL}/remove-session-id`);
        const requestBody = {
            email: localStorage.getItem(USER_ATTR_EMAIL),
            sessionId: localStorage.getItem(USER_ATTR_SESSION_ID)
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error details:', error);
    }
}

/**
 * ログアウトしてローカルストレージのアイテムを削除
 */
const signOutAndDeleteItemsInLocalStorage = async () => {
    await removeSessionIdInMemberDDB();

    // ローカルストレージのアイテムを削除
    localStorage.removeItem('email');
    localStorage.removeItem('idTokenForAuth');
    localStorage.removeItem('custom:membership_type');
    localStorage.removeItem(USER_ATTR_SESSION_ID);

    // Authenticator備え付けのログアウト用の関数
    props.signOut();

    router.push('/');
}

onMounted(() => {
  // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>
<template>
    <div class="p-4 h-100 flex items-center justify-center">
        <h1 class="text-2xl font-bold absolute top-4">アクセス権限エラー</h1>
        <div class="text-xl">
            セッションの有効期限が切れています。<br /><span class="text-blue-500 underline" @click="signOutAndDeleteItemsInLocalStorage">ログアウト</span>してから再度ログインしてください。
        </div>
    </div>
</template>
<style></style>