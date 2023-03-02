import { isPwa } from "./pwa_add";

import setup_calendar_preview, { boot_calendar } from "./calendar/icalpreview";
import "./devmenu";
import setup_icons from "./icons.js";
import TomSelect from "tom-select";
import tsCss from "tom-select/dist/css/tom-select.css";
tsCss.use();
import localForage from "localforage";

setup_icons();
boot_calendar();

const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
const groupdom = document.getElementById("group");
const sourcedom = document.getElementById("source");
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
fetch("/stats", {
    method: "get",
})
    .then(async function (response) {
        return response.json();
    })
    .then(async function (stats) {
        const appver = document.getElementById("appver");
        await localForage.setItem(
            "serverVersion",
            stats["system"]["parser_ver"]
        );
        appver.innerText = `Парсер v ${stats["system"]["parser_ver"]} (${__COMMIT_HASH__})`;
    });

const groupSelect = new TomSelect("#group", {
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
            await setup_calendar_preview();
            return;
        }
        const gid = groupdom.value;
        const source = sourcedom.value;
        urlParams.set("group", gid);
        if (!isPwa) {
            history.pushState("", "", "?" + urlParams);
        }
        await localForage.setItem("last_gid", gid);
        buttons.classList.remove("hidden");
        const url = `${location.protocol}//${
            location.host
        }/group/${source}/${gid}.ics?sv=${await localForage.getItem(
            "serverVersion"
        )}`;
        const webcalUrl = `webcal://${
            location.host
        }/group/${source}/${gid}.ics?forceupdate=${(Math.random() + 1)
            .toString(36)
            .substring(7)}`;
        webcal["href"] = webcalUrl;
        google["href"] =
            "https://calendar.google.com/calendar/r?" +
            new URLSearchParams({
                cid: webcalUrl,
            }).toString();
        await setup_calendar_preview(url);
    },
});
let groupData;
async function set_groups() {
    const urlgroup = urlParams.get("group");
    groupSelect.clear();
    groupSelect.clearOptions();
    var gidSelected = false;
    for (const [source, groups] of Object.entries(groupData)) {
        if (source !== sourcedom.value) {
            continue;
        }
        for (const [group, gid] of Object.entries(groups)) {
            groupSelect.addOption({
                id: gid,
                title: `${group} (ID: ${gid})`,
            });
            if (urlgroup === gid && !isPwa) {
                groupSelect.setValue(gid);
                gidSelected = true;
            }
        }
    }
    if (!gidSelected) {
        const lastgid = await localForage.getItem("last_gid");
        const lastsource = await localForage.getItem("last_source");
        if (lastgid !== undefined && lastsource == sourcedom.value) {
            console.log("set gid to last gid:", lastgid);
            groupSelect.setValue(lastgid);
        }
    }
}
const sourceSelect = new TomSelect("#source", {
    create: false,
    sortField: {
        field: "text",
        direction: "asc",
    },
    valueField: "id",
    labelField: "title",
    searchField: "title",

    onChange: async function () {
        console.log("selected", sourcedom.value);
        if (["NO", ""].includes(sourcedom.value)) {
            console.log("hiding everything");
            buttons.classList.add("hidden");
            return;
        }
        urlParams.set("source", sourcedom.value);
        if (!isPwa) {
            history.pushState("", "", "?" + urlParams);
        }
        await localForage.setItem("last_source", sourcedom.value);
        set_groups();
    },
});
fetch("/groups", {
    method: "get",
})
    .then(async function (response) {
        return response.json();
    })
    .then(async function (groupDataLocal) {
        groupData = groupDataLocal;
        fetch("/sources", {
            method: "get",
        })
            .then(async function (response) {
                return response.json();
            })
            .then(async function (sources) {
                const urlsource = urlParams.get("source");
                var sourceSelected = false;
                for (const [sourceid, source] of Object.entries(sources)) {
                    sourceSelect.addOption({
                        id: sourceid,
                        title: `${source} (ID: ${sourceid})`,
                    });
                    if (urlsource === sourceid && !isPwa) {
                        sourceSelect.setValue(sourceid);
                        sourceSelected = true;
                    }
                }
                if (!sourceSelected) {
                    const lastsource = await localForage.getItem("last_source");
                    if (lastsource !== undefined) {
                        console.log("set source to last source:", lastsource);
                        sourceSelect.setValue(lastsource);
                        sourceSelected = true;
                    }
                }
                if (sourceSelected) {
                    await set_groups();
                }
            });
    });

window.focus_group_select = function () {
    open_settings_modal();
    sourceSelect.focus();
};
