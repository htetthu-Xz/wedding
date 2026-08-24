function setNavItemVisible(id, visible) {
    var el = document.getElementById(id);
    if (el) {
        el.hidden = !visible;
    }
}

function bindLogoutOnce() {
    var btn = document.getElementById("nav-logout-btn");
    if (!btn || btn.dataset.bound === "1") {
        return;
    }

    btn.dataset.bound = "1";
    btn.addEventListener("click", function (event) {
        event.preventDefault();

        if (typeof logoutUser === "function") {
            logoutUser();
        }

        if (typeof clearBookingWorkspace === "function") {
            clearBookingWorkspace();
        }

        if (typeof flashMessage === "function") {
            flashMessage("success", "Logged out. Log in again to view your wedding plan.");
        }

        renderNavAuth();

        if (typeof updateHomeHero === "function") {
            updateHomeHero();
        }

        if (typeof updateHomeLinks === "function") {
            updateHomeLinks();
        }

        if (window.location.pathname.indexOf("wedding.html") !== -1) {
            return;
        }

        window.location.href = "wedding.html";
    });
}

function renderNavAuth() {
    var session = typeof getSession === "function" ? getSession() : null;
    var hasBooking = typeof hasActiveBooking === "function" && session && hasActiveBooking();
    var greeting = document.getElementById("nav-greeting-text");

    setNavItemVisible("nav-greeting", false);
    setNavItemVisible("nav-my-plan", false);
    setNavItemVisible("nav-logout", false);
    setNavItemVisible("nav-login", false);
    setNavItemVisible("nav-register", false);

    if (session) {
        setNavItemVisible("nav-greeting", true);
        setNavItemVisible("nav-logout", true);

        if (greeting) {
            greeting.textContent = "Hi, " + session.name.split(" ")[0];
        }

        if (hasBooking) {
            setNavItemVisible("nav-my-plan", true);
        }

        bindLogoutOnce();
        return;
    }

    setNavItemVisible("nav-login", true);
    setNavItemVisible("nav-register", true);
    bindLogoutOnce();
}

function renderFlowSteps(activeStep) {
    var root = document.getElementById("flow-steps");
    if (!root) {
        return;
    }

    if (activeStep === "my-plan") {
        root.innerHTML = "";
        root.style.display = "none";
        return;
    }

    root.style.display = "flex";

    var steps = [
        { id: "vision", label: "Vision" },
        { id: "target", label: "Target" },
        { id: "package", label: "Package" },
        { id: "choose", label: "Choose" },
        { id: "checkout", label: "Checkout" }
    ];

    var order = ["vision", "target", "package", "choose", "checkout"];
    var activeIndex = order.indexOf(activeStep);

    root.innerHTML = "";
    for (var i = 0; i < steps.length; i++) {
        var step = document.createElement("span");
        step.className = "flow-step";
        if (steps[i].id === activeStep) {
            step.className += " is-active";
        } else if (i < activeIndex) {
            step.className += " is-done";
        }
        step.textContent = steps[i].label;
        root.appendChild(step);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderNavAuth();
    bindLogoutOnce();
});
