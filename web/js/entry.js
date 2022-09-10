import "./sw-control.js";
import indexhtml from "html/index.html";
import "/css/index.css";
import "./modal";
window.__IS_DEV__ = __IS_DEV__;
document.body.innerHTML = indexhtml;
require("./sharaga.js");
document.body.classList.add("booted");

