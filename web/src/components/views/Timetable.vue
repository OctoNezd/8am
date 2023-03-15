<template>
    <Header :title="visibleMonth">
        <button style="color: var(--md-sys-color-on-surface-variant)" @click="scrollToToday(true)">
            <mdicon name="calendar-today" sizePx="32"></mdicon>
        </button>
        <button style="color: var(--md-sys-color-on-surface-variant)">
            <mdicon name="magnify" sizePx="32"></mdicon>
        </button>
    </Header>
    <section id="tt" @scroll="visibilityChanged" ref="ttbox">
        <div
            :id="`${month}`"
            class="month"
            v-for="[month, days] of Object.entries(calItems)"
            :key="month"
            :data-monthhdr="`${dayjs.unix(month).format('MMMM YYYY')}`"
        >
            <dayStart
                v-for="[dayid, lessons] of Object.entries(days)"
                :key="dayid"
                :today="today.isSame(dayjs.unix(dayid))"
                :weekday="dayjs.unix(dayid).format('dddd')"
                :date="dayjs.unix(dayid).format('D MMMM YYYY')"
                :id="dayid"
            >
                <div v-if="lessons === 'empty'" class="no-lessons">Нет пар</div>
                <div v-else v-for="[idx, lesson] of lessons.entries()" :key="lesson.eventStart">
                    <lesson
                        :start="lesson.start"
                        :end="lesson.end"
                        :lesson="lesson.lesson"
                        :description="lesson.description"
                        :location="lesson.location"
                        :room="lesson.room"
                        :metro="lesson.metro"
                        :line="lesson.line"
                        :isoStart="lesson.isoStart"
                        :isoEnd="lesson.isoEnd"
                    />
                    <hr v-if="idx !== lessons.length - 1" />
                </div>
            </dayStart>
        </div>
    </section>
</template>
<script setup>
import dayStart from '../tt/dayStart.vue'
import lesson from '../tt/lesson.vue'
import { useRoute } from 'vue-router'
import ical from 'ical.js'
import { useSettingsStore } from '../../stores/settings'
import { ref, nextTick } from 'vue'
import 'dayjs/locale/ru'
import dayjs from 'dayjs'
import Header from '../header.vue'

const visibleMonth = ref('')
dayjs.locale('ru')
const today = ref(dayjs().startOf('day'))
const route = useRoute()
console.log(route.params)
const setStore = useSettingsStore()
const ics_path = `/${route.params.type}/${setStore.source}/${route.params.id}.ics`
const calItems = ref({})
const ttbox = ref(false)

function visibilityChanged() {
    for (const event of document.querySelectorAll('.event')) {
        const rect = event.getBoundingClientRect()

        const isInViewport =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        if (isInViewport) {
            visibleMonth.value = event.closest('.month').getAttribute('data-monthhdr')
            break
        }
    }
}

function scrollToToday(smooth) {
    const dayEl = document.getElementById(dayjs().startOf('day').unix().toString())
    const weekEl = document.getElementById(dayjs().startOf('week').unix().toString())
    const monthEl = document.getElementById(dayjs().startOf('month').unix().toString())
    let scrollArgs = {
        block: 'start'
    }
    if (smooth) {
        scrollArgs['behavior'] = 'smooth'
    }
    if (dayEl !== null) {
        console.log('scrolling to day')
        dayEl.scrollIntoView(scrollArgs)
        return
    }
    if (weekEl !== null) {
        console.log('scrolling to week')
        weekEl.scrollIntoView(scrollArgs)
        return
    }
    if (monthEl !== null) {
        console.log('scrolling to month')
        monthEl.scrollIntoView(scrollArgs)
        return
    }
    console.error('cant find where to scroll!')
}
window.scrollToToday = scrollToToday

fetch(ics_path)
    .then((res) => res.text())
    .then((icsRaw) => {
        const jcaldata = ical.parse(icsRaw)
        for (const jcal of jcaldata[2]) {
            const eventICS = new ical.Component(jcal)
            let event = { type: 'event' }
            const eventStart = dayjs(eventICS.getFirstPropertyValue('dtstart'))
            const eventEnd = dayjs(eventICS.getFirstPropertyValue('dtend'))
            const monthid = eventStart.startOf('month').unix()
            const dayid = eventStart.startOf('day').unix()
            event['start'] = eventStart.format('HH:mm')
            event['end'] = eventEnd.format('HH:mm')
            event['isoStart'] = eventStart.toISOString()
            event['isoEnd'] = eventEnd.toISOString()

            let t = [
                ['x-sharaga-room', 'room'],
                ['x-sharaga-location', 'location'],
                ['x-sharaga-metro', 'metro'],
                ['x-sharaga-metro-line', 'line'],
                ['summary', 'lesson'],
                ['description', 'description']
            ].forEach((el) => {
                const [icsid, id] = el
                event[id] = eventICS.getFirstPropertyValue(icsid)
            })
            if (calItems.value[monthid] === undefined) {
                calItems.value[monthid] = []
            }
            if (calItems.value[monthid][dayid] === undefined) {
                calItems.value[monthid][dayid] = []
            }
            calItems.value[monthid][dayid].push(event)
        }
        const thismonth = dayjs().startOf('month').unix()
        const thisday = dayjs().startOf('day').unix()
        if (calItems.value[thismonth] === undefined) {
            calItems.value[thismonth] = {}
            console.log('this month is missing, created')
        }
        console.log(calItems.value[thismonth][thisday])
        if (calItems.value[thismonth][thisday] === undefined) {
            calItems.value[thismonth][thisday] = 'empty'
            console.log('created empty today', calItems.value[thismonth])
        }
        nextTick().then(scrollToToday)
    })
</script>

<style>
#tt {
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: calc(100vh - 56px);
    padding-left: 5px;
    padding-right: 5px;
}
.no-lessons {
    text-align: center;
    font-weight: 500px;
    font-size: 24px;
    padding: 24px;
}
</style>

