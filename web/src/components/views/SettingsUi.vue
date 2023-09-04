<template>
    <div id="settingsUi" class="background">
        <Header title="Настройки" />
        <section>
            <h3>Источник</h3>
            <ModelSelect
                v-model="currentSource"
                :options="sources"
                :is-disabled="sources.length === 0"
                @input="sourceChanged()"
            />
            <h3>Группа</h3>
            <ModelSelect v-model="currentttid" :options="ttids" :is-disabled="ttids.length === 0" />
            <br />
            <md-filled-button
                :href="`webcal://${apiEndpoint}/group/${currentSource}/${currentttid}.ics`"
            >
                <mdicon name="calendar" :width="24" slot="icon" />
                Добавить в календарь WebCal (iOS, DAVx5)
            </md-filled-button>
            <br />
            <br />

            <md-filled-button
                :href="`https://www.google.com/calendar/render?cid=webcal://sharaga.octonezd.me/group/${currentSource}/${currentttid}.ics`"
            >
                <mdicon name="google" :width="24" slot="icon" />
                Добавить в Google Calendar
            </md-filled-button>
            <h3>Предпочитаемые карты</h3>
            <ModelSelect
                v-model="preferredMapProvider"
                :options="[
                    { value: 'http://maps.apple.com/?q=', text: 'Apple Maps/Google Maps' },
                    { value: 'http://maps.google.com/?q=', text: 'Google Maps' },
                    { value: 'http://maps.yandex.ru/?q=', text: 'Yandex Maps' }
                ]"
            />
            <br />
            <md-outlined-button @click="makeThemeFromImg">
                <mdicon name="palette" :width="24" slot="icon" />
                Загрузить изображение для темы monet
            </md-outlined-button>
            <h4>
                <p>Версия приложения: {{ app_version }}.</p>
                <p v-if="vercelUrl !== undefined">Ссылка Vercel: {{  vercelUrl }}</p>

                <md-outlined-button @click="forceAppUpdate">
                    <mdicon name="warning" :width="24" slot="icon" />
                    Принудительно обновить
                </md-outlined-button>
            </h4>
        </section>
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { ModelSelect } from 'vue-search-select'
import { useWebAppStore } from '@/stores/settings'
import { makeThemeFromImg } from '@/theming'
import Header from '../header.vue'
import axios from 'axios'
import '@material/web/button/outlined-button.js'
import '@material/web/button/filled-button.js'

const vercelUrl = ref(import.meta.env.VITE_VERCEL_URL)
const apiEndpoint = ref(location.host)
const settingsStore = useWebAppStore()
const preferredMapProvider = ref(settingsStore.preferredMapProvider)
const currentSource = ref(settingsStore.source)
const currentttid = ref(settingsStore.ttid)
const sources = ref([])
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
        return Object.entries(allTimeTableIDs.value[currentSource.value]).map((el) => {
            return { text: el[0] + ` (ID:${el[1]})`, value: el[1].toString() }
        })
    }
})
axios.get('/groups').then((res) => (allTimeTableIDs.value = res.data))
axios.get('/sources').then((res) =>
    Object.entries(res.data).forEach((el) => {
        const [value, text] = el
        sources.value.push({
            text,
            value
        })
    })
)

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
#settingsUi > section {
    padding-left: 16px;
    padding-right: 16px;
    overflow-x: hidden;
}
</style>
