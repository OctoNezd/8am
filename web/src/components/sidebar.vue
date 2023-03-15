<template>
    <div id="sidebar" @click="shouldClose">
        <div id="sidebar-main" class="surface on-secondary-container">
            <p class="sidebar-headline">Ш А Р А Г А</p>
            <SidebarItem text="Моё расписание" icon="account-star" to="/" />
            <SidebarItem text="Другая группа" icon="account-group" to="/othergroup" />
            <SidebarItem text="Расписание преподов" icon="human-male-board" to="/teachers" />
            <hr />
            <SidebarItem text="Настройки" icon="cog" to="/settings" />
        </div>
    </div>
</template>
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './sidebar-item.vue'
const route = useRoute()
const emit = defineEmits(['close'])
watch(route, () => emit('close'))
function shouldClose(e) {
    console.log(e)
    if (e.target.id === 'sidebar') {
        emit('close')
    }
}
</script>

<style>
#sidebar {
    background-color: rgba(0, 0, 0, 0.3);
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    z-index: 999;
}
:root {
    --sidebar-size: 360px;
}
#sidebar-main {
    width: var(--sidebar-size);
    height: 100vw;
    overflow: auto;
    animation: sidebarslide 0.5s forwards;
}
.sidebar-headline {
    padding-left: 28px;
    font-family: var(--md-sys-typescale-title-medium-font-family-name);
    line-height: var(--md-sys-typescale-title-medium-line-height);
    font-size: var(--md-sys-typescale-title-medium-font-size);
    font-weight: var(--md-sys-typescale-title-medium-font-weight);
}
#sidebar hr {
    margin-left: 28px;
    margin-right: 28px;
}
#sidebar * {
    text-decoration: none;
}
@keyframes sidebarslide {
    0% {
        transform: translateX(-900px);
    }
    100% {
        transform: translateX(0);
    }
}
</style>

