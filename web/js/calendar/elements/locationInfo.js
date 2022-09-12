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
        const textSpan = document.createElement("span");
        textSpan.classList.add("textSpan");
        wrapper.appendChild(textSpan);
        const station = this.getAttribute("metro-station");
        const line = this.getAttribute("metro-line");
        if (station) {
            const metroIconSpan = document.createElement("span");
            metroIconSpan.classList.add("metroIconSpan");
            console.log("using station", station);
            if (line) {
                const metroIcon = document.createElement("img");
                metroIcon.classList.add("metroIcon");
                metroIcon.src = metroIcons[line];
                metroIcon.title = metroIcon.alt = metroLineNames[line][1];
                metroIconSpan.insertAdjacentElement("beforeend", metroIcon);
                metroIconSpan.insertAdjacentHTML("beforeend", "&nbsp;");
                wrapper.insertAdjacentElement("afterbegin", metroIconSpan);
            }
            textSpan.insertAdjacentText("beforeend", station);
        }
        const location = this.getAttribute("location");
        if (location) {
            wrapper.href = MAP_QUERY_LINE + encodeURI(location);
            if (station) {
                textSpan.insertAdjacentText("beforeend", ", ");
            }
            textSpan.insertAdjacentText("beforeend", `${location}`);
        }
        const room = this.getAttribute("room");
        if (room) {
            if (station || location) {
                textSpan.insertAdjacentHTML("beforeend", ",&nbsp;");
            }
            const roomEl = document.createElement("b");
            roomEl.innerText = `каб. ${room}`;
            textSpan.insertAdjacentElement("beforeend", roomEl);
        }
        console.log(this.attributes);
        const style = document.createElement("style");
        style.textContent =
            "a { color: inherit;display:block} .metroIcon { height:1em; display: inline-block} .metroIconSpan { line-height: 1em; vertical-align: bottom}";
        this.shadowRoot.append(wrapper, style);
    }
}
