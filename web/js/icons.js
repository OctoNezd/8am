import { mdiCog } from "@mdi/js";
import css from "/css/icons.css";
const kebabCase = (string) =>
    string
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
function createSvgIcon(paths) {
    Object.entries(paths).forEach(([iconName, path]) => {
        console.log(iconName);
        customElements.define(
            kebabCase(iconName),
            class extends HTMLElement {
                constructor() {
                    super();
                    this.attachShadow({ mode: "open" });
                    css.use({ target: this.shadowRoot });
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = `<svg class="icon" viewbox="0 0 24 24"><path d="${path}"></path></svg>`;
                    this.shadowRoot.appendChild(wrapper);
                }
                connectedCallback() {
                    console.log("connected", iconName);
                }
            }
            // { extends: "svg" }
        );
    });

    // customElements.define()
}

export default function () {
    createSvgIcon({ mdiCog });
}
