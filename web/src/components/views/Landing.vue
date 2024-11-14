<template>
    <section style="text-align: center" id="landing" class="background" v-if="displayLanding">
        <div>
            <img src="@/assets/icons/main_icon.png" height="300" class="logo" />
            <h1>Добро пожаловать в 8AM.</h1>
            <h3>
                <p>Для начала работы, выберите ваше учебное заведение и группу в настройках.</p>
                <RouterLink to="/settings">
                    <md-filled-button>
                        <mdicon slot="icon" viewBox="0 0 24 24" name="cog" :width="24" :height="24" />
                        Перейти в настройки
                    </md-filled-button>
                </RouterLink>
            </h3>
        </div>
    </section>
    <section v-else>
        <Timetable :type="timetabletype" :id="ttid" />
    </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { watch, ref } from 'vue'
import Timetable from './Timetable.vue'
import { useWebAppStore } from '@/stores/settings'
import '@material/web/button/filled-button.js'
const settingsStore = useWebAppStore()
const { timetabletype, ttid } = storeToRefs(settingsStore)
const displayLanding = ref(true)
function checkIfLandingStillNeeded() {
    if (!['', undefined, null].includes(ttid.value)) {
        console.log('landing is not needed')
        displayLanding.value = false
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
    height: 40vh;
}

#landing {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
}

#landing>div {
    margin: 0;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100vw;
}
</style>
