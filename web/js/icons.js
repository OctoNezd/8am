import {
    mdiCog,
    mdiArrowLeftTop,
    mdiArrowRightTop,
    mdiCalendarToday,
    mdiRefresh,
} from "@mdi/js";
const kebabCase = (string) =>
    string
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
function createSvgIcons(paths) {
    Object.entries(paths).forEach(([iconName, path]) => {
        console.log(iconName);
        customElements.define(
            kebabCase(iconName),
            class extends HTMLElement {
                static get observedAttributes() {
                    return ["size"];
                }
                constructor() {
                    super();
                    let size = 24;
                    if (parseInt(this.getAttribute("size"))) {
                        size = 24 * parseInt(this.getAttribute("size"));
                    }
                    if (parseInt(this.getAttribute("sizePx"))) {
                        size = this.getAttribute("sizePx");
                    }
                    this.innerHTML = `<svg class="icon" viewbox="0 0 24 24"><path d="${path}"></path></svg>`;
                    this.style.setProperty("--icon-size", size + "px");
                    this.style.setProperty("width", size + "px");
                    this.style.setProperty("height", size + "px");
                }
            }
        );
    });
}

export default function () {
    createSvgIcons({
        mdiCog,
        mdiArrowLeftTop,
        mdiArrowRightTop,
        mdiCalendarToday,
        mdiRefresh,
    });
}
