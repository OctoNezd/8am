<template>
    <div id="tabbar" activeIndex="1">
        <md-navigation-bar ref="tabbar">
            <md-navigation-tab
                label="Расписание"
                :active="route.path == '/'"
                @click="router.push('/')"
            >
                <mdicon name="timetable" :width="24" slot="activeIcon" />
                <mdicon name="timetable" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab
                label="Группы"
                :active="route.path == '/othergroup'"
                @click="router.push('/othergroup')"
            >
                <mdicon name="account-group" :width="24" slot="activeIcon" />
                <mdicon name="account-group" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab
                label="Преподы"
                :active="route.path == '/teachers'"
                @click="router.push('/teachers')"
            >
                <mdicon name="human-male-board" :width="24" slot="activeIcon" />
                <mdicon name="human-male-board" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab
                label="Настройки"
                :active="route.path == '/settings'"
                @click="router.push('/settings')"
            >
                <mdicon name="cog" :width="24" slot="activeIcon" />
                <mdicon name="cog" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>
        </md-navigation-bar>
    </div>
</template>
<script setup>
import '@material/web/labs/navigationbar/navigation-bar.js'
import '@material/web/labs/navigationtab/navigation-tab.js'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
const tabbar = ref(null)
watch(tabbar, (tabbaritem) => {
    // hack
    console.log('tb:', tabbaritem)
    tabbaritem.shadowRoot.innerHTML += `
    <style>
    .md3-navigation-bar__tabs-slot-container {
        flex-direction: var(--tabbardirection, row);
        justify-content: var(--tabbarjustify, unset);
    }
    </style>`
})
const route = useRoute()
const router = useRouter()
</script>
<style>
#tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    z-index: 99;
}
</style>
