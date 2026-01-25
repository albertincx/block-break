// Dark Mode Switch Logic - v1.2.0 (build 260125)
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "disabled") {
        body.classList.remove("dark");
    } else {
        body.classList.add("dark");
        if (savedMode === null) {
            localStorage.setItem("darkMode", "enabled");
        }
    }

    const refreshIcon = document.getElementById("refresh-icon");

    function updateRefreshIcon() {
        if (body.classList.contains("dark")) {
            refreshIcon.src = "img/refresh_dark.svg";
        } else {
            refreshIcon.src = "img/refresh_light.svg";
        }
    }

    updateRefreshIcon();

});
