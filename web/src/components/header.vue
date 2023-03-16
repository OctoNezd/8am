<template>
    <span>
        <header class="topbar surface">
            <button @click="sidebarVisible = true" class="topbar-lnav">
                <mdicon name="menu"></mdicon>
            </button>
            <p class="topbar-headline">{{ title }}</p>
            <div style="flex-grow: 1" />
            <slot />
        </header>
        <sidebar v-if="sidebarVisible" @close="sidebarVisible = false" />
    </span>
</template>
<script setup>
import { ref } from 'vue'
import Sidebar from './sidebar.vue'
const props = defineProps(['title'])
const sidebarVisible = ref(false)
</script>

<style>
.topbar {
    width: 100vw;
    height: 56px;
    display: flex;
    flex-direction: row;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    align-items: center;
    font-size: 20pt;
    padding-top: env(safe-area-inset-top);
    justify-content: space-between;
    position: sticky;
}
.topbar button {
    border: 0;
    background-color: inherit;
    color: inherit;
    gap: inherit;
    cursor: pointer;
    padding-left: 16px;
    padding-right: 16px;
}
.topbar-headline {
    color: var(--md-sys-color-on-surface);
    font-family: var(--md-sys-typescale-title-large-font-family-name);
    font-weight: var(--md-sys-typescale-title-large-font-weight);
    font-size: var(--md-sys-typescale-title-large-font-size);
    letter-spacing: var(--md-sys-typescale-title-large-letter-spacing);
    line-height: var(--md-sys-typescale-title-large-line-height);
    text-transform: capitalize;
}
</style>

