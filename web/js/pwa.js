import updateThemeColor from "./theming";
import "/css/pwa.css";
import htmlHeader from "/html/pwa_header.html";
import {
    argbFromHex,
    themeFromSourceColor,
    applyTheme,
    sourceColorFromImage,
} from "@material/material-color-utilities";
import iro from "@jaames/iro";
import { openModal } from "./modal";
let cpicker_modal, colorpicker;

function pwa_init() {
    document.body.insertAdjacentHTML("afterbegin", htmlHeader);
    document.body.classList.add("pwa");

    setup_pwa_modal();
    setup_cpicker_modal();
    loadLSTheme();
    window.addEventListener("online", handleConnection);
    window.addEventListener("offline", handleConnection);
    console.log("PWA - booted");
}
pwa_init();
function handleConnection() {
    console.log("online?", navigator.onLine);
    if (navigator.onLine) {
        document.body.classList.remove("offline");
    } else {
        document.body.classList.add("offline");
    }
}

function loadLSTheme() {
    let userThemeColor = localStorage.getItem("userTheme");
    if (userThemeColor === null) {
        return;
    }
    if (userThemeColor.startsWith("#")) {
        userThemeColor = argbFromHex(userThemeColor);
    }
    const userTheme = themeFromSourceColor(userThemeColor);
    // Check if the user has dark mode turned on
    const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;
    console.log(userTheme);
    console.log("loading theme", userTheme, "with dark mode:", systemDark);
    // Apply the theme to the body by updating custom properties for material tokens
    applyTheme(userTheme, { target: document.body, dark: systemDark });
    updateThemeColor();
}
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", loadLSTheme);
function makeThemeFromImg() {
    var input = document.createElement("input");
    input.type = "file";
    input.setAttribute("accept", "image/*");

    input.onchange = async (e) => {
        var file = e.target.files[0];
        console.log("onchange", file);
        const bmp = await createImageBitmap(file, {
            resizeHeight: 300,
            resizeQuality: "low",
        });
        console.log("bmp:", bmp);
        // create a canvas
        const canvas = document.createElement("canvas");
        // resize it to the size of our ImageBitmap
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        // get a bitmaprenderer context
        const ctx = canvas.getContext("bitmaprenderer");
        ctx.transferFromImageBitmap(bmp);
        // get it back as a Blob
        const blob2 = await new Promise((res) => canvas.toBlob(res));
        console.log(blob2); // Blob
        const imgel = document.createElement("img");
        imgel.src = URL.createObjectURL(blob2);
        console.log("imgel", imgel);
        const theme = await sourceColorFromImage(imgel);
        console.log("theme from image:", theme);
        localStorage.setItem("userTheme", JSON.stringify(theme));
        loadLSTheme();
    };

    input.click();
}

function createSettingsButton(title) {
    const button = document.createElement("button");
    button.classList.add("button", "knopf", "primary-container", "block");
    button.innerText = title;
    button.href = "#";
    return button;
}

function setup_pwa_modal() {
    const modal = document.createElement("div");
    modal.id = "pwaSettings";
    modal.classList.add("modal");
    const button = document.querySelector("#pwa-settings-button");
    window.open_settings_modal = (e) => openModal(modal, e);
    button.addEventListener("click", open_settings_modal);
    modal.addEventListener("click", discardModal);
    const controls = document.querySelector("#controls");
    controls.querySelectorAll(".knopf").forEach((control) => {
        control.classList.add("nologos");
    });
    const about = document.querySelector("#about");
    const settingsHeaderText = document.createElement("h3");
    settingsHeaderText.innerText = "Настройки PWA";
    settingsHeaderText.classList.add(
        "headline-small",
        "center",
        "on-surface-text",
        "dialog-title"
    );
    const loadColorImage = createSettingsButton("Загрузить картинку для темы");
    loadColorImage.addEventListener("click", makeThemeFromImg);
    const selectThemeColor = createSettingsButton(
        "Выбрать цвет для темы вручную"
    );
    selectThemeColor.addEventListener("click", (e) =>
        openModal(cpicker_modal, e)
    );
    const settingsApplyButton = createSettingsButton("ОК");
    settingsApplyButton.id = "pwa-settings-apply";
    settingsApplyButton.addEventListener("click", discardModalForce);
    const modalBody = document.createElement("div");
    modalBody.id = "pwa-settings-modal";
    modal.appendChild(modalBody);
    modalBody.classList.add("modal-body", "on-surface-variant-text");
    modalBody.append(
        settingsHeaderText,
        controls,
        loadColorImage,
        selectThemeColor,
        about,
        settingsApplyButton
    );
    document.body.appendChild(modal);
    console.log("created pwa modal");
}

function testmd3() {
    const rainbow = [
        "#ff0000",
        "#ffa500",
        "#ffff00",
        "#008000",
        "#0000ff",
        "#4b0082",
        "#ee82ee",
    ];
    var currEnum = 0;
    setInterval(function () {
        const theme = themeFromSourceColor(argbFromHex(rainbow[currEnum]));
        currEnum++;
        // Print out the theme as JSON
        console.log(JSON.stringify(theme, null, 2));

        // Check if the user has dark mode turned on
        const systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        // Apply the theme to the body by updating custom properties for material tokens
        applyTheme(theme, { target: document.body, dark: systemDark });
        updateThemeColor();
        if (currEnum === 7) {
            currEnum = 0;
        }
    }, 500);
}

function setup_cpicker_modal() {
    cpicker_modal = document.createElement("div");
    cpicker_modal.id = "colorPickerModal";
    cpicker_modal.classList.add("modal");
    const modalBody = document.createElement("div");
    cpicker_modal.appendChild(modalBody);
    modalBody.classList.add("modal-body", "on-surface-variant-text");
    const settingsHeaderText = document.createElement("h3");
    settingsHeaderText.innerText = "Выбор цвета";
    settingsHeaderText.classList.add(
        "headline-small",
        "center",
        "on-surface-text",
        "dialog-title"
    );
    const cpicker_el = document.createElement("div");
    cpicker_el.classList.add("colorpicker");
    colorpicker = new iro.ColorPicker(cpicker_el, {
        layout: [
            {
                component: iro.ui.Wheel,
            },
        ],
    });
    const ok = createSettingsButton("OK");
    ok.addEventListener("click", () => {
        discardModalForce();
        localStorage.setItem("userTheme", colorpicker.color.hexString);
        loadLSTheme();
    });
    const cancel = createSettingsButton("Отмена");
    cancel.addEventListener("click", () => {
        discardModalForce();
        loadLSTheme();
    });
    colorpicker.on("color:change", function (color) {
        // log the current color as a HEX string
        console.log(color.hexString);
        const theme = themeFromSourceColor(argbFromHex(color.hexString));
        const systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        // Apply the theme to the body by updating custom properties for material tokens
        applyTheme(theme, { target: document.body, dark: systemDark });
    });
    modalBody.append(settingsHeaderText, cpicker_el, ok, cancel);
    document.body.appendChild(cpicker_modal);
}
window.testmd3 = testmd3;
