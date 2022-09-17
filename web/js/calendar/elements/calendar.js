import controlsHtml from "./html/controls.html";
import dayHTML from "./html/day.html";
import eventHTML from "./html/event.html";
import noCalendarHTML from "./html/calEmpty/noCalendar.html";
import baseCalendarHTML from "./html/baseCal.html";

import locationInfo from "./locationInfo";

import calError from "./calEmpty/calError";
import calLoading from "./calEmpty/calLoading";

import calendarCss from "./css/calendar.css";

import * as dayjs from "dayjs";
import * as isToday from "dayjs/plugin/isToday";
import * as isBetween from "dayjs/plugin/isBetween";
import * as isoWeek from "dayjs/plugin/isoWeek";
import * as relativeTime from "dayjs/plugin/relativeTime";

import "dayjs/locale/ru";
dayjs.extend(isToday);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.locale("ru");

import ICAL from "ical.js";

import { pluralize } from "/js/misc.js";
import noTasks from "./calEmpty/noTasks";
import showToast from "../../toast";

function sortElements(element) {
    [...element.children]
        .sort((a, b) =>
            parseInt(a.id.replace("ts", "").split("-")[0]) >
            parseInt(b.id.replace("ts", "").split("-")[0])
                ? 1
                : -1
        )
        .forEach((node) => element.appendChild(node));
}

function loadHtmlElements(html) {
    // there probably is a better way of doing this
    const elemparent = document.createElement("div");
    elemparent.innerHTML = html;
    return elemparent.children;
}
const rangeFormat = "D MMM YYYY";
const locationMap = {
    "x-sharaga-metro": "metro-station",
    "x-sharaga-metro-line": "metro-line",
    "x-sharaga-location": "location",
    "x-sharaga-room": "room",
};
export default class SharagaCalendar extends HTMLElement {
    start = dayjs().startOf("isoWeek");
    currentView = "isoWeek";
    ics = "";
    get end() {
        return this.start.endOf(this.currentView);
    }

    static get observedAttributes() {
        return ["src"];
    }
    constructor() {
        // Always call super first in constructor
        super();
        // write element functionality in here
        // Create a shadow root
        this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
        console.log("Booting the calendar...", this.attributes);
        this.calendarRoot = document.createElement("div");
        this.calendarRoot.id = "calendar";
        console.log("Copying parent css...");
        document.querySelectorAll("style").forEach((style) => {
            this.calendarRoot.appendChild(style.cloneNode(true));
        });
        this.shadowRoot.appendChild(this.calendarRoot);

        console.log("Creating controls");
        const controls = loadHtmlElements(controlsHtml);
        this.calendarRoot.append(...controls);

        console.log("Creating calendar body");
        this.calendarError = document.createElement("div");
        this.calendarRoot.appendChild(this.calendarError);
        this.calendarBody = document.createElement("div");
        this.calendarBody.id = "calendarBody";
        this.calendarRoot.append(...controls, this.calendarBody);
        calendarCss.use({ target: this.shadowRoot });

        console.log("Loading src...");
        this.updateRangeText();
        this.loadSrc();
        setInterval(() => this.updateEventTimeRemaining(), 1000);
    }

    checkForEmptyTT() {
        if (
            this.currentView === "isoWeek" &&
            this.start.isSame(dayjs().startOf("isoWeek"))
        ) {
            this.calendarRoot.classList.add("thisWeek");
            if (
                this.calendarRoot.classList.contains("hasEvents") &&
                this.calendarRoot.querySelectorAll(".day:not(.past)").length ===
                    0
            ) {
                console.log("All days are hidden!");
                this.calendarRoot.classList.add("noEvents");
                this.calendarError.appendChild(noTasks("thisIsoWeek"));
            }
        } else {
            this.calendarRoot.classList.remove("thisWeek");
            if (this.calendarRoot.querySelectorAll(".day").length === 0) {
                this.calendarRoot.classList.add("noEvents");
                this.calendarError.appendChild(noTasks(this.currentView));
            }
        }
    }

    updateTt() {
        const ics = ICAL.parse(this.ics);
        const timetable = ics[2];
        this.calendarBody.innerHTML = baseCalendarHTML;
        this.calendarRoot.classList.remove("hasEvents");
        this.calendarRoot.classList.remove("noEvents");
        this.calendarRoot.classList.remove("pastVisible");
        for (const jcal of timetable) {
            const event = new ICAL.Component(jcal);
            const eventStart = dayjs(event.getFirstPropertyValue("dtstart"));
            if (!eventStart.isBetween(this.start, this.end)) {
                continue;
            }
            this.calendarRoot.classList.add("hasEvents");
            console.debug("ical event:", event);
            const eventEnd = dayjs(event.getFirstPropertyValue("dtend"));
            const dayid = "ts" + eventStart.startOf("day").unix();
            var day = this.calendarBody.querySelector(`#${dayid}`);
            if (day === null) {
                var day = loadHtmlElements(dayHTML)[0];
                day.id = dayid;
                this.shadowRoot.getElementById("days").append(day);
                day.querySelector(".weekDay").innerText =
                    eventStart.format("dddd");
                day.querySelector(".calendarDay").innerText =
                    eventStart.format("D MMMM YYYY");
                if (eventStart.isToday()) {
                    day.classList.add("today");
                }
                const endofday = eventStart.endOf("day");
                if (endofday.isBefore(dayjs())) {
                    day.classList.add("past");
                }
            }
            const dayEvents = day.querySelector(".dayEvents");
            const eventEl = loadHtmlElements(eventHTML)[0];
            eventEl.id = "ts" + eventStart.unix() + "-" + eventEnd.unix();
            eventEl.querySelector(".lessonName").innerText =
                event.getFirstPropertyValue("summary");
            eventEl.querySelector(".eventStart").innerText =
                eventStart.format("HH:mm");
            eventEl
                .querySelectorAll(".eventEnd")
                .forEach((elem) => (elem.innerText = eventEnd.format("HH:mm")));
            eventEl.querySelector(".teacherName").innerText =
                event.getFirstPropertyValue("description");
            const locationEl = eventEl.querySelector("location-info");
            Object.entries(locationMap).forEach(([icalTag, attr]) => {
                locationEl.setAttribute(
                    attr,
                    event.getFirstPropertyValue(icalTag)
                );
            });
            dayEvents.appendChild(eventEl);
        }
        sortElements(this.shadowRoot.getElementById("days"));
        this.shadowRoot.querySelectorAll(".dayEvents").forEach((dayEl) => {
            sortElements(dayEl);
        });
        this.updateEventTimeRemaining();
        this.calendarError.innerHTML = "";
        this.checkForEmptyTT();
    }
    loadSrc(showUpdateNotice) {
        const source = this.getAttribute("src");
        if (source === null) {
            console.log(
                "No source set or invalid source set - setting calEmpty/noCalendar"
            );
            this.calendarBody.innerHTML = noCalendarHTML;
            return;
        }
        console.log("Loading source", source);
        this.calendarError.innerHTML = "";
        this.calendarError.appendChild(calLoading());
        fetch(source)
            .then(async (resp) => {
                if (!resp.ok) {
                    throw new Error(`Сервер вернул ${resp.status}`);
                }
                this.ics = await resp.text();
                this.updateTt();
                if (showUpdateNotice) {
                    showToast("Расписание обновлено!", 1000, { width: "80vw" });
                }
            })
            .catch((e) => {
                console.error("Got error!", e);
                this.calendarBody.innerHTML = "";
                this.calendarError.innerHTML = "";
                this.calendarError.appendChild(calError(e));
            });
    }
    updateRangeText() {
        let crange = document.getElementById("currentDate");
        if (crange === null) {
            console.log(
                "current date not available, using currentRange",
                document
            );
            crange = this.shadowRoot.getElementById("calendarRange");
        }

        if (this.currentView === "month") {
            crange.innerText = this.start.format("MMMM YYYY");
            return;
        }
        crange.innerText = `${this.start.format(
            rangeFormat
        )} - ${this.end.format(rangeFormat)}`;
        this.shadowRoot.querySelectorAll(".changeView").forEach((element) => {
            if (element.getAttribute("data-view") === this.currentView) {
                element.classList.add("active");
            } else {
                element.classList.remove("active");
            }
        });
    }
    updateEventTimeRemaining() {
        const eventItems =
            this.calendarRoot.querySelectorAll(".day.today .event");
        const now = dayjs();
        eventItems.forEach((elem) => {
            const [eventStartTS, eventEndTS] = elem.id
                .replace("ts", "")
                .split("-");
            const eventStart = dayjs.unix(eventStartTS);
            const eventEnd = dayjs.unix(eventEndTS);
            const isbetween = now.isBetween(eventStart, eventEnd);
            if (isbetween) {
                elem.classList.add("active");
            }
            if (elem.classList.contains("active")) {
                console.debug(eventStart, eventEnd);
                if (!isbetween) {
                    elem.classList.remove("active");
                } else {
                    let remaining = eventEnd.diff(now, "minutes");
                    let remainingStr = "никогда";
                    if (remaining === 0) {
                        remaining = eventEnd.diff(now, "seconds");
                        remainingStr = pluralize(remaining, [
                            "секунду",
                            "секунды",
                            "секунд",
                        ]);
                    } else {
                        remainingStr = pluralize(remaining, [
                            "минуту",
                            "минуты",
                            "минут",
                        ]);
                    }
                    elem.querySelector(".timeRemaining").innerText =
                        remainingStr;
                }
            }
        });
    }
    connectedCallback() {
        console.log("Mapping controls");
        this.shadowRoot.querySelectorAll(".pastToggle").forEach((element) => {
            element.onclick = () => {
                this.calendarRoot.classList.toggle("pastVisible");
                this.calendarRoot.classList.remove("noEvents");
            };
        });
        const changeRange = (amount) => {
            let spanToAdd = this.currentView;
            if (spanToAdd === "isoWeek") {
                spanToAdd = "week";
            }
            this.start = this.start.add(amount, spanToAdd);
            this.updateRangeText();
            this.updateTt();
        };
        this.shadowRoot.querySelector("#nextRange").onclick = () => {
            changeRange(1);
        };
        this.shadowRoot.querySelector("#previousRange").onclick = () => {
            changeRange(-1);
        };
        const changeView = (newView) => {
            this.currentView = newView;
            this.start = this.start.startOf(newView);
            console.log(
                "changing view to",
                this.currentView,
                "new start:",
                this.start,
                "new end:",
                this.end
            );
            this.updateRangeText();
            this.updateTt();
        };
        this.shadowRoot.querySelectorAll(".changeView").forEach((element) => {
            element.onclick = () =>
                changeView(element.getAttribute("data-view"));
        });
        this.shadowRoot.getElementById("goToday").onclick = () => {
            this.currentView = "isoWeek";
            this.start = dayjs().startOf("week");
            this.updateRangeText();
            this.updateTt();
        };
        this.shadowRoot.getElementById("refresh").onclick = () =>
            this.loadSrc(true);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log("attribute changed", name, oldValue, newValue);
        if (name == "src") {
            this.loadSrc();
        }
    }
}
customElements.define("location-info", locationInfo);
customElements.define("sharaga-calendar", SharagaCalendar);
