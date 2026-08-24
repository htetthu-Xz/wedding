function initMyPlanPage() {
    var root = document.getElementById("my-plan-root");
    if (!root) {
        return;
    }

    if (!isLoggedIn()) {
        goToStep("login", { returnStep: "my-plan" });
        return;
    }

    loadSessionBooking();

    if (!hasActiveBooking()) {
        showPageMessage("page-message", "info", "No booking yet. Start planning your wedding.");
        window.setTimeout(function () {
            goToStep("vision", { edit: true });
        }, 1200);
        return;
    }

    var booking = getActiveBooking();
    var plan = getPlan();
    var cart = getCart();
    var pkg = cart.level && PACKAGES[cart.level] ? PACKAGES[cart.level] : null;

    root.innerHTML = "";

    var heading = document.createElement("h1");
    heading.textContent = "Your wedding plan";

    var intro = document.createElement("p");
    intro.className = "subtitle";
    intro.textContent = "Your booking is confirmed. Review details below or edit any section.";

    var badge = document.createElement("div");
    badge.className = "my-plan-badge";
    badge.innerHTML =
        "<i class=\"fa-solid fa-circle-check\"></i> Confirmed · Booked " +
        formatBookedDate(booking.updatedAt || booking.bookedAt);

    var summary = document.createElement("div");
    summary.className = "summary-card";
    var summaryHtml = "<h3>Wedding summary</h3>";

    if (plan.vision) {
        summaryHtml += "<p><strong>Vision:</strong> " + plan.vision.name + "</p>";
    }
    if (plan.target) {
        summaryHtml +=
            "<p><strong>Couple:</strong> " + plan.target.partner1 + " & " + plan.target.partner2 + "</p>" +
            "<p><strong>Date:</strong> " + plan.target.weddingDate + " · <strong>City:</strong> " + plan.target.city + "</p>" +
            "<p><strong>Guests:</strong> " + plan.target.guests + " · <strong>Budget:</strong> " + formatMMK(plan.target.budget) + "</p>";
    }
    if (getSession()) {
        summaryHtml += "<p><strong>Booked by:</strong> " + getSession().name + " (" + getSession().email + ")</p>";
    }
    summary.innerHTML = summaryHtml;

    var calcGrid = document.createElement("div");
    calcGrid.className = "calc-grid";

    if (pkg && plan.target) {
        calcGrid.innerHTML =
            '<div class="calc-box"><strong>' + pkg.name + "</strong><span>Package</span></div>" +
            '<div class="calc-box"><strong>' + formatMMK(pkg.price) + "</strong><span>Total price</span></div>" +
            '<div class="calc-box"><strong>' + daysUntilWedding(plan.target.weddingDate) + " days</strong><span>Until wedding</span></div>" +
            '<div class="calc-box"><strong>' + completionPercent(chosenCount(), SERVICES.length) + "%</strong><span>Items chosen</span></div>";
    }

    var table = document.createElement("table");
    table.className = "checkout-table";
    table.innerHTML = "<thead><tr><th>Service</th><th>Your choice</th></tr></thead>";
    var tbody = document.createElement("tbody");

    for (var i = 0; i < SERVICES.length; i++) {
        var service = SERVICES[i];
        var choice = cart.choices[service.id];
        var row = document.createElement("tr");
        var serviceCell = document.createElement("td");
        serviceCell.textContent = service.name;
        var choiceCell = document.createElement("td");

        if (choice) {
            choiceCell.textContent = choice.itemName;
        } else {
            choiceCell.textContent = "Not chosen";
            choiceCell.className = "not-chosen";
        }

        row.appendChild(serviceCell);
        row.appendChild(choiceCell);
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    var actions = document.createElement("div");
    actions.className = "my-plan-actions";

    function addEditBtn(label, step, extra) {
        extra = extra || {};
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-secondary my-plan-edit-btn";
        btn.textContent = label;
        btn.addEventListener("click", function () {
            goToStep(step, Object.assign({ edit: true }, extra));
        });
        actions.appendChild(btn);
    }

    addEditBtn("Edit vision", "vision");
    addEditBtn("Edit target", "target");
    addEditBtn("Change package", "packages");
    if (cart.level) {
        addEditBtn("Edit items", "choose", { level: cart.level });
    }
    addEditBtn("Review checkout", "checkout");

    var homeLink = document.createElement("a");
    homeLink.className = "card-btn";
    homeLink.href = "wedding.html";
    homeLink.textContent = "Back to home";
    homeLink.style.marginTop = "12px";

    root.appendChild(heading);
    root.appendChild(intro);
    root.appendChild(badge);
    root.appendChild(summary);
    if (pkg) {
        root.appendChild(calcGrid);
    }
    root.appendChild(table);
    root.appendChild(actions);
    root.appendChild(homeLink);
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initMyPlanPage);
}
