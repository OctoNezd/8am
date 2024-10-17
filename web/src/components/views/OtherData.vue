<template>
    <section>
        <Header :title="pageTitle" searchable :search-placeholder="searchPlaceholder"
            @search-query-changed="search($event)" @search-closed="search('')"></Header>
        <div v-if="loading" class="loadingIndicator">
            <md-circular-progress indeterminate aria-label="Индикатор загрузки"></md-circular-progress>
            <p>Идёт загрузка списка {{ itemsName }}</p>
        </div>
        <div v-else class="gl">
            <md-list style="
                    display: flex;
                    justify-content: stretch;
                    flex-direction: column;
                    max-width: 100%;
                ">
                <div v-if="Object.entries(groups).length > 0" v-for="[group, gid] in Object.entries(groups)" :key="gid"
                    class="groupitem">
                    <router-link v-if="route.query.setup != 'yes'"
                        :to="`/tt/${desiredEndpoint}/${gid}?headerPrefix=${group}`" style="text-decoration: none">
                        <md-list-item :headline="group"></md-list-item>
                    </router-link>
                    <a @click="setGroup(group, gid)" v-else><md-list-item :headline="group"></md-list-item></a>
                </div>
                <div v-else>
                    <md-list-item>
                        <p>Нет результатов поиска. Если вы не ввели запрос, попробуйте ввести его - возможно ваш
                            источник не поддерживает глобальный список</p>
                    </md-list-item>
                </div>
            </md-list>
        </div>
    </section>
</template>
<script setup>
import Header from '../header.vue'
import debounce from 'lodash.debounce'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWebAppStore } from '@/stores/settings.js'
import { useRoute, useRouter } from 'vue-router'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/progress/circular-progress.js'

import axios from 'axios'
const loading = ref(true)
const groups = ref([])
const itemsName = ref('')
const { source, ttid, ttcache } = storeToRefs(useWebAppStore())

const search = debounce(async (query) => {
    loading.value = true
    const url = `/${desiredEndpoint.value}s?search_string=${query}&source=${source.value}`
    console.log("URL:", url)
    let req = await axios.get(url)
    loading.value = false
    groups.value = req.data
}, 500)
const pageTitle = ref('')
const searchPlaceholder = ref('')
const desiredEndpoint = ref('')
const route = useRoute()
console.log(route.path)
const router = useRouter()
function routeSetup() {
    loading.value = true
    if (route.path === '/othergroup') {
        desiredEndpoint.value = 'group'
        pageTitle.value = 'Расписание групп'
        searchPlaceholder.value = 'Поиск по группам'
        itemsName.value = 'групп'
    } else if (route.path === '/teachers') {
        desiredEndpoint.value = 'teacher'
        pageTitle.value = 'Расписание преподов'
        searchPlaceholder.value = 'Поиск по преподам'
        itemsName.value = 'преподов'
    }
    search('')
}
routeSetup()
watch(route, routeSetup)

function setGroup(group, gid) {
    console.log('setGroup', gid)
    ttid.value = gid
    ttcache.value = group
    router.push("/settings")
}
</script>
<style>
.gl {
    overflow-y: scroll;
}

.loadingIndicator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 90vh;
}
</style>
