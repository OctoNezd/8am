import { Calendar } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
import { teacherIcon, metroIcon, circleIcon } from "./icons";
import noCalendar from "html/no_cal.html";
let calendar;
const metro_color_map = {
    "🟤": "brown",
    "🟣": "purple",
    "🟠": "orange",
    "🟢": "green",
};
const cabRE = new RegExp(/, каб. \d*/);
function boot_calendar() {
    const calendarEl = document.getElementById("icalpreview");
    calendar = new Calendar(calendarEl, {
        plugins: [iCalendarPlugin, listPlugin],
        initialView: "listWeek",
        contentHeight: "auto",
        headerToolbar: { end: "listWeek,listMonth today prev,next" },
        buttonText: {
            listWeek: "неделя",
            listMonth: "месяц",
            today: "сегодня",
        },
        locale: "ru",
        firstDay: 1,
        eventContent: function ({ event }) {
            console.log("setting event contents", event);
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
            console.log(
                "metro:",
                emojiMetroStation,
                "color:",
                metro_color_map[emojiMetroStation]
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
        noEventsContent: function (e) {
            console.log("no events:", e);
            if (calendar.getEventSourceById("sharaga") === null) {
                return {
                    html: noCalendar,
                };
            }
            return "Нет занятий.";
        },
    });
    calendar.render();
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
