export default function showToast(toastMessage, ttl) {
    const toast = document.createElement("div");
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
    document.body.appendChild(toast);

    return toast;
}

window.showToast = showToast;
