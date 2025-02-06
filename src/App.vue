<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { Authenticator } from "@aws-amplify/ui-vue"
import { Hub } from 'aws-amplify/utils'
import { CognitoUserPool } from "amazon-cognito-identity-js";
import '@aws-amplify/ui-vue/styles.css';
import { USER_POOL_ID, CLIENT_ID, CONNECTER, ID_TOKEN_FOR_AUTH, 
        USER_ATTR_EMAIL, USER_ATTR_MEMBERSHIP_TYPE, USER_ATTR_SESSION_ID, USER_ATTR_SUB } from '@/utils/constants'
import HeaderComp from './components/HeaderComp.vue'
import FooterComp from './components/FooterComp.vue'
import EventView from './views/EventView.vue'
import SelectLiveReportingMatchView from './views/connecter/SelectMatchToRegisterResultView.vue'
import { fetchAuthSession } from 'aws-amplify/auth'

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
                localStorage.removeItem(USER_ATTR_SESSION_ID);
            }
            if (localStorage.getItem(USER_ATTR_EMAIL) !== null) {
                localStorage.removeItem(USER_ATTR_EMAIL);
            }

            // ユーザー情報をCognitoから取得
            await fetchUserInfoFromCognito()

            // // ユーザー情報の詳細をDynamoDBから取得
            // fetchUserInfoFromDDB()

            if (userAttrMembershipType.value === CONNECTER) {
                router.push('/select_match_to_register_result')
            } else {
                router.push('/event_view')
            }
        }
    });
})
</script>

<template>
<authenticator :hide-sign-up="true" :login-mechanisms="['email']">
    <template v-slot:sign-in-header>
        <p class="sign-in-header-title">
            あああ
        </p>
    </template>
    
    <template v-slot="{ user, signOut }">
        <div v-if="isAccountAvailable">
            <header>
                <HeaderComp 
                    :user="user"
                    :signOut="signOut"
                />
            </header>
            <main>
                <RouterView />
            </main>
            <!-- <footer>
                <FooterComp />
            </footer> -->
        </div>
        <div v-else>
            あんあべいらぼー
            <!-- <AccountUnavailable :signOut="signOut" /> -->
        </div>
    </template>

    <!-- <template v-slot:footer>
        <div v-if="onMaintenanceNotice">
            <MaintenanceNotice />
        </div>
        <FooterComp />
    </template> -->
</authenticator>
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

<!-- <template>
    <header>
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
            <HelloWorld msg="You did it!" />

            <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />
</template>

<style scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

nav {
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }

    nav {
        text-align: left;
        margin-left: -1rem;
        font-size: 1rem;

        padding: 1rem 0;
        margin-top: 1rem;
    }
}
</style> -->
