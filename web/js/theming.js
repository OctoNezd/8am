const metaThemeColor = document.querySelector('meta[name="theme-color"]');
const metaAppleStatusBarColor = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
);

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function getBgColor() {
    var bgcolor = getComputedStyle(document.body).getPropertyValue(
        "background-color"
    );
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        metaAppleStatusBarColor.setAttribute("content", "black-translucent");
    } else {
        metaAppleStatusBarColor.setAttribute("content", "default");
    }
    if (document.querySelector(".modal.open") !== null) {
        var base = bgcolor
            .slice(4, -1)
            .split(", ")
            .map((val) => {
                console.log("value:", val, JSON.stringify(val));
                return parseInt(val);
            });
        base.push(1);
        var added = [0, 0, 0, 0.4];

        var mix = [];
        mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round(
            (added[0] * added[3]) / mix[3] +
                (base[0] * base[3] * (1 - added[3])) / mix[3]
        ); // red
        mix[1] = Math.round(
            (added[1] * added[3]) / mix[3] +
                (base[1] * base[3] * (1 - added[3])) / mix[3]
        ); // green
        mix[2] = Math.round(
            (added[2] * added[3]) / mix[3] +
                (base[2] * base[3] * (1 - added[3])) / mix[3]
        ); // blue
        mix = mix.slice(undefined, 3);
        console.log("new rgb", mix);
        bgcolor = rgbToHex(...mix);
    }
    return bgcolor;
}

function updateThemeColor() {
    const new_color = getBgColor();
    metaThemeColor.setAttribute("content", new_color);
}
export default updateThemeColor;
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateThemeColor);
updateThemeColor();
document.onvisibilitychange = updateThemeColor;
window.updateThemeColor = updateThemeColor;
