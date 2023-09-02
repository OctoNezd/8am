<template>
    <div class="body-medium background on-background-text" id="main">
        <Tabbar />

        <section v-if="storeLoaded">
            <router-view></router-view>
            <div class="tabbar-padding-mobile"></div>
        </section>
        <div v-else>Идёт загрузка хранилища настроек...</div>
        <SW />
    </div>
</template>
<script setup>
import { useWebAppStore } from './stores/settings'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import SW from './swmgmt.vue'
import Tabbar from './components/tabbar.vue'

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
#main > section {
    max-height: 100vh;
    overflow-y: scroll;
}
</style>
