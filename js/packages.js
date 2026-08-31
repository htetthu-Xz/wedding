function initPackagesPage() {
    var browsing = typeof isBrowseMode === "function" && isBrowseMode();

    if (!browsing) {
        if (!hasVision()) {
            goToStep("vision");
            return;
        }

        if (!hasTarget()) {
            goToStep("target");
            return;
        }
    }

    renderFlowSteps(browsing ? "package" : "package");

    var container = document.getElementById("packages-list");
    var plan = getPlan();
    var summary = document.getElementById("package-summary");
    var recommended = browsing ? "standard" : (plan.target.recommendedPackage || recommendPackage(plan.target.budget));

    if (summary) {
        if (browsing) {
            summary.innerHTML =
                '<div class="summary-card browse-banner">' +
                "<h3>Browse our wedding packages</h3>" +
                "<p>No login needed to explore. Pick a package to view service items with photos. " +
                "Register or log in only when you are ready to confirm at checkout.</p>" +
                "</div>";
        } else {
            summary.innerHTML =
                '<div class="summary-card">' +
                "<h3>Your plan</h3>" +
                "<p><strong>Vision:</strong> " + plan.vision.name + "</p>" +
                "<p><strong>Couple:</strong> " + plan.target.partner1 + " & " + plan.target.partner2 + "</p>" +
                "<p><strong>Date:</strong> " + plan.target.weddingDate + " · <strong>City:</strong> " + plan.target.city + "</p>" +
                "<p><strong>Guests:</strong> " + plan.target.guests + " · <strong>Budget:</strong> " + formatMMK(plan.target.budget) + "</p>" +
                "<p><strong>Recommended:</strong> " + PACKAGES[recommended].name + " (" + formatMMK(PACKAGES[recommended].price) + ")</p>" +
                "</div>";
        }
    }

    if (!container) {
        return;
    }

    container.innerHTML = "";

    var order = ["basic", "standard", "premium"];

    for (var i = 0; i < order.length; i++) {
        var pkg = PACKAGES[order[i]];
        var card = document.createElement("div");
        card.className = "service-card package-card";
        if (pkg.id === recommended) {
            card.className += " is-recommended";
        }

        if (pkg.id === recommended) {
            var badge = document.createElement("span");
            badge.className = "badge";
            badge.textContent = browsing ? "Popular choice" : "Best match for your budget";
            card.appendChild(badge);
        }

        var icon = document.createElement("div");
        icon.className = "package-icon";
        icon.textContent = pkg.id === "premium" ? "👑" : pkg.id === "standard" ? "💎" : "🌸";

        var title = document.createElement("h2");
        title.textContent = pkg.name;

        var note = document.createElement("p");
        note.textContent = pkg.note;

        var price = document.createElement("p");
        price.className = "package-price";
        price.textContent = formatMMK(pkg.price);

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(note);
        card.appendChild(price);

        if (!browsing) {
            var diff = budgetDiff(plan.target.budget, pkg.price);
            var diffLine = document.createElement("p");
            diffLine.className = "package-diff";
            diffLine.textContent = diff >= 0
                ? "Within budget by " + formatMMK(diff)
                : "Over budget by " + formatMMK(Math.abs(diff));
            card.appendChild(diffLine);
        }

        var link = document.createElement("a");
        link.href = "#";
        link.className = "card-btn";
        link.textContent = browsing ? "View items" : "Choose items";

        link.addEventListener("click", (function (levelId) {
            return function (event) {
                event.preventDefault();
                var result = setLevel(levelId);
                if (result.cleared) {
                    flashMessage("info", "Package changed. Please choose all 8 items again.");
                }
                goToStep("choose", { level: levelId, browse: browsing });
            };
        })(pkg.id));

        card.appendChild(link);
        container.appendChild(card);
    }
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initPackagesPage);
}
