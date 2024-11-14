<template>
    <Header :title="visibleMonth" searchable search-placeholder="Поиск пар..." @search-query-changed="sfilter = $event"
        @search-closed="sfilter = ''">
        <button style="color: var(--md-sys-color-on-surface-variant)" @click="scrollToToday(true)">
            <mdicon name="calendar-today" sizePx="32"></mdicon>
        </button>
    </Header>
    <section id="tt" @scroll="visibilityChanged" ref="ttbox">
        <div :id="`${month}`" class="month" v-for="[month, days] of Object.entries(calItemsFiltered)" :key="month"
            :data-monthhdr="`${dayjs.unix(month).format('MMMM YYYY')}`">
            <dayStart v-for="[dayid, lessons] of Object.entries(days)" :key="dayid"
                :today="today.isSame(dayjs.unix(dayid))" :weekday="dayjs.unix(dayid).format('dddd')"
                :date="dayjs.unix(dayid).format('D MMMM YYYY')" :id="dayid">
                <div v-if="lessons === 'empty'" class="no-lessons">Нет пар</div>
                <div v-else>
                    <event v-for="lesson of lessons" :start="lesson.start" :end="lesson.end" :lesson="lesson.lesson"
                        :description="lesson.description" :location="lesson.location" :room="lesson.room"
                        :metro="lesson.metro" :line="lesson.line" :isoStart="lesson.isoStart" :isoEnd="lesson.isoEnd"
                        :key="lesson.eventStart" />
                </div>
            </dayStart>
        </div>
    </section>
</template>
<script setup>
import dayStart from '../tt/dayStart.vue'
import event from '../tt/lesson.vue'
import { useRoute } from 'vue-router'
import ical from 'ical.js'
import { useWebAppStore } from '../../stores/settings'
import { ref, nextTick, computed } from 'vue'
import 'dayjs/locale/ru'
import dayjs from 'dayjs'
import Header from '../header.vue'
import axios from 'axios'

const visibleMonth = ref('')
dayjs.locale('ru')
const today = ref(dayjs().startOf('day'))
const route = useRoute()
const props = defineProps(['type', 'id'])
console.log(route.params)
const setStore = useWebAppStore()
const params = { ...props, ...route.params }
const ics_path = `/${params.type}/${setStore.source}/${params.id}.ics`
const calItems = ref({})
const ttbox = ref(false)

const sfilter = ref('')
const calItemsFiltered = computed(() => {
    let new_citems = {}
    for (const [month, days] of Object.entries(calItems.value)) {
        const filtered_month = {}
        for (const [day, lessons] of Object.entries(days)) {
            let filtered_day = []
            if (lessons === 'empty') {
                filtered_month[day] = 'empty'
                continue
            }
            for (const lesson of lessons) {
                if (lesson.lesson.toLowerCase().includes(sfilter.value.toLowerCase())) {
                    filtered_day.push(lesson)
                }
            }
            if (filtered_day.length > 0) {
                filtered_day = filtered_day.sort(
                    (a, b) => dayjs(a.isoEnd).unix() - dayjs(b.isoStart).unix()
                )
                console.log('filtered_day', filtered_day)
                filtered_month[day] = filtered_day
            }
        }
        if (Object.keys(filtered_month).length > 0) {
            new_citems[month] = filtered_month
        }
    }
    return new_citems
})
console.log(route.query)
function visibilityChanged() {
    let displayMonth = ''

    for (const event of document.querySelectorAll('.event')) {
        const rect = event.getBoundingClientRect()

        const isInViewport =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        if (isInViewport) {
            displayMonth = event.closest('.month').getAttribute('data-monthhdr')
            break
        }
    }
    if (displayMonth.length === 0) {
        // fallback to this month
        displayMonth = dayjs().format('MMMM YYYY')
    }
    if (route.query.headerPrefix !== undefined) {
        displayMonth = route.query.headerPrefix + ' - ' + displayMonth
    }
    visibleMonth.value = displayMonth
}
visibilityChanged()
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
let icsData = ''
axios.get(ics_path, { responseType: 'text' }).then((res) => {
    icsData = res.data
    updateTt('')
    nextTick().then(scrollToToday)
})
function updateTt(search) {
    const jcaldata = ical.parse(icsData)
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
            ['x-8am-room', 'room'],
            ['x-8am-location', 'location'],
            ['x-8am-metro', 'metro'],
            ['x-8am-metro-line', 'line'],
            ['summary', 'lesson'],
            ['x-8am-teacher', 'description']
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
}
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

.event {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    text-align: left;
    padding-top: 5px;
    padding-bottom: 5px;
    border-top: 1px solid var(--md-sys-color-outline);
}

.event:first-child {
    border-top: none;
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
