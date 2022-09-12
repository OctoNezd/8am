import { metroIcons, metroLineNames } from "/icons/metro/moscow";
console.log(metroIcons);
const MAP_QUERY_LINE = "https://maps.yandex.ru/?text=";
let wrapper;
export default class LocationLine extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        // write element functionality in here
        // Create a shadow root
        this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
    }
    connectedCallback() {
        console.log("connectedCallback");
        const wrapper = document.createElement("a");
        console.log("Update location info", this.attributes, wrapper);
        wrapper.innerHTML = "";
        const station = this.getAttribute("metro-station");
        const line = this.getAttribute("metro-line");
        if (station) {
            console.log("using station", station);
            if (line) {
                const metroIcon = document.createElement("img");
                metroIcon.classList.add("metroIcon");
                metroIcon.src = metroIcons[line];
                metroIcon.title = metroIcon.alt = metroLineNames[line][1];
                wrapper.insertAdjacentElement("beforeend", metroIcon);
            }
            wrapper.insertAdjacentText("beforeend", station);
        }
        const location = this.getAttribute("location");
        if (location) {
            wrapper.href = MAP_QUERY_LINE + encodeURI(location);
            if (station) {
                wrapper.insertAdjacentText("beforeend", ", ");
            }
            wrapper.insertAdjacentText("beforeend", `${location}`);
        }
        const room = this.getAttribute("room");
        if (room) {
            if (station || location) {
                wrapper.insertAdjacentHTML("beforeend", ",&nbsp;");
            }
            const roomEl = document.createElement("b");
            roomEl.innerText = `каб. ${room}`;
            wrapper.insertAdjacentElement("beforeend", roomEl);
        }
        console.log(this.attributes);
        const style = document.createElement("style");
        style.textContent =
            "a { display: flex; flex-direction: row; align-items: center; color: inherit} .metroIcon {height: 1em; margin-right: 3px}";
        this.shadowRoot.append(wrapper, style);
    }
}
