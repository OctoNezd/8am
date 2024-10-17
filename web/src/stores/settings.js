import { defineStore } from 'pinia'
import { ref } from 'vue'
import localForage from 'localforage'

export const useWebAppStore = defineStore('settings', () => {
    const source = ref('') // Source
    const timetabletype = ref('group') // maybe some day we will support teachers. Scary.
    const ttid = ref('') // Group ID
    const ttcache = ref('') // Cached group name
    const preferredMapProvider = ref('http://maps.apple.com/?q=') // What opens when the user clicks on a map link

    const storeLoaded = ref(false)

    async function save() {
        console.log('Settings: saving...')
        await localForage.setItem('source', source.value)
        await localForage.setItem('ttid', ttid.value)
        await localForage.setItem('ttcache', ttcache.value)
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
            }),
            localForage.getItem('ttcache').then((lfv) => (ttcache.value = lfv))
        ]).then(() => {
            storeLoaded.value = true
            console.log('Settings: loaded. Source:', source.value, 'ttid:', ttid.value)
        })
    }
    return {
        source,
        timetabletype,
        ttid,
        ttcache,
        preferredMapProvider,

        storeLoaded,

        save,
        load
    }
})
