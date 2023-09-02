import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import SettingsUi from './components/views/SettingsUi.vue'
import Landing from './components/views/Landing.vue'
import Timetable from './components/views/Timetable.vue'
import PageNotFound from './components/views/PageNotFound.vue'
import OtherGroup from './components/views/OtherGroup.vue'

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

import * as VueRouter from 'vue-router'

import './assets/main.css'
import 'vue-search-select/dist/VueSearchSelect.css'
import axios from 'axios'
console.log(import.meta.env)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE
console.log('baseURL:', axios.defaults.baseURL)

const app = createApp(App)
app.use(createPinia())

const routes = [
    { path: '/', component: Landing },
    { path: '/settings', component: SettingsUi },
    { path: '/othergroup', component: OtherGroup },
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
app.use(mdiVue, {
    icons: mdijs
})
app.use(router)
app.mount('#app')
