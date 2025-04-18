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
import { CONNECTER, ID_TOKEN_FOR_AUTH, USER_ATTR_EMAIL, USER_ATTR_MEMBERSHIP_TYPE, USER_ATTR_SESSION_ID, USER_ATTR_SUB } from '@/utils/constants';
import HeaderComp from './components/HeaderComp.vue'; 
import FooterComp from './components/FooterComp.vue';

// 認証状態を管理するオブジェクト   
const authState = useAuthenticator();
// ルーティングを管理するオブジェクト
const router = useRouter();
// ユーザー単位のデータ
const isAccountAvailable = ref(true);
const userAttrMembershipType = ref('');

/**
 * Cognitoからユーザー情報を取得し、ローカルストレージにセット
 */
const fetchUserInfoFromCognito = async () => {
    try {
        // 現在のユーザーと属性を取得
        const attributes = await fetchUserAttributes();

        // ユーザー属性を取得・ローカルストレージにセット
        localStorage.setItem(USER_ATTR_EMAIL, attributes[USER_ATTR_EMAIL]);
        // localStorage.setItem(USER_ATTR_MEMBERSHIP_TYPE, attributes[USER_ATTR_MEMBERSHIP_TYPE]);

        // ログイン後にユーザーの種別によりルーティングを変更するために格納
        // userAttrMembershipType.value = attributes[USER_ATTR_MEMBERSHIP_TYPE];

        // API認可用のトークンを取得・ローカルストレージにセット
        const authSession = await fetchAuthSession();
        localStorage.setItem(ID_TOKEN_FOR_AUTH, authSession.tokens.idToken);
        localStorage.setItem(USER_ATTR_SUB, authSession.tokens.idToken.payload.sub);
    } catch (error) {
        console.error('Cognitoユーザー情報の取得に失敗しました。', error);
    }
}

/**
 * connecterのパスかどうかを判定する関数
 * connecterのパスは、試合を速報する時にしか使わず、ヘッダーとフッターは邪魔になるため表示しないようにする
 */
const isConnecterPath = () => {
    return router.currentRoute.value.path.startsWith('/connecter');
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
           path.startsWith('/site-info');
}


onMounted(() => {
    /**
     * 認証イベントを監視
     */
    Hub.listen('auth', async (data) => {
        const { event } = data.payload;
        if (event === 'signedIn') {
            // ユーザー情報をCognitoから取得
            await fetchUserInfoFromCognito();

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
        <RouterView />
        <!-- <template v-if="isSignUpPath()">
            <RouterView />
        </template>
        <template v-else>
            <Authenticator :hideSignUp="true" :login-mechanisms="['email']">
                <template v-slot="{ user }">
                    <RouterView />
                </template>

                <template v-slot:unauthenticated>
                    <div class="login-container">
                        <h2>Please Log In</h2>
                    </div>
                </template>
            </Authenticator>
            <div v-if="authState.authStatus !== 'authenticated'" class="text-center mt-10">
                <a href="/signup.html" class="text-center bg-lime-600 text-white px-4 py-2 rounded-sm">
                    新規会員登録
                </a>
            </div>
        </template> -->
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