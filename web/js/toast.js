import toastcss from "/css/toast.css";
toastcss.use();

export default function showToast(
    toastMessage,
    ttl,
    { buttonText = undefined, buttonCb = undefined, width = undefined } = {}
) {
    const toast = document.createElement("div");
    if (width !== undefined) {
        toast.style.setProperty("--toast-width", width);
    }
    toast.classList.add("toast");
    toast.innerText = toastMessage;
    toast.addEventListener("animationend", function () {
        if (toast.classList.contains("timeToDie")) {
            toast.remove();
        } else {
            setInterval(function () {
                toast.classList.add("timeToDie");
            }, ttl | 1500);
        }
    });
    if (buttonText) {
        const button = document.createElement("button");
        button.innerText = buttonText;
        button.classList.add("label-large");
        button.addEventListener("click", (e) => {
            toast.classList.add("timeToDie");
            buttonCb(e);
        });
        toast.appendChild(button);
    }
    document.body.appendChild(toast);
    return toast;
}

window.showToast = showToast;
