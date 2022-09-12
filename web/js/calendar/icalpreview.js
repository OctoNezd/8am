import { Calendar } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
import { teacherIcon, metroIcon, circleIcon } from "/js/icons";
import showToast from "../toast";

import noCalendar from "html/calEmpty/noCalendar.html";
import noTasks from "./calEmpty/noTasks";
import calLoading from "./calEmpty/calLoading";
import calError from "./calEmpty/calError";

import * as dayjs from "dayjs";
import * as isToday from "dayjs/plugin/isToday";
import * as isBetween from "dayjs/plugin/isBetween";
import * as isoWeek from "dayjs/plugin/isoWeek";
import localforage from "localforage";
import metroLines from "/icons/metro/moscow";
console.log(metroLines);
dayjs.extend(isToday);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
let calendar;
let userRequestedUpdate = false;
const iCalMap = {
    "x-sharaga-room": "room",
    "x-sharaga-location": "location",
    "x-sharaga-metro-line": "metro-line",
    "x-sharaga-metro": "metro-station",
};
function checkEventVisiblity({ event, view }) {
    const eventStart = dayjs(event.start);
    const sameWeek =
        dayjs().endOf("isoWeek").toISOString() ===
        dayjs(event.end).endOf("isoWeek").toISOString();
    if (
        view.type == "listWeekNow" &&
        !eventStart.isToday() &&
        eventStart.isBefore(dayjs()) &&
        sameWeek
    ) {
        event.setProp("display", "none");
    } else {
        event.setProp("display", undefined);
    }
}

window.force_update_calendar = function (e) {
    if (e) e.preventDefault();
    userRequestedUpdate = true;
    console.log("Force updating calendar");
    caches.delete("ics-cache").then(() => {
        console.log("deleted cache:");
        console.log("refetch:", calendar.refetchEvents());
        calendar.render();
    });
};
let loading = false,
    loadingError = false;
const cabRE = new RegExp(/, каб. \d*/);

function boot_calendar() {
    const calendarEl = document.getElementById("icalpreview");
    calendar = new Calendar(calendarEl, {
        plugins: [iCalendarPlugin, listPlugin],
        initialView: "listWeekNow",
        contentHeight: "auto",
        headerToolbar: {
            center: "listWeekNow,listWeek,listMonth",
            right: "today prev,next",
        },
        buttonText: {
            listWeekNow: "неделя",
            listWeek: "вся неделя",
            listMonth: "месяц",
            today: "сегодня",
        },
        views: {
            listWeekNow: {
                type: "listWeek",
                buttonText: "неделя",
                duration: { weeks: 1 },
            },
        },
        locale: "ru",
        firstDay: 1,
        eventSourceSuccess: function () {
            loadingError = false;
        },
        eventSourceFailure: function (error) {
            console.log("error during load:", error);
            loadingError = error.message;
            calendar.render();
            taskErrAnim.goToAndPlay(0, true);
        },
        loading: function (isLoading) {
            loading = isLoading;
            const forceUpdButton = document.querySelector("#forceUpdateButton");
            if (forceUpdButton !== null) {
                console.log("force upd button disabled:", loading);
                forceUpdButton.disabled = loading;
            }
            if (!loading && userRequestedUpdate && !loadingError) {
                showToast("Обновлено");
                userRequestedUpdate = false;
            }
        },
        eventDidMount: checkEventVisiblity,
        eventClassNames: function ({ event }) {
            if (dayjs().isBetween(event.start, event.end)) {
                return ["presentTime"];
            }
        },
        datesSet: function ({ start, view }) {
            if (
                dayjs(start)
                    .endOf("isoWeek")
                    .isAfter(dayjs().endOf("isoWeek")) &&
                view.type === "listWeekNow"
            ) {
                console.log("flipping back to listWeek");
                calendar.changeView("listWeek");
            }
            for (const event of calendar.getEvents()) {
                checkEventVisiblity({ event, view });
            }
        },
        eventContent: function ({ event, view }) {
            console.log(event);
            if (view.type === "listWeekNow") {
                if (
                    dayjs().endOf("isoWeek").toISOString() !==
                    dayjs(event.end).endOf("isoWeek").toISOString()
                ) {
                    console.log("flipping back to listWeek");
                    calendar.changeView("listWeek");
                }
            }
            const title = document.createElement("p");
            title.classList.add("bold");
            title.innerText = event.title;
            const teacherLine = document.createElement("span");
            const teacherName = document.createElement("span");
            teacherName.innerText = event.extendedProps.description;
            teacherLine.appendChild(teacherIcon.cloneNode(true));
            teacherLine.appendChild(teacherName);
            const location = document.createElement("location-info");
            Object.entries(iCalMap).forEach((entry) => {
                const [ical, attr] = entry;
                location.setAttribute(
                    attr,
                    event.extendedProps.ical.component.getFirstPropertyValue(
                        ical
                    )
                );
            });
            return { domNodes: [title, teacherLine, location] };
        },
        noEventsContent: function ({ view }) {
            if (calendar.getEventSourceById("sharaga") === null) {
                return {
                    html: noCalendar,
                };
            }
            let finalElem = noTasks(view.type);
            if (loading) {
                finalElem = calLoading();
            }
            if (loadingError !== false) {
                finalElem = calError(loadingError);
            }
            return { domNodes: [finalElem] };
        },
    });
    calendar.render();
    window.calendar = calendar;
    console.log("Calendar rendered");
}
export default async function setup_calendar_preview(gid) {
    const current_es = calendar.getEventSourceById("sharaga");
    if (current_es !== null) {
        current_es.remove();
    }
    if (gid !== undefined) {
        calendar.addEventSource({
            id: "sharaga",
            url: `${location.protocol}//${
                location.host
            }/group/${gid}.ics?sv=${await localforage.getItem(
                "serverVersion"
            )}`,
            format: "ics",
        });
    }
    calendar.render();
}

export { boot_calendar };
