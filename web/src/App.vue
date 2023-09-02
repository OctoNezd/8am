<template>
    <div class="body-medium background on-background-text" id="main">
        <sidebar @toggleSidebar="sidebarVisible = !sidebarVisible" :class="{ hidden: !sidebarVisible }" @close="sidebarVisible = false" />
        <section v-if="storeLoaded">
            <router-view></router-view>
        </section>
        <div v-else>Идёт загрузка хранилища настроек...</div>
        <SW />
    </div>
</template>
<script setup>
import { useSettingsStore } from './stores/settings'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import SW from './swmgmt.vue'
import Sidebar from './components/sidebar.vue'
const sidebarVisible = ref(false)

const router = useRouter()
console.log(router.currentRoute)
const setStore = useSettingsStore()
const { storeLoaded } = storeToRefs(setStore)

setStore.load()
</script>
<style scoped>
#main {
    min-height: 100vh;
}
</style>
