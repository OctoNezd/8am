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
// import Swiper JS
import Swiper from "swiper";
// import Swiper styles
import SwiperCSS from "swiper/css";

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
import { isPwa } from "../../pwa_add";
const purge_classes = ["hasEvents", "thisWeek", "noEvents"];
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
    today = true;
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
        if (isPwa) {
            this.calendarRoot.classList.add("pwa");
        }
        console.log("Copying parent css...");
        document.querySelectorAll("style").forEach((style) => {
            this.shadowRoot.appendChild(style.cloneNode(true));
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
        this.calendarBody.innerHTML = baseCalendarHTML;
        this.calendarRoot.append(...controls, this.calendarBody);
        calendarCss.use({ target: this.shadowRoot });
        console.log(SwiperCSS);
        SwiperCSS.use({ target: this.shadowRoot });

        console.log("Loading src...");
        this.updateRangeText();
        this.loadSrc();
        setInterval(() => this.updateEventTimeRemaining(), 1000);
    }

    checkForEmptyTT() {
        if (
            this.currentView === "isoWeek" &&
            this.start.isSame(dayjs().startOf("isoWeek")) &&
            this.today
        ) {
            const nowContainer = this.shadowRoot.getElementById("days1");
            nowContainer.parentElement.classList.add("thisWeek");
            if (nowContainer.querySelectorAll(".day:not(.past)").length === 0) {
                console.log("All days are hidden!");
                nowContainer.classList.add("noEvents");
                nowContainer.appendChild(noTasks("thisIsoWeek"));
            }
        }
        this.shadowRoot
            .querySelectorAll(".daysContainer")
            .forEach((container) => {
                if (container.querySelectorAll(".day").length === 0) {
                    console.log(container, "is empty");
                    container.classList.add("noEvents");
                    container.appendChild(noTasks(this.currentView));
                }
            });
    }

    updateTt() {
        const ics = ICAL.parse(this.ics);
        const timetable = ics[2];
        this.calendarRoot.classList.remove("hasEvents");
        this.calendarRoot.classList.remove("noEvents");
        this.calendarRoot.classList.remove("pastVisible");
        let ranges = [
            [
                this.generateModifiedRange(-1),
                this.generateModifiedRange(-1).endOf(this.currentView),
            ],
            [this.start, this.end],
            [
                this.generateModifiedRange(1),
                this.generateModifiedRange(1).endOf(this.currentView),
            ],
        ];
        console.log("Ranges:", ranges);
        const rangeStart = ranges[0][0];
        const rangeEnd = ranges[2][1];
        for (const idx of Array(3).keys()) {
            const el = this.shadowRoot.getElementById("days" + idx);
            el.innerHTML = "";
        }
        console.log("Start:", rangeStart, "end:", rangeEnd);
        for (const jcal of timetable) {
            const event = new ICAL.Component(jcal);
            const eventStart = dayjs(event.getFirstPropertyValue("dtstart"));
            if (!eventStart.isBetween(rangeStart, rangeEnd)) {
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
                for (const [rangeidx, range] of ranges.entries()) {
                    if (eventStart.isBetween(...range)) {
                        this.shadowRoot
                            .getElementById(`days${rangeidx}`)
                            .append(day);
                    }
                }
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
        for (const idx of Array(3).keys()) {
            console.log("sorting days", idx);
            const container = this.shadowRoot.getElementById("days" + idx);
            sortElements(container);
            container.classList.remove(...purge_classes);
            container.parentElement.classList.remove(...purge_classes);
        }
        this.shadowRoot.querySelectorAll(".dayEvents").forEach((dayEl) => {
            sortElements(dayEl);
        });
        this.updateEventTimeRemaining();
        this.calendarError.innerHTML = "";
        this.checkForEmptyTT();
        this.today = false;
    }
    loadSrc(showUpdateNotice) {
        const source = this.getAttribute("src");
        if (source === null) {
            console.log(
                "No source set or invalid source set - setting calEmpty/noCalendar"
            );
            this.calendarError.innerHTML = noCalendarHTML;
            return;
        }
        console.log("Loading source", source);
        this.calendarError.innerHTML = "";
        this.calendarError.appendChild(calLoading());
        this.calendarBody.style.display = "none";
        fetch(source)
            .then(async (resp) => {
                if (!resp.ok) {
                    throw new Error(`Сервер вернул ${resp.status}`);
                }
                this.ics = await resp.text();
                this.updateTt();
                this.calendarBody.style.display = "";
                if (showUpdateNotice) {
                    showToast("Расписание обновлено!", 1000, { width: "80vw" });
                }
            })
            .catch((e) => {
                console.error("Got error!", e);
                this.calendarBody.style.display = "none";
                this.calendarError.innerHTML = "";
                this.calendarError.appendChild(calError(e));
            });
    }
    updateRangeText() {
        this.shadowRoot.querySelectorAll(".changeView").forEach((element) => {
            console.log(
                element,
                this.currentView,
                element.getAttribute("data-view")
            );
            if (element.getAttribute("data-view") === this.currentView) {
                element.classList.add("active");
            } else {
                element.classList.remove("active");
            }
        });
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
    generateModifiedRange(amount) {
        let spanToAdd = this.currentView;
        if (spanToAdd === "isoWeek") {
            spanToAdd = "week";
        }
        return this.start.add(amount, spanToAdd);
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
            this.start = this.generateModifiedRange(amount);
            console.log("New start:", this.start);
            this.updateRangeText();
            this.updateTt();
            swiper.slideTo(1, 0);
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
            swiper.slideTo(1, 0);
        };
        this.shadowRoot.querySelectorAll(".changeView").forEach((element) => {
            element.onclick = () =>
                changeView(element.getAttribute("data-view"));
        });
        this.shadowRoot.getElementById("goToday").onclick = () => {
            this.today = true;
            this.currentView = "isoWeek";
            this.start = dayjs().startOf("week");
            this.updateRangeText();
            this.updateTt();
        };
        this.shadowRoot.getElementById("refresh").onclick = () =>
            this.loadSrc(true);
        this.swiper = new Swiper(this.shadowRoot.querySelector(".swiper"), {
            // Optional parameters
            direction: "horizontal",
            initialSlide: 1,
        });
        window.swiper = this.swiper;
        swiper.on("slideChangeTransitionEnd", (e) => {
            console.log("slide changed", swiper.activeIndex);
            const rangeMod = -1 + swiper.activeIndex;
            console.log("SWIPE:changing range by", rangeMod);
            changeRange(rangeMod);
            const days1 = this.shadowRoot.getElementById("days1");
            days1.scrollTo(0, 0);
        });
        console.log("initialized swiper");
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
