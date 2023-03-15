<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
const intervalMS = 60 * 60 * 1000
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
console.log(offlineReady, needRefresh, updateServiceWorker)

const close = () => {
    offlineReady.value = false
    needRefresh.value = false
}
if (offlineReady) {
    console.log('autoclose in 2sec')
    setTimeout(close, 2000)
}
</script>

<template>
    <div v-if="offlineReady || needRefresh" class="pwa-toast" role="alert">
        <div class="message">
            <span v-if="offlineReady"> Приложение готово к работе оффлайн. </span>
            <span v-else> Доступно обновление. Нажмите для перезапуска приложения. </span>
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
    z-index: 1;
    text-align: left;
    box-shadow: 3px 4px 5px 0 #8885;
    background-color: white;
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

