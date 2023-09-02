import { defineStore } from 'pinia'
import { ref } from 'vue'
import localForage from 'localforage'

export const useWebAppStore = defineStore('settings', () => {
    const source = ref('')
    const timetabletype = ref('group')
    const ttid = ref('')
    const preferredMapProvider = ref('http://maps.apple.com/?q=')


    const storeLoaded = ref(false)
    const sidebarVisible = ref(false)

    async function save() {
        console.log('Settings: saving...')
        await localForage.setItem('source', source.value)
        await localForage.setItem('ttid', ttid.value)
        await localForage.setItem('pm', preferredMapProvider.value)
        console.log('Settings: saved', source.value, ttid.value)
        console.log(await localForage.getItem('source'))
    }
    function load() {
        return Promise.all([
            localForage.getItem('source').then((lfv) => (source.value = lfv)),
            localForage.getItem('ttid').then((lfv) => (ttid.value = lfv)),
            localForage.getItem('pm').then((lfv) => {
                if (lfv === null) {
                    return
                }
                preferredMapProvider.value = lfv
            })
        ]).then(() => {
            storeLoaded.value = true
            console.log('Settings: loaded. Source:', source.value, 'ttid:', ttid.value)
        })
    }
    return {
        source,
        timetabletype,
        ttid,
        preferredMapProvider,

        storeLoaded,
        sidebarVisible,

        save,
        load
    }
})

