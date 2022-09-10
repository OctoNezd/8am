import "./sw-control.js";
import indexhtml from "html/index.html";
document.body.innerHTML = indexhtml;

import "/css/index.css";
import "./modal";
window.__IS_DEV__ = __IS_DEV__;
require("./sharaga.js");
document.body.classList.add("booted");
