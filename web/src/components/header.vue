<template>
    <header class="topbar surface">
        <button @click="searchActive = false" class="topbar-lnav" v-if="searchActive">
            <mdicon name="arrow-left" />
        </button>
        <p class="topbar-headline" v-if="!searchActive">{{ title }}</p>
        <div style="flex-grow: 1" v-if="!searchActive" />
        <input
            type="text"
            v-else
            v-model="searchQuery"
            class="topbar-search"
            :placeholder="searchPlaceholder"
            ref="searchBox"
            @input="emit('searchQueryChanged', searchQuery)"
        />
        <slot v-if="!searchActive" />
        <button
            style="color: var(--md-sys-color-on-surface-variant)"
            v-if="!searchActive && searchable"
        >
            <mdicon name="magnify" @click="searchActive = true"></mdicon>
        </button>
        <button v-else-if="searchActive">
            <mdicon name="close" @click="closeSearch" />
        </button>
    </header>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'
import { useWebAppStore } from '../stores/settings'
import { storeToRefs } from 'pinia'
const emit = defineEmits(['searchQueryChanged', 'searchClosed', 'toggleSidebar'])
const props = defineProps({ title: String, searchable: Boolean, searchPlaceholder: String })
const searchQuery = ref('')
const searchBox = ref(null)
const searchActive = ref(false)
watch(searchActive, (val) => {
    searchQuery.value = ''
    if (val) {
        nextTick(() => {
            searchBox.value.focus()
        })
    } else {
        emit('searchClosed')
    }
})
function closeSearch() {
    searchActive.value = false
    searchQuery.value = ''
    emit('searchQueryChanged', '')
    emit('searchClosed')
}
</script>

<style>
.topbar {
    width: 100%;
    height: 56px;
    display: flex;
    flex-direction: row;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    align-items: center;
    font-size: 20pt;
    padding-top: env(safe-area-inset-top);
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 98;
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
.topbar-search {
    flex-grow: 1;
    min-height: 100%;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    font-family: var(--md-sys-typescale-body-large-font-family-name);
    font-weight: var(--md-sys-typescale-body-large-font-weight);
    font-size: var(--md-sys-typescale-body-large-font-size);
    letter-spacing: var(--md-sys-typescale-body-large-letter-spacing);
    line-height: var(--md-sys-typescale-body-large-line-height);
    border: 0;
}
.topbar-search:focus {
    border: 0;
    outline: none;
}
.topbar-search::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}
.topbar p:first-child {
    padding-left: 16px;
}
</style>
