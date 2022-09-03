import { Calendar } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
let calendar;
export default function setup_calendar_preview(gid) {
    const calendarEl = document.getElementById("icalpreview");
    if (calendar === undefined) {
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
                var title = document.createElement("p");
                title.classList.add("bold");
                title.innerText = event.title;
                var teacher = document.createElement("p");
                teacher.innerText = "👩‍🏫" + event.extendedProps.description;
                var location = document.createElement("p");
                location.innerText = "📌" + event.extendedProps.location;
                return { domNodes: [title, teacher, location] };
            },
        });
        calendar.addEventSource({
            id: "sharaga",
            url: `${location.protocol}//${location.host}/group/${0}.ics`,
            format: "ics",
        });
    }
    calendar.getEventSourceById("sharaga").remove();
    calendar.addEventSource({
        id: "sharaga",
        url: `${location.protocol}//${location.host}/group/${gid}.ics`,
        format: "ics",
    });
    calendar.render();
}
