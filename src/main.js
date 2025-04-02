import './assets/main.css'
// import '@aws-amplify/ui-vue/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import router from './router'

import { Amplify } from 'aws-amplify'
import AmplifyVue from '@aws-amplify/ui-vue'
import amplifyconfig from './amplifyconfiguration.json'
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-vue';
I18n.putVocabularies(translations);
I18n.setLanguage('ja');

I18n.putVocabularies({
    ja: {
        'Sign In': 'ログイン',
        'Sign Up': '新規登録',
        'Enter your email': 'メールアドレス',
        'Forgot your password?': 'パスワードをお忘れの場合',
    },
});
Amplify.configure(amplifyconfig)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(AmplifyVue)

app.mount('#app')
