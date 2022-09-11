import setup_calendar_preview, { boot_calendar } from "./icalpreview";
import { pwaDetectType, isPwa } from "./pwa_add";
import { iphone, ipad } from "./ios_modal";
import setup_icons from "./icons.js";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";
import localForage from "localForage";

console.log("PWA:", pwaDetectType);
setup_icons();
boot_calendar();

const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
const groupdom = document.getElementById("group");
const buttons = document.getElementById("addbuttons");
const webcal = document.getElementById("webcal");
const google = document.getElementById("google");
if (isAndroid) {
    console.log("android");
    webcal.classList.add("pale");
    webcal.classList.add("nologos");
    webcal.classList.add("flex-last");
}
let urlParams = new URLSearchParams(location.search);
console.log("urlParams: " + urlParams);
const select = new TomSelect("#group", {
    create: false,
    sortField: {
        field: "text",
        direction: "asc",
    },
    valueField: "id",
    labelField: "title",
    searchField: "title",

    onChange: async function () {
        console.log("selected", groupdom.value);
        if (["NO", ""].includes(groupdom.value)) {
            console.log("hiding everything");
            buttons.classList.add("hidden");
            setup_calendar_preview();
            return;
        }
        urlParams.set("group", groupdom.value);
        if (!isPwa) {
            history.pushState("", "", "?" + urlParams);
        }
        await localForage.setItem("last_gid", groupdom.value);
        buttons.classList.remove("hidden");
        webcal[
            "href"
        ] = `webcal://${location.host}/group/${groupdom.value}.ics`;
        // because google loves to cache stuff we force update by passing in random string
        google["href"] =
            "https://calendar.google.com/calendar/r?" +
            new URLSearchParams({
                cid: `webcal://${location.host}/group/${
                    groupdom.value
                }.ics?forceupdate=${(Math.random() + 1)
                    .toString(36)
                    .substring(7)}`,
            }).toString();
        setup_calendar_preview(groupdom.value);
    },
});

fetch("/groups", {
    method: "get",
})
    .then(async function (response) {
        return response.json();
    })
    .then(async function (groups) {
        const urlgroup = urlParams.get("group");
        var gidSelected = false;
        for (const [group, gid] of Object.entries(groups)) {
            select.addOption({
                id: gid,
                title: `${group} (ID: ${gid})`,
            });
            if (urlgroup === gid && !isPwa) {
                select.setValue(gid);
                gidSelected = true;
            }
        }
        if (!gidSelected) {
            const lastgid = await localForage.getItem("last_gid");
            if (lastgid !== undefined) {
                console.log("set gid to last gid:", lastgid);
                select.setValue(lastgid);
            }
        }
    });
fetch("/stats", {
    method: "get",
})
    .then(async function (response) {
        return response.json();
    })
    .then(async function (stats) {
        const spoiler = document.querySelector("#stats");
        for (const [group, downloads] of Object.entries(stats["groups"])) {
            const elem = document.createElement("tr");
            const cell1 = document.createElement("td");
            cell1.innerText = group;
            const cell2 = document.createElement("td");
            cell2.innerText = downloads;
            elem.append(cell1);
            elem.append(cell2);
            spoiler.append(elem);
        }
        const appver = document.querySelector("#appver");
        appver.innerText = `Парсер v ${stats["system"]["parser_ver"]} (${__COMMIT_HASH__})\n${pwaDetectType}`;
        if (__IS_DEV__) {
            appver.innerText += `\niphone:${iphone},ipad:${ipad}`;
        }
    });
