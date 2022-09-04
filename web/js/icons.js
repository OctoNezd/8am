import { dom, library, icon } from "@fortawesome/fontawesome-svg-core";
import {
    faGear,
    faChalkboardUser,
    faTrainSubway,
    faCircle,
} from "@fortawesome/free-solid-svg-icons";
let teacherIcon, metroIcon, circleIcon;
export default function () {
    library.add(faGear, faChalkboardUser, faTrainSubway, faCircle);
    teacherIcon = icon(faChalkboardUser).node[0];
    metroIcon = icon(faTrainSubway, {
        transform: {
            size: 14,
        },
    }).node[0];
    circleIcon = icon(faCircle, {
        transform: {
            size: 20,
        },
    }).node[0];
    [teacherIcon].forEach((node) => node.classList.add("fa-fw"));
    dom.i2svg().then(() => console.log("Icons have rendered"));
    dom.insertCss();
    console.log("css inserted");
}
export { teacherIcon, metroIcon, circleIcon };
