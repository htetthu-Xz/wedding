function showPlannerStep(step, options) {
    options = options || {};

    if (typeof shouldBlockNewPlanning === "function" && shouldBlockNewPlanning(step)) {
        step = "my-plan";
        options = {};
    }

    var steps = document.querySelectorAll(".planner-step");
    var i;

    for (i = 0; i < steps.length; i++) {
        steps[i].hidden = true;
    }

    var panel = document.getElementById("step-" + step);
    if (!panel) {
        if (step === "my-plan") {
            panel = document.getElementById("step-my-plan");
        }
        if (!panel) {
            panel = document.getElementById("step-vision");
            step = hasActiveBooking() ? "my-plan" : "vision";
            panel = document.getElementById("step-" + step) || document.getElementById("step-vision");
        }
    }

    panel.hidden = false;

    try {
        if (step === "my-plan") {
            history.replaceState(null, "", "planner.html?step=my-plan");
        } else {
            var params = new URLSearchParams();
            params.set("step", step);

            if (options.returnStep) {
                params.set("returnStep", options.returnStep);
            }

            if (options.edit) {
                params.set("edit", "1");
            }

            if (options.level) {
                params.set("level", options.level);
            }

            if (options.browse || (typeof isBrowseMode === "function" && isBrowseMode())) {
                params.set("browse", "1");
            }

            history.replaceState(null, "", "planner.html?" + params.toString());
        }
    } catch (err) {
        // ignore
    }

    renderFlashMessage("page-message");
    renderQueryMessage("page-message");
    renderNavAuth();

    var flowEl = document.getElementById("flow-steps");
    var cartNav = document.getElementById("nav-cart-item");
    var showCartNav = step === "choose" || step === "checkout";

    if (step === "register" || step === "login" || step === "my-plan") {
        if (flowEl) {
            flowEl.hidden = true;
        }
    } else {
        if (flowEl) {
            flowEl.hidden = false;
            flowEl.style.display = "flex";
        }

        var flowMap = {
            vision: "vision",
            target: "target",
            packages: "package",
            choose: "choose",
            checkout: "checkout"
        };
        renderFlowSteps(flowMap[step] || step);
    }

    if (cartNav) {
        cartNav.hidden = step === "my-plan" || !showCartNav;
    }

    if (step === "register") {
        initRegisterPage();
    } else if (step === "login") {
        initLoginPage();
    } else if (step === "my-plan") {
        initMyPlanPage();
    } else if (step === "vision") {
        initVisionPage();
    } else if (step === "target") {
        initTargetPage();
    } else if (step === "packages") {
        initPackagesPage();
    } else if (step === "choose") {
        initChoosePage({
            level: options.level,
            skipClearMessage: options.skipClearMessage,
            browse: options.browse
        });
    } else if (step === "checkout") {
        initCheckoutPage();
    }

    updateCartLinks();
    showStorageWarning();
}

function getPlannerStepFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var step = params.get("step");

    if (isLoggedIn() && typeof loadSessionBooking === "function") {
        loadSessionBooking();
    }

    if (step) {
        if (typeof shouldBlockNewPlanning === "function" && shouldBlockNewPlanning(step)) {
            return "my-plan";
        }
        return step;
    }

    if (isLoggedIn()) {
        if (typeof hasActiveBooking === "function" && hasActiveBooking()) {
            return "my-plan";
        }
        return hasVision() ? (hasTarget() ? "packages" : "target") : "vision";
    }

    return "register";
}

document.addEventListener("DOMContentLoaded", function () {
    var step = getPlannerStepFromUrl();
    var params = new URLSearchParams(window.location.search);
    var level = params.get("level");

    showPlannerStep(step, { level: level });

    var checkoutBtn = document.getElementById("planner-checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function (e) {
            if (!getCart().level) {
                e.preventDefault();
                showPageMessage("page-message", "error", "Choose a package and items first.");
            }
        });
    }
});
