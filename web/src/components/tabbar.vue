<template>
    <div id="tabbar" activeIndex="1">
        <md-navigation-bar ref="tabbar" v-if="!useLegacyTB">
            <md-navigation-tab label="Расписание" :active="route.path == '/'" @click="router.push('/')">
                <mdicon name="timetable" :width="24" slot="activeIcon" />
                <mdicon name="timetable" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab label="Группы" :active="route.path == '/othergroup'" @click="router.push('/othergroup')">
                <mdicon name="account-group" :width="24" slot="activeIcon" />
                <mdicon name="account-group" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab label="Преподы" :active="route.path == '/teachers'" @click="router.push('/teachers')">
                <mdicon name="human-male-board" :width="24" slot="activeIcon" />
                <mdicon name="human-male-board" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>

            <md-navigation-tab label="Настройки" :active="route.path == '/settings'" @click="router.push('/settings')">
                <mdicon name="cog" :width="24" slot="activeIcon" />
                <mdicon name="cog" :width="24" slot="inactiveIcon" />
            </md-navigation-tab>
        </md-navigation-bar>
        <div id="legacyTb" v-else>
            <router-link to="/">
                <mdicon name="timetable" :size="32" />
                Расписание
            </router-link>
            <router-link to='/settings'>
                <mdicon name="cog" :size="32" />
                Настройки
            </router-link>
            <p id="legacyNotice">LEGACY MODE</p>
        </div>
    </div>
</template>
<script setup>
import '@material/web/labs/navigationbar/navigation-bar.js'
import '@material/web/labs/navigationtab/navigation-tab.js'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onMounted, nextTick } from 'vue'
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
const useLegacyTB = ref(false)
onMounted(async () => {
    await nextTick()
    const tbh = document.querySelector("#tabbar > md-navigation-bar").getBoundingClientRect().height
    if (tbh === 0) {
        console.warn("Using legacy tabbar - seems like tabbar height is 0.")
        useLegacyTB.value = true
    }
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

#legacyTb {
    background-color: var(--md-navigation-bar-container-color, var(--md-sys-color-surface-container, #f3edf7));
    height: 60px;
    display: flex;
    justify-content: space-around;
    gap: 25px;
}

#legacyTb>a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
}

#legacyNotice {
    position: fixed;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    padding: 0;
    margin: 0;
}
</style>
