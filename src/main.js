import './assets/main.css'
import '@aws-amplify/ui-vue/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import router from './router'

import { Amplify } from 'aws-amplify'
import AmplifyVue from '@aws-amplify/ui-vue'
import amplifyconfig from './amplifyconfiguration.json'
Amplify.configure(amplifyconfig)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(AmplifyVue)

app.mount('#app')
