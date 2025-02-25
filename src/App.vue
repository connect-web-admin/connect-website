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

// 一般公開までの準備中ページを表示するためのフラグ
const isPreparation = ref(false);

// 認証状態を管理するオブジェクト   
const authState = useAuthenticator();

// ルーティングを管理するオブジェクト
const router = useRouter();

// ユーザー単位のデータ
const isAccountAvailable = ref(true);
const userAttrMembershipType = ref('');

// Cognitoからユーザー情報を取得し、ローカルストレージにセット
const fetchUserInfoFromCognito = async () => {
    try {
        // 現在のユーザーと属性を取得
        const attributes = await fetchUserAttributes();

        // ユーザー属性を取得・ローカルストレージにセット
        localStorage.setItem(USER_ATTR_EMAIL, attributes[USER_ATTR_EMAIL]);
        localStorage.setItem(USER_ATTR_MEMBERSHIP_TYPE, attributes[USER_ATTR_MEMBERSHIP_TYPE]);

        // ログイン後にユーザーの種別によりルーティングを変更するために格納
        userAttrMembershipType.value = attributes[USER_ATTR_MEMBERSHIP_TYPE];

        // API認可用のトークンを取得・ローカルストレージにセット
        const authSession = await fetchAuthSession();
        localStorage.setItem(ID_TOKEN_FOR_AUTH, authSession.tokens.idToken);
        localStorage.setItem(USER_ATTR_SUB, authSession.tokens.idToken.payload.sub);
    } catch (error) {
        console.error('Cognitoユーザー情報の取得に失敗しました。', error);
    }
}

// 認証イベントを監視
onMounted(() => {
    Hub.listen('auth', async (data) => {
        const { event } = data.payload;
        if (event === 'signedIn') {
            // ユーザー情報をCognitoから取得
            await fetchUserInfoFromCognito();

            // // ユーザー情報の詳細をDynamoDBから取得
            // fetchUserInfoFromDDB()

            if (userAttrMembershipType.value === CONNECTER) {
                router.push('/connecter/home');
            } else {
                router.push('/event_view');
            }
        }
    })
})
</script>

<template>
<div v-if="isPreparation">
    <h1>connect</h1>
    <p>5月中旬一般公開予定</p>
</div>
<div v-else class="min-h-screen flex flex-col">
    <!-- <header class="sticky top-0 z-50 bg-white">
        <HeaderComp 
            :user="authState.user"
            :signOut="authState.signOut"
        />
    </header>         -->

    <main class="flex-1">
        <Authenticator :hide-sign-up="true" :login-mechanisms="['email']">
            <template v-slot="{ user }">
                <RouterView />
            </template>

            <template v-slot:unauthenticated>
                <div class="login-container">
                    <h2>Please Log In</h2>
                </div>
            </template>
        </Authenticator>
    </main>
        
    <!-- <footer class="mt-auto">
        <FooterComp />
    </footer> -->
</div>
</template>

<style scoped></style>