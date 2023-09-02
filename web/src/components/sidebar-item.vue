<template>
    <RouterLink :to="to">
        <div :class="{ 'sidebar-item-active': active }" class="sidebar-item">
            <mdicon :name="icon" :width="24" />
            {{ text }}
        </div>
    </RouterLink>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useWebAppStore } from '@/stores/settings'
import { ref, watch } from 'vue'
const route = useRoute()
const store = useWebAppStore()
const props = defineProps({
    text: String,
    icon: String,
    to: String
})
const active = ref(false)
console.log(route)
function updateRouteActive() {
    active.value = false
    if (route.path === props.to) {
        active.value = true
    }
    if (props.to === '/') {
        if (route.path === `/tt/${store.timetabletype}/${store.ttid}`) {
            active.value = true
        }
    }
}
watch(route, updateRouteActive)
updateRouteActive()
</script>
<style>
.sidebar-item {
    color: var(--md-sys-color-on-surface-variant);
    height: 56px;
    display: flex;
    align-items: center;
    padding-left: 28px;
    gap: 12px;
    margin-left: 16px;
    margin-right: 12px;
    font-family: var(--md-sys-typescale-label-large-font-family);
    font-weight: var(--md-sys-typescale-label-large-font-weight);
    font-size: var(--md-sys-typescale-label-large-font-size);
    line-height: var(--md-sys-typescale-label-large-line-height);
    letter-spacing: var(--md-sys-typescale-label-large-letter-spacing);
}
.sidebar-item.sidebar-item-active {
    color: var(--md-sys-color-on-secondary-container);
    background-color: var(--md-sys-color-secondary-container);
    border-radius: 28px;
}
</style>

