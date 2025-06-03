<script setup>
import { onMounted, ref } from 'vue';
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

const isLoading = ref(false);

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
    isLoading.value = true;
    await removeSessionIdInMemberDDB();

    // ローカルストレージのアイテムを削除
    localStorage.removeItem('email');
    localStorage.removeItem('idTokenForAuth');
    localStorage.removeItem('isAccountAvailable');
    localStorage.removeItem('userAttrSub');
    localStorage.removeItem('custom:membership_type');
    localStorage.removeItem(USER_ATTR_SESSION_ID);
    localStorage.removeItem(USER_ATTR_EMAIL);

    // Authenticator備え付けのログアウト用の関数
    props.signOut();

    isLoading.value = false;

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
    <div>
        <div v-if="isLoading" class="mt-20">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else class="p-4 space-y-10">
            <div class='space-y-4 border border-gray-200 rounded-lg p-4'>
                <div class="flex items-center gap-2 border-b border-gray-200 pb-4">
                    <img src="../assets/icons/question-mark.svg" alt="FAQ" class="w-[30px] h-auto" />
                    <p>試合の写真をダウンロードしたい。</p>
                </div>
                <div class="flex items-start gap-2">
                    <img src="../assets/icons/exclamation-mark.svg" alt="FAQ" class="pl-[2px] w-[29px] h-auto" />
                    <p>写真を選んで「保存する」ボタンを押していただくとダウンロードしていただけます（お使いの機種により操作が異なる場合がございます。お使いのブラウザの使用方法をご確認ください）。</p>
                </div>
            </div>

            <div class='space-y-4 border border-gray-200 rounded-lg p-4'>
                <div class="flex items-center gap-2 border-b border-gray-200 pb-4">
                    <img src="../assets/icons/question-mark.svg" alt="FAQ" class="w-[30px] h-auto" />
                    <p>ログアウトしたい。</p>
                </div>
                <div class="flex items-start gap-2">
                    <img src="../assets/icons/exclamation-mark.svg" alt="FAQ" class="pl-[2px] w-[29px] h-auto" />
                    <router-link @click="signOutAndDeleteItemsInLocalStorage" to="/top" class="text-blue-500 underline">
                        こちらをタップ（クリック）してください。
                    </router-link>
                </div>
            </div>

            <div class='space-y-4 border border-gray-200 rounded-lg p-4'>
                <div class="flex items-center gap-2 border-b border-gray-200 pb-4">
                    <img src="../assets/icons/question-mark.svg" alt="FAQ" class="w-[30px] h-auto" />
                    <p>退会したい。</p>
                </div>
                <div class="flex items-start gap-2">
                    <img src="../assets/icons/exclamation-mark.svg" alt="FAQ" class="pl-[2px] w-[29px] h-auto" />
                    <p>退会につきましては、退会を希望される月の前の月の20日までに、会員情報ページに記載の会員IDとお名前を添えて<a href="mailto:info@connect-goals.com" class="text-blue-500 underline">Connectまでご連絡</a>ください。<br />
                        （例えば、６月15日にご連絡いただきますと、７月初日以降はご利用いただけなくなります。）</p>
                </div>
            </div>
        </div>
    </div>

</template>
<style></style>