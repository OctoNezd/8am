import setup_calendar_preview from "./icalpreview";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";
document.addEventListener("DOMContentLoaded", function () {
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
        webcal.parentElement.classList.add("flex-last");
    }
    const urlParams = new URLSearchParams(location.search);
    const select = new TomSelect("#group", {
        create: false,
        sortField: {
            field: "text",
            direction: "asc",
        },
        valueField: "id",
        labelField: "title",
        searchField: "title",

        onChange: function () {
            if (groupdom.value === "NO") {
                buttons.classList.add("hidden");
                return;
            }
            history.pushState(
                "",
                "",
                "?" + new URLSearchParams({ group: groupdom.value })
            );
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
        .then(function (response) {
            return response.json();
        })
        .then(function (groups) {
            const urlgroup = urlParams.get("group");
            for (const [group, gid] of Object.entries(groups)) {
                select.addOption({
                    id: gid,
                    title: `${group} (ID: ${gid})`,
                });
                if (urlgroup === gid) {
                    select.setValue(gid);
                }
            }
        });
    fetch("/stats", {
        method: "get",
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (stats) {
            const spoiler = document.querySelector("details#stats");
            for (const [group, downloads] of Object.entries(stats["groups"])) {
                const elem = document.createElement("a");
                elem.innerText = `${group}: ${downloads}`;
                spoiler.append(elem);
            }
            document.querySelector("#appver").innerText =
                "Парсер v" + stats["system"]["parser_ver"];
        });
});