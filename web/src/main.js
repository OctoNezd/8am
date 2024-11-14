import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import SettingsUi from './components/views/SettingsUi.vue'
import Landing from './components/views/Landing.vue'
import Timetable from './components/views/Timetable.vue'
import PageNotFound from './components/views/PageNotFound.vue'
import OtherData from './components/views/OtherData.vue'

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

import * as VueRouter from 'vue-router'

import './assets/main.css'
import axios from 'axios'
import * as Sentry from '@sentry/vue'
import "./polyfills.js"
import VueGtag from "vue-gtag";

console.log(import.meta.env)
if (import.meta.env.VITE_VERCEL_URL === undefined) {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE
    const url = new URL(axios.defaults.baseURL)
    console.log("baseurl:", url, url.host, url.hostname)
    if (url.hostname === "127.0.0.1") {
        url.hostname = location.hostname
        console.log("DEV: Updating baseurl to", url)
        axios.defaults.baseURL = url.toString()
    }
}
window.axios = axios
console.log('Final baseURL:', axios.defaults.baseURL)

const app = createApp(App)
app.use(createPinia())

const routes = [
    { path: '/', component: Landing },
    { path: '/settings', component: SettingsUi },
    { path: '/othergroup', component: OtherData },
    { path: '/teachers', component: OtherData },
    { path: '/tt/:type/:id', component: Timetable },
    { path: '/:pathMatch(.*)*', component: PageNotFound }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: VueRouter.createWebHashHistory(),
    routes // short for `routes: routes`
})
console.log('DSN:', __SENTRY_DSN__)
if (__SENTRY_DSN__ !== undefined) {
    console.info('Starting sentry')
    Sentry.init({
        app,
        dsn: __SENTRY_DSN__,
        integrations: [
            new Sentry.BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router)
            }),
            new Sentry.Replay()
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,

        // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [
            'localhost',
            /^http(s?):\/\/8am(-.*\.vercel\.app|\.octonezd\.me)\/(groups|sources|teachers|.*\.ics)/
        ],

        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
    })
} else {
    console.warn('Sentry DSN is not set up.')
}

const GA_ID = 'G-LTG2WCYJWB'
app.use(VueGtag, {config: { id: GA_ID }})
app.use(mdiVue, {
    icons: mdijs
})
app.use(router)
app.mount('#app')
