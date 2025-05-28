<script setup>
// vue及びvue-routerのインポート
import { ref, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
// aws-amplifyのインポート
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue";
import '@aws-amplify/ui-vue/styles.css';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
// 自作コンポーネントのインポート
import { CONNECTER, ID_TOKEN_FOR_AUTH, USER_ATTR_EMAIL, USER_ATTR_MEMBERSHIP_TYPE, USER_ATTR_SESSION_ID, USER_ATTR_SUB, MEMBER_API_URL } from '@/utils/constants';
import HeaderComp from './components/HeaderComp.vue'; 
import FooterComp from './components/FooterComp.vue';

// 認証状態を管理するオブジェクト   
const authState = useAuthenticator();
// ルーティングを管理するオブジェクト
const router = useRouter();
// ユーザー単位のデータ
const isAccountAvailable = ref(true);
const userAttrMembershipType = ref('');
const idTokenForAuth = ref('');
const isLoading = ref(false);
const failedMsg = ref('');

/**
 * connecterのパスかどうかを判定する関数
 * connecterのパスは、試合を速報する時にしか使わず、ヘッダーとフッターは邪魔になるため表示しないようにする
 */
const isConnecterPath = () => {
    return router.currentRoute.value.path.startsWith('/connecter');
}

/**
 * session_idを作成しMemberDDBに保存する関数
 */
const createSessionIdAndSaveToMemberDDB = async () => {
    isLoading.value = true;

    const now = new Date();
	const tokyo = new Date(
		now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
	);
	const z2 = v => String(v).padStart(2, '0');
	const datetime = [
		tokyo.getFullYear(),
		z2(tokyo.getMonth() + 1),
		z2(tokyo.getDate()),
		z2(tokyo.getHours()),
		z2(tokyo.getMinutes()),
		z2(tokyo.getSeconds())
	].join('');
	const rand4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
	const newSessionId = datetime + rand4;

    localStorage.setItem(USER_ATTR_SESSION_ID, newSessionId);

    try {
        const putUrl = new URL(`${MEMBER_API_URL}/add-session-id`);
        const requestBody = {
            email: localStorage.getItem(USER_ATTR_EMAIL),
            sessionId: newSessionId
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
        isLoading.value = false;
    } finally {
        isLoading.value = false;
    }
}

/**
 * 認証が不要なパスかどうかを判定する関数
 * 新規登録と認証コード確認画面は認証が不要
 */
const isSignUpPath = () => {
    const path = router.currentRoute.value.path;
    return path.startsWith('/signup') || 
           path.startsWith('/confirm-signup') || 
           path.startsWith('/connecter') ||
           path.startsWith('/site-info') ||
           path.startsWith('/contact');
}

onMounted(() => {
    /**
     * 認証イベントを監視
     */
    Hub.listen('auth', async (data) => {
        const { event } = data.payload;
        if (event === 'signedIn') {
            // ユーザー情報をCognitoから取得
            const attributes = await fetchUserAttributes();
            localStorage.setItem(USER_ATTR_EMAIL, attributes[USER_ATTR_EMAIL]);

            const session = await fetchAuthSession();
            idTokenForAuth.value = session['tokens'].idToken;
            localStorage.setItem(ID_TOKEN_FOR_AUTH, idTokenForAuth.value);

            // session_idを作成しMemberDDBに保存
            await createSessionIdAndSaveToMemberDDB();

            // ログイン後にトップページにリダイレクト
            router.push('/top');            
        }
    })
})
</script>

<template>
<div class="min-h-screen flex flex-col">
    <!-- connecterパス以外の場合のみヘッダーを表示 -->
    <header v-if="!isConnecterPath()" class="sticky top-0 z-100">
        <HeaderComp 
            :user="authState.user"
            :signOut="authState.signOut"
        />
    </header>          

    <main class="flex-1 pb-20">
        <template v-if="isSignUpPath()">
            <RouterView />
        </template>
        <template v-else>
            <Authenticator :hideSignUp="true" :login-mechanisms="['email']">
                <template v-slot="{ user }">
                    <RouterView 
                        :user="authState.user"
                        :signOut="authState.signOut"/>
                </template>

                <template v-slot:unauthenticated>
                    <div class="login-container">
                        <h2>Please Log In</h2>
                    </div>
                </template>
            </Authenticator>
            
            <div v-if="authState.authStatus !== 'authenticated'" class="text-center my-4">
                <a href="/signup.html" class="text-center bg-lime-600 text-white px-4 py-2 rounded-sm">
                    新規会員登録
                </a>
            </div>
            <div v-if="authState.authStatus !== 'authenticated'" class="text-center text-sm p-4">
                <p class="mb-8 text-left"><span class="font-bold underline">新規会員登録について</span><br>
                    認証コードの入力画面が表示されなくなった場合、
                    ご登録いただいたメールアドレスとパスワードを上記のログインフォームに入力してログインボタンをタップしていただきますと、認証コード入力画面に移動することができます。<br>
                    認証が成功しましたら、<a href="/register-card-info.html" class="text-center text-blue-600 underline">「新規会員登録時に決済情報登録を完了できなかった場合はこちら」</a>
                    をタップしていただきますと、決済情報登録画面に移動することができます。<br>
                    決済情報の登録が完了しましたら、正式にログインいただくことができるようになります。</p>
                <a href="/register-card-info.html" class="text-blue-600 underline block text-left">
                    新規会員登録時に決済情報登録を完了できなかった場合はこちら
                </a>
            </div>

        </template>
    </main>
        
    <!-- connecterパス以外の場合のみフッターを表示 -->
    <footer v-if="!isConnecterPath()" class="sticky bottom-0 z-50">
        <FooterComp />
    </footer>
</div>
</template>

<style>
:root {
    --amplify-components-authenticator-router-border-color: transparent;
    --amplify-colors-shadow-primary: transparent;
    --amplify-colors-shadow-secondary: transparent;
    --amplify-colors-shadow-tertiary: transparent;
    --amplify-components-authenticator-form-padding: 0;
}
.amplify-button--primary {
    background: #0056cd;
}
</style>