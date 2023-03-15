<template>
    <section style="text-align: center" id="landing" class="background">
        <div>
            <img src="../assets/icons/main_icon.png" class="logo" />
            <h1>Добро пожаловать в Ш А Р А Г А v2.</h1>
            <h3>
                Для начала работы, выберите вашу группу в
                <RouterLink to="/settings" class="button">настройках</RouterLink>.
            </h3>
        </div>
    </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
const router = useRouter()
const settingsStore = useSettingsStore()
const { timetabletype, ttid } = storeToRefs(settingsStore)
function checkIfLandingStillNeeded() {
    if (!['', undefined, null].includes(ttid.value)) {
        console.log('landing is no longer needed - killing myself')
        router.push(`/tt/${timetabletype.value}/${ttid.value}`)
    }
}
checkIfLandingStillNeeded()
watch(ttid, (ttid) => {
    checkIfLandingStillNeeded()
})
console.log('landing opened')
</script>

<style scoped>
.logo {
    height: 60vh;
}
#landing {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
}
#landing > div {
    margin: 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100vw;
}
</style>

