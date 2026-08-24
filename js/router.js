var STEP_FILES = {
    register: "register.html",
    login: "logIn.html",
    vision: "vision.html",
    target: "target.html",
    packages: "service.html",
    choose: "package-services.html",
    checkout: "checkout.html"
};

function goToStep(step, options) {
    options = options || {};

    if (window.PLANNER_MODE && typeof showPlannerStep === "function") {
        showPlannerStep(step, options);
        return;
    }

    var url = STEP_FILES[step] || "planner.html?step=" + step;

    if (step === "choose" && options.level) {
        url = "package-services.html?level=" + encodeURIComponent(options.level);
    } else if (step === "choose" && options.query) {
        url = "package-services.html" + options.query;
    } else if (step === "checkout") {
        url = "checkout.html" + (typeof cartToSearch === "function" ? cartToSearch() : "");
    } else if (step === "login") {
        url = "logIn.html";
        if (options.returnUrl) {
            url += "?return=" + encodeURIComponent(options.returnUrl);
        }
        if (options.msg) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + "msg=" + options.msg;
        }
    } else if (step === "planner") {
        url = "planner.html?step=" + (options.substep || "vision");
    }

    window.location.href = url;
}

function goHome() {
    window.location.href = "wedding.html";
}
