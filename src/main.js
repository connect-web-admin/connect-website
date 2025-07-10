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
        'Sign in': 'ログイン',
        'Sign up': '新規登録',
        'Enter your email': 'メールアドレス',
        'Forgot your password?': 'パスワードをお忘れの場合',
        'User does not exist.': 'ユーザーが存在しません。',
        'Incorrect username or password.': 'メールアドレスまたはパスワードが間違っています。',
        'Your passwords must match': 'パスワードが一致しません。',
        'Password must be at least 6 characters.': 'パスワードは6文字以上で入力してください。',
        'Password must have at least 6 characters': 'パスワードは6文字以上で入力してください。',
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.': 'パスワードは大文字と小文字のうち少なくとも1つ、数字のうち少なくとも1つを含めてください。',
        'Cannot resend codes. Auto verification not turned on.': '自動検証がオフのため、コードを再送信できません。',
        'PreAuthentication failed with error SyntaxError: Cannot use import statement outside a module.': '認証前チェックでエラーが発生しました。',
        "PreAuthentication failed with error SyntaxError: Unexpected token 'export'.": '認証前チェックでエラーが発生しました。',
        'PreAuthentication failed with error': 'エラー'
    },
});
Amplify.configure(amplifyconfig)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(AmplifyVue)

app.mount('#app')
