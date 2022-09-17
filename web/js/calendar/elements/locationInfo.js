import { metroIcons, metroLineNames } from "/icons/metro/moscow";
console.log(metroIcons);
const MAP_QUERY_LINE = "http://maps.apple.com/?q=";
export default class LocationLine extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        // write element functionality in here
        // Create a shadow root
        this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
    }
    static get observedAttributes() {
        return ["metro-station", "metro-line", "location", "room"];
    }
    connectedCallback() {
        this.shadowRoot.innerHTML = "";
        const wrapper = document.createElement("a");
        wrapper.target = "sharaga-location";
        wrapper.innerHTML = "";
        const textSpan = document.createElement("span");
        textSpan.classList.add("textSpan");
        wrapper.appendChild(textSpan);
        const station = this.getAttribute("metro-station");
        const line = this.getAttribute("metro-line");
        if (station) {
            const metroIconSpan = document.createElement("span");
            metroIconSpan.classList.add("metroIconSpan");
            console.debug("using station", station);
            if (line) {
                const metroIcon = document.createElement("img");
                metroIcon.classList.add("metroIcon");
                if (metroIcons[line] !== undefined) {
                    metroIcon.src = metroIcons[line];
                    metroIcon.title = metroIcon.alt = metroLineNames[line][1];
                }
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
        const style = document.createElement("style");
        style.textContent =
            "a { color: inherit;display:block; text-decoration: none} a :not(.metroIconSpan) { text-decoration: underline } .metroIcon { height:1em; display: inline-block} .metroIconSpan { line-height: 1em; vertical-align: bottom}";
        this.shadowRoot.append(wrapper, style);
    }
}
