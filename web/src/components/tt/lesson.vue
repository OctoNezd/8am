<template>
    <div class="event">
        <div class="endIn" v-if="endIn.length > 0">
            <div>
                Конец в: {{ end }},<br />
                через {{ endIn }}
            </div>
        </div>
        <div class="timeSpans" v-else>
            <p class="eventStart">
                {{ start }}
            </p>
            <hr />
            <p class="eventEnd">
                {{ end }}
            </p>
        </div>
        <div class="lessonInfo">
            <p class="lessonName title-medium">{{ lesson }}</p>
            <p class="teacherName">{{ description }}</p>
            <a :href="navUrl">
                <span v-if="metro">
                    <img :src="metroIcons[line]" height="14" />
                    {{ metro }},
                </span>
                {{ location
                }}<b
                    ><span v-if="room">, каб. {{ room }}</span>
                </b>
            </a>
        </div>
    </div>
</template>
<script setup>
import { useSettingsStore } from '../../stores/settings'
import { metroIcons } from '@/assets/icons/metro/moscow'
import { ref, onUnmounted, getCurrentInstance } from 'vue'
import dayjs from 'dayjs'
const settings = useSettingsStore()
const preferredMapProvider = settings.preferredMapProvider
const props = defineProps([
    'start',
    'end',
    'room',
    'location',
    'metro',
    'line',
    'lesson',
    'description',
    'isoStart',
    'isoEnd'
])
const navUrl = preferredMapProvider + encodeURI(props.location)
const instance = getCurrentInstance()
const endIn = ref('')

const startDJ = dayjs(props.isoStart)
const endDJ = dayjs(props.isoEnd)
if (startDJ.isSame(dayjs(), 'day') && dayjs().isBefore(endDJ)) {
    /**
     * Plural forms for russian words
     * @param  {Integer} count quantity for word
     * @param  {Array} words Array of words. Example: ['депутат', 'депутата', 'депутатов'], ['коментарий', 'коментария', 'комментариев']
     * @return {String}        Count + plural form for word
     */
    function pluralize(count, words) {
        var cases = [2, 0, 1, 1, 1, 2]
        return (
            count +
            ' ' +
            words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]
        )
    }
    const interval = setInterval(function () {
        const now = dayjs()

        if (now.isAfter(endDJ)) {
            stopEndIn()
            return
        }
        if (now.isAfter(startDJ)) {
            let remaining = endDJ.diff(now, 'minutes')
            let remainingStr = 'никогда'
            if (remaining === 0) {
                remaining = endDJ.diff(now, 'seconds')
                remainingStr = pluralize(remaining, ['секунду', 'секунды', 'секунд'])
            } else {
                remainingStr = pluralize(remaining, ['минуту', 'минуты', 'минут'])
            }
            endIn.value = remainingStr
            instance?.proxy?.$forceUpdate()
            console.log('updated endin', endIn)
        }
    }, 1000)
    function stopEndIn() {
        console.log(
            'destroying interval',
            endDJ.format('HH:mm DD MMMM YYYY'),
            startDJ.format('HH:mm DD MMMM YYYY'),
            endDJ.isAfter(dayjs()),
            endDJ.isBefore(dayjs())
        )
        endIn.value = ''
        clearInterval(interval)
    }
    onUnmounted(() => {
        stopEndIn()
    })
}
</script>
<style>
.event {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    text-align: left;
    padding-top: 5px;
    padding-bottom: 5px;
}
.timeSpans,
.endIn {
    text-align: center;
    width: 100px;
    min-width: 100px;
    min-height: 50px;
    padding: 5px;
    border-radius: 8px;
}
.active .timeSpans {
    display: none;
}
.active .endIn {
    display: flex;
}

.endIn {
    flex-direction: column;
    background-color: var(--md-sys-color-tertiary);
    color: var(--md-sys-color-on-tertiary);
    justify-content: center;
}

.event.active .timeSpans {
    background-color: var(--md-sys-color-secondary);
    color: var(--md-sys-color-on-secondary);
}
.event.active .timeSpans hr {
    background-color: var(--md-sys-color-on-secondary);
}
.timeSpans hr {
    border: none;
    height: 1px;
    background-color: var(--md-sys-color-on-background);
}
.lessonInfo p {
    margin: 3px;
}
.lessonInfo :last-child {
    margin-bottom: 0;
}
.timeSpans p {
    margin: 3px;
}
</style>

