import { Calendar } from "@fullcalendar/core";
import listPlugin from "@fullcalendar/list";
import iCalendarPlugin from "@fullcalendar/icalendar";
export default function setup_calendar_preview(gid) {
    var calendarEl = document.getElementById("icalpreview");
    var calendar = new Calendar(calendarEl, {
        plugins: [iCalendarPlugin, listPlugin],
        events: {
            url: `${location.protocol}//${location.host}/group/${gid}.ics`,
            format: "ics",
        },
        initialView: "listWeek",
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

    calendar.render();
}
