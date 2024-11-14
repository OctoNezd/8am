<template>
    <div class="body-medium background on-background-text" id="main">
        <Tabbar />

        <section v-if="storeLoaded">
            <router-view></router-view>
            <div class="tabbar-padding-mobile"></div>
        </section>
        <div v-else>Идёт загрузка хранилища настроек...</div>
        <SW />
        <Custom />
        <vue-cookie-accept-decline :disableDecline="true" :showPostponeButton="false" elementId="myPanel1"
            position="bottom" ref="myPanel1" transitionName="slideFromBottom" type="bar">

            <!-- Optional -->
            <template #message>
                Я использую куки чтоб смотреть сколько людей пользуются 8AM через аналитику гугла.
            </template>

            <!-- Optional -->
            <template #acceptContent>к</template>
        </vue-cookie-accept-decline>
    </div>
</template>
<script setup>
import { useWebAppStore } from './stores/settings'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import SW from './swmgmt.vue'
import Tabbar from './components/tabbar.vue'
import { loadLSTheme } from './theming'
import Custom from './Custom.vue'
import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
import 'vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css';
loadLSTheme()
const router = useRouter()
console.log(router.currentRoute)
const setStore = useWebAppStore()
const { storeLoaded } = storeToRefs(setStore)

setStore.load()
</script>
<style scoped>
#main {
    min-height: 100vh;
}

#main>section {
    max-height: 100vh;
    overflow-y: scroll;
}
</style>
