<template>
    <div class="body-medium background on-background-text" id="main">
        <router-view v-if="storeLoaded"></router-view>
        <div v-else>Идёт загрузка хранилища настроек...</div>
    </div>
</template>
<script setup>
import { useSettingsStore } from './stores/settings'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
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
