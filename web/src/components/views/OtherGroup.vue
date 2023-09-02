<template>
    <section>
        <Header
            title="Другая группа"
            searchable
            search-placeholder="Поиск групп..."
            @search-query-changed="sfilter = $event"
            @search-closed="sfilter = ''"
        ></Header>
        <div v-if="groups.length === 0">⌛Идёт загрузка списка групп</div>
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
                        :to="`/tt/group/${gid}?headerPrefix=${group}`"
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
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWebAppStore } from '@/stores/settings.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/divider/divider.js'
import axios from 'axios'
const sfilter = ref('')
const groupsRaw = ref([])
const { source } = storeToRefs(useWebAppStore())
axios.get('/groups').then((res) => (groupsRaw.value = res.data[source.value]))
const groups = computed(() => {
    let groups = {}
    for (const [group, gid] of Object.entries(groupsRaw.value)) {
        if (group.toLowerCase().includes(sfilter.value.toLowerCase())) {
            groups[group] = gid
        }
    }
    return groups
})
</script>
<style>
.gl {
    overflow-y: scroll;
}
</style>
