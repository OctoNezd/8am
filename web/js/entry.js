import "./sw-control";
import indexhtml from "html/index.html";
document.body.innerHTML = indexhtml;

import indexcss from "/css/index.css";
indexcss.use();
import "./modal";
window.__IS_DEV__ = __IS_DEV__;
require("./sharaga");
document.body.classList.add("booted");
