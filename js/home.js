function getPlannerStartHref() {
    if (typeof isLoggedIn === "function" && isLoggedIn()) {
        if (typeof hasActiveBooking === "function" && hasActiveBooking()) {
            return "planner.html?step=my-plan";
        }
        return "planner.html?step=vision";
    }
    return "planner.html?step=register";
}

function updateHomeHero() {
    var guestBlock = document.getElementById("hero-guest");
    var authBlock = document.getElementById("hero-auth");
    var planBtn = document.getElementById("hero-plan-btn");

    if (!guestBlock || !authBlock) {
        return;
    }

    if (typeof isLoggedIn === "function" && isLoggedIn()) {
        guestBlock.hidden = true;
        authBlock.hidden = false;

        if (planBtn) {
            if (typeof hasActiveBooking === "function" && hasActiveBooking()) {
                planBtn.textContent = "View my wedding plan";
                planBtn.setAttribute("href", "planner.html?step=my-plan");
            } else {
                planBtn.textContent = "Continue planning";
                planBtn.setAttribute("href", "planner.html?step=vision");
            }
        }
    } else {
        guestBlock.hidden = false;
        authBlock.hidden = true;
    }
}

function updateHomeLinks() {
    var href = getPlannerStartHref();
    var links = document.querySelectorAll("[data-explore-link]");

    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("href", href);
    }

    var bookBtn = document.getElementById("book-now-btn");
    if (bookBtn) {
        bookBtn.setAttribute("href", href);
    }

    var packageBtn = document.getElementById("packages-btn");
    if (packageBtn) {
        if (typeof hasActiveBooking === "function" && hasActiveBooking()) {
            packageBtn.textContent = "View my plan";
            packageBtn.setAttribute("href", "planner.html?step=my-plan");
        } else {
            packageBtn.textContent = "Our Packages";
            packageBtn.setAttribute("href", "planner.html?step=packages");
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof isLoggedIn === "function" && isLoggedIn() && typeof loadSessionBooking === "function") {
        loadSessionBooking();
    }

    renderNavAuth();
    updateHomeHero();
    updateHomeLinks();
});
