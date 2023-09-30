<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
const intervalMS = 60 * 60 * 1000
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
console.log(offlineReady, needRefresh, updateServiceWorker)

const close = () => {
    offlineReady.value = false
    needRefresh.value = false
}
</script>

<template>
    <div v-if="needRefresh" class="pwa-toast" role="alert">
        <div class="message">
            <span> Доступно обновление. Нажмите для перезапуска приложения. </span>
        </div>
        <button v-if="needRefresh" @click="updateServiceWorker()">Обновить</button>
    </div>
</template>

<style>
.pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 1000;
    text-align: left;
    background-color: inherit;
}

.pwa-toast .message {
    margin-bottom: 8px;
}

.pwa-toast button {
    border: 1px solid #8885;
    outline: none;
    margin-right: 5px;
    border-radius: 2px;
    padding: 3px 10px;
}
</style>
