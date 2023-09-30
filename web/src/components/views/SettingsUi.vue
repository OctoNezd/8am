<template>
    <div id="settingsUi" class="background">
        <Header title="Настройки" />
        <md-list style="
                    display: flex;
                    justify-content: stretch;
                    flex-direction: column;
                    max-width: 100%;
                ">
            <DataPicker itemTitle="Источник" pageTitle="Выбор источника" dataSource="sources" v-model="currentSource"
                icon="school" />
            <DataPicker itemTitle="Группа" pageTitle="Выбор группы" dataSource="groups" v-model="currentttid"
                icon="account-group" />
            <md-divider></md-divider>
            <a style="text-decoration: none" :href="`webcal://${apiEndpoint}/group/${currentSource}/${currentttid}.ics`">
                <md-list-item headline="Добавить в календарь WebCal" supporting-text="Для iOS/iPadOS/Outlook/DAVx5">
                    <mdicon name="apple-ios" slot="start" class="listIcon" />
                </md-list-item>
            </a>
            <a style="text-decoration: none"
                :href="`https://www.google.com/calendar/render?cid=webcal://sharaga.octonezd.me/group/${currentSource}/${currentttid}.ics`">
                <md-list-item headline="Добавить в Google Calendar" supporting-text="Для Android">
                    <mdicon name="android" slot="start" class="listIcon" />
                </md-list-item>
            </a>
            <md-divider></md-divider>
            <DataPicker itemTitle="Провайдер карт" pageTitle="Выбор провайдера карт" dataSource="mapProviders"
                v-model="preferredMapProvider" icon="map-marker" />
            <md-list-item headline="Сгенерировать тему Material You" @click="makeThemeFromImg">
                <mdicon name="palette" slot="start" class="listIcon" />
            </md-list-item>
            <md-divider></md-divider>
            <md-list-item headline="Версия приложения" :supporting-text="app_version">
                <mdicon name="gauge" slot="start" class="listIcon" />
            </md-list-item>
            <md-list-item headline="Принудительно обновить" supporting-text="Если не сработает, сбросьте кэш браузера."
                @click="forceAppUpdate">
                <mdicon name="update" slot="start" class="listIcon" />
            </md-list-item>
            <md-list-item headline="Ввести название группы вручную"
                supporting-text="Если открытие списка вызывает вылет браузера." @click="manuallySelectGroup">
                <mdicon name="car-shift-pattern" slot="start" class="listIcon" />
            </md-list-item>
        </md-list>
    </div>
</template>
<script setup>
import { ref, computed, watch, provide } from 'vue'
import { useWebAppStore } from '@/stores/settings'
import { makeThemeFromImg } from '@/theming'
import Header from '../header.vue'
import axios from 'axios'
import '@material/web/button/outlined-button.js'
import '@material/web/button/filled-button.js'
import '@material/web/divider/divider.js'
import DataPicker from '../DataPicker.vue'

const apiEndpoint = ref(location.host)
const settingsStore = useWebAppStore()
const preferredMapProvider = ref(settingsStore.preferredMapProvider)
const currentSource = ref(settingsStore.source)
const currentttid = ref(settingsStore.ttid)
const sources = ref({})
const allTimeTableIDs = ref([])
const app_version = ref(__APP_VER__)
const ttids = computed(() => {
    console.log(
        'ttid recomputing',
        currentSource.value,
        allTimeTableIDs.value[currentSource.value],
        allTimeTableIDs.value
    )
    if (allTimeTableIDs.value[currentSource.value] === undefined) {
        console.log('invalid or empty ttid')
        return []
    } else {
        return Object.fromEntries(Object.entries(allTimeTableIDs.value[currentSource.value]).map(a => a.reverse()))
    }
})

provide("sources", sources)
provide("groups", ttids)
const mapProviders = ref({
    'http://maps.apple.com/?q=': 'Apple Maps/Google Maps',
    'http://maps.google.com/?q=': 'Google Maps',
    'http://maps.yandex.ru/?q=': 'Yandex Maps'
})
provide("mapProviders", mapProviders)

axios.get('/groups').then((res) => allTimeTableIDs.value = res.data)
axios.get('/sources').then((res) => sources.value = res.data)

Array(
    [currentSource, 'source'],
    [currentttid, 'ttid'],
    [preferredMapProvider, 'preferredMapProvider']
).forEach((t) => {
    const [refItem, stateItem] = t
    console.log('set up watcher for', stateItem)
    watch(refItem, (newValue) => {
        console.log('Settings: update', stateItem, 'to', newValue)
        let tstore = {}
        tstore[stateItem] = newValue
        console.log('patching settings store with', tstore)
        settingsStore.$patch(tstore)
        settingsStore.save()
    })
})
function manuallySelectGroup() {
    const desiredGroup = prompt("Введите ID вашей группы. Обычно это цифра в адресной строке сайта университета, например 24285")
    const gid = ttids.value[desiredGroup]
    console.log(ttids.value, desiredGroup)
    if (gid !== undefined) {
        alert(`Установлена группа ${gid}`)
        currentttid.value = desiredGroup;
    } else {
        alert("Группа не найдена. Попробуйте ещё раз.")
    }
}
async function forceAppUpdate() {
    const cacheKeys = await caches.keys()
    for (const key of cacheKeys) {
        await caches.delete(key)
    }
    const workers = await navigator.serviceWorker.getRegistrations()
    for (const worker of workers) {
        worker.unregister()
    }
    alert('Кэши очищены. Страница будет перезагружена.')
    location.reload()
}
</script>
<style>
/* #settingsUi>section {
    padding-left: 16px;
    padding-right: 16px;
    overflow-x: hidden;
} */
</style>
