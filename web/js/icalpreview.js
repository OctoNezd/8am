import { Calendar } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
import { teacherIcon, metroIcon, circleIcon } from "./icons";
import showToast from "./toast";

import noCalendar from "html/calEmpty/noCalendar.html";
import noTasks from "./calEmpty/noTasks.js";
import calLoading from "./calEmpty/calLoading.js";
import calError from "./calEmpty/calError.js";

import { loadAnimation } from "lottie-web";
import * as calLoadingAnimation from "/lottie/cal_load.json";
import * as errorAnimation from "/lottie/error.json";
import * as dayjs from "dayjs";
import * as isToday from "dayjs/plugin/isToday";
import * as isBetween from "dayjs/plugin/isBetween";
import * as isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isToday);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
let calendar;
let userRequestedUpdate = false;
const metro_color_map = {
    "🟤": "brown",
    "🟣": "purple",
    "🟠": "orange",
    "🟢": "green",
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
            console.log("endof isoweek:", dayjs(start).endOf("isoWeek"));
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
            const location = document.createElement("a");
            const locationText = document.createElement("span");

            location.classList.add("link");
            location.classList.add("location_link");

            const metroContainer = document.createElement("span");
            metroContainer.classList.add("fa-layers", "fa-fw");
            location.appendChild(metroContainer);
            location.appendChild(locationText);

            const metro = metroIcon.cloneNode(true);
            const metroCircle = circleIcon.cloneNode(true);
            metro.attributes["data-fa-transform"] = "shrink-8";
            metroContainer.append(metroCircle, metro);
            const emojiMetroStation = event.extendedProps.location.slice(
                undefined,
                2
            );
            metroCircle.style.color = metro_color_map[emojiMetroStation];

            locationText.innerText += event.extendedProps.location.slice(2);
            const cab = locationText.innerText.match(cabRE)[0];

            locationText.innerText = locationText.innerText.replace(cabRE, "");
            location.target = "sharaga_location";
            location.href =
                "https://maps.yandex.ru/?text=" +
                encodeURI(location.innerText.split(", ").slice(1).join(", "));
            const cabTag = document.createElement("b");
            cabTag.innerText = cab;
            location.insertAdjacentElement("beforeend", cabTag);
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
            console.log("final element:", finalElem);
            return { domNodes: [finalElem] };
        },
    });
    calendar.render();
    window.calendar = calendar;
    console.log("Calendar rendered");
}
export default function setup_calendar_preview(gid) {
    const current_es = calendar.getEventSourceById("sharaga");
    if (current_es !== null) {
        current_es.remove();
    }
    if (gid !== undefined) {
        calendar.addEventSource({
            id: "sharaga",
            url: `${location.protocol}//${location.host}/group/${gid}.ics`,
            format: "ics",
        });
    }
    calendar.render();
}

export { boot_calendar };
