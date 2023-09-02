<template>
    <section>
        <Header
            :title="pageTitle"
            searchable
            :search-placeholder="searchPlaceholder"
            @search-query-changed="sfilter = $event"
            @search-closed="sfilter = ''"
        ></Header>
        <div v-if="loading" class="loadingIndicator">
            <md-circular-progress
                indeterminate
                aria-label="Индикатор загрузки"
            ></md-circular-progress>
            <p>Идёт загрузка списка {{ itemsName }}</p>
        </div>
        <div v-else class="gl">
            <md-list
                style="
                    display: flex;
                    justify-content: stretch;
                    flex-direction: column;
                    max-width: 100%;
                "
            >
                <div v-for="[group, gid] in Object.entries(groups)" :key="gid" class="groupitem">
                    <router-link
                        :to="`/tt/${desiredEndpoint}/${gid}?headerPrefix=${group}`"
                        style="text-decoration: none"
                    >
                        <md-list-item :headline="group"></md-list-item>
                    </router-link>
                </div>
            </md-list>
        </div>
    </section>
</template>
<script setup>
import Header from '../header.vue'
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWebAppStore } from '@/stores/settings.js'
import { useRoute } from 'vue-router'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/progress/circular-progress.js'

import axios from 'axios'
const sfilter = ref('')
const groupsRaw = ref([])
const loading = ref(true)
const itemsName = ref('')
const groups = computed(() => {
    let groups = {}
    for (const [group, gid] of Object.entries(groupsRaw.value)) {
        if (group.toLowerCase().includes(sfilter.value.toLowerCase())) {
            groups[group] = gid
        }
    }
    return groups
})
const pageTitle = ref('')
const searchPlaceholder = ref('')
const desiredEndpoint = ref('')
const { source } = storeToRefs(useWebAppStore())
const route = useRoute()
console.log(route.path)

function routeSetup() {
    loading.value = true
    if (route.path === '/othergroup') {
        desiredEndpoint.value = 'group'
        pageTitle.value = 'Расписание групп'
        searchPlaceholder.value = 'Поиск по группам'
        itemsName.value = 'групп'
    } else if (route.path === '/teachers') {
        desiredEndpoint.value = 'teacher'
        pageTitle.value = 'Расписание учителей'
        searchPlaceholder.value = 'Поиск по учителям'
        itemsName.value = 'учителей'
    }
    axios
        .get(`/${desiredEndpoint.value}s`)
        .then((res) => ((groupsRaw.value = res.data[source.value]), (loading.value = false)))
}
routeSetup()
watch(route, routeSetup)
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
