<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue"
import { Hub } from 'aws-amplify/utils'
import { fetchAuthSession } from 'aws-amplify/auth'
import { CognitoUserPool } from "amazon-cognito-identity-js";
import '@aws-amplify/ui-vue/styles.css';
import { USER_POOL_ID, CLIENT_ID, CONNECTER, ID_TOKEN_FOR_AUTH, 
        USER_ATTR_EMAIL, USER_ATTR_MEMBERSHIP_TYPE, USER_ATTR_SESSION_ID, USER_ATTR_SUB } from '@/utils/constants'
import HeaderComp from './components/HeaderComp.vue'
import FooterComp from './components/FooterComp.vue'
import EventView from './views/EventView.vue'
import SelectLiveReportingMatchView from './views/connecter/SelectMatchToRegisterResultView.vue'


const authState = useAuthenticator()
const router = useRouter()

// ユーザー単位のデータ
const isAccountAvailable = ref(true)
const userAttrEmail = ref('')
const userAttrMembershipType = ref('')
const cognitoUserSub = ref('')
const idTokenForAuth = ref([])

const fetchUserInfoFromCognito = async () => {
    try {
        const userPool = new CognitoUserPool({
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
        })
        
        const cognitoUser = userPool.getCurrentUser()

        if (cognitoUser === null) {
            console.error("ログイン状態のユーザーが存在しません。")
            return
        }

        await new Promise((resolve, reject) => {
            cognitoUser.getSession((err, session) => {
                if(err) {
                    reject(err)
                } else {
                    resolve(session)
                }
            })
        })

        const attributes = await new Promise((resolve, reject) => {
            cognitoUser.getUserAttributes((err, attributes) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(attributes);
                }
            })
        })

        // データセット
        userAttrEmail.value = attributes.find(attr => attr.Name === USER_ATTR_EMAIL).Value
        userAttrMembershipType.value = attributes.find(attr => attr.Name === USER_ATTR_MEMBERSHIP_TYPE).Value
        localStorage.setItem(USER_ATTR_EMAIL, userAttrEmail.value)
        localStorage.setItem(USER_ATTR_MEMBERSHIP_TYPE, userAttrMembershipType.value)

        // API呼び出し（ユーザー情報取得及び動画情報取得）の認可のためのトークンを準備
        const authSession = await fetchAuthSession()
        idTokenForAuth.value = authSession['tokens'].idToken
        cognitoUserSub.value = authSession['tokens'].idToken.payload.sub
        localStorage.setItem(USER_ATTR_SUB, cognitoUserSub.value)
        localStorage.setItem(ID_TOKEN_FOR_AUTH, idTokenForAuth.value)
    } catch (error) {
        console.error('Cognitoユーザー情報の取得に失敗しました。', error)
    }
}

// 認証イベントを監視
onMounted(() => {
    Hub.listen('auth', async (data) => {
        const { event } = data.payload;
        if (event === 'signedIn') {
            // 前回ログアウトボタンを押さなかった場合はローカルストレージに
            // セッションIDとメールアドレスが残っているので、それらを削除
            if (localStorage.getItem(USER_ATTR_SESSION_ID) !== null) {
                localStorage.removeItem(USER_ATTR_SESSION_ID)
            }

            if (localStorage.getItem(USER_ATTR_EMAIL) !== null) {
                localStorage.removeItem(USER_ATTR_EMAIL)
            }

            // ユーザー情報をCognitoから取得
            await fetchUserInfoFromCognito()

            // // ユーザー情報の詳細をDynamoDBから取得
            // fetchUserInfoFromDDB()

            if (userAttrMembershipType.value === CONNECTER) {
                router.push('/connecter_home')
            } else {
                router.push('/event_view')
            }
        }
    })
})
</script>

<template>
<div class="app-wrapper">
    <header class="header">
        <HeaderComp 
            :user="authState.user"
            :signOut="authState.signOut"
        />
    </header>        

    <main class="main">
        <Authenticator :hide-sign-up="true" :login-mechanisms="['email']">
            <template v-slot="{ user }">
                <!-- This content only shows for logged-in users -->
                <RouterView />
            </template>

            <template v-slot:unauthenticated>
                <div class="login-container">
                    <h2>Please Log In</h2>
                    <!-- Amplify's built-in sign-in form will appear here -->
                </div>
            </template>
        </Authenticator>
    </main>
        
    <footer class="footer">
        <FooterComp />
    </footer>
</div>
</template>

<style scoped>
header {
    width: 100%;
    top: 0;
    position: fixed;
    z-index: 1;
}

main {
    padding-top: 267px;
    padding-bottom: 90px;
    height: 100%;
    width: 100%;
}
/* footer {
} */
</style>