function initMyPlanPage() {
    var root = document.getElementById("myplan-root");
    if (!root) {
        return;
    }

    if (!hasSubmittedBooking()) {
        if (hasVision() || hasTarget() || getCart().level) {
            goToStep("checkout");
            return;
        }
        goToStep(isLoggedIn() ? "vision" : "register");
        return;
    }

    if (!isLoggedIn()) {
        goToStep("login", { returnStep: "myplan" });
        return;
    }

    var booking = getBooking();
    var plan = booking.plan || getPlan();
    var cart = booking.cart || getCart();
    var pkg = cart.level && PACKAGES[cart.level] ? PACKAGES[cart.level] : null;

    root.innerHTML = "";

    var heading = document.createElement("h1");
    heading.textContent = "Your wedding plan";

    var intro = document.createElement("p");
    intro.className = "subtitle";
    intro.textContent = "Your booking is confirmed. You can review or edit your plan anytime.";

    root.appendChild(heading);
    root.appendChild(intro);

    if (booking.submittedAt) {
        var dateNote = document.createElement("p");
        dateNote.className = "myplan-date";
        dateNote.textContent = "Last submitted: " + formatBookingDate(booking.submittedAt);
        root.appendChild(dateNote);
    }

    var badge = document.createElement("div");
    badge.className = "myplan-badge";
    badge.innerHTML = "<i class=\"fa-solid fa-check\"></i> Booking confirmed";

    var summary = document.createElement("div");
    summary.className = "summary-card";
    var summaryHtml = "<h3>Wedding summary</h3>";

    if (plan.vision) {
        summaryHtml += "<p><strong>Vision:</strong> " + plan.vision.name + "</p>";
    }
    if (plan.target) {
        summaryHtml += "<p><strong>Couple:</strong> " + plan.target.partner1 + " & " + plan.target.partner2 + "</p>";
        summaryHtml += "<p><strong>Date:</strong> " + plan.target.weddingDate + " · <strong>City:</strong> " + plan.target.city + "</p>";
        summaryHtml += "<p><strong>Guests:</strong> " + plan.target.guests + " · <strong>Budget:</strong> " + formatMMK(plan.target.budget) + "</p>";
    }
    if (booking.bookedBy) {
        summaryHtml += "<p><strong>Booked by:</strong> " + booking.bookedBy.name + " (" + booking.bookedBy.email + ")</p>";
    }
    if (pkg) {
        summaryHtml += "<p><strong>Package:</strong> " + pkg.name + " · " + formatMMK(pkg.price) + "</p>";
    }
    summary.innerHTML = summaryHtml;

    var table = document.createElement("table");
    table.className = "checkout-table";
    table.innerHTML = "<thead><tr><th>Service</th><th>Your choice</th></tr></thead>";
    var tbody = document.createElement("tbody");

    for (var i = 0; i < SERVICES.length; i++) {
        var service = SERVICES[i];
        var choice = cart.choices && cart.choices[service.id];
        var row = document.createElement("tr");
        var serviceCell = document.createElement("td");
        serviceCell.textContent = service.icon + " " + service.name;
        var choiceCell = document.createElement("td");
        choiceCell.textContent = choice ? choice.itemName : "Not chosen";
        if (!choice) {
            choiceCell.className = "not-chosen";
        }
        row.appendChild(serviceCell);
        row.appendChild(choiceCell);
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    var actions = document.createElement("div");
    actions.className = "myplan-actions";

    var editVision = document.createElement("button");
    editVision.type = "button";
    editVision.className = "btn-secondary";
    editVision.textContent = "Edit vision & target";
    editVision.addEventListener("click", function () {
        syncPlanFromBooking();
        goToStep("vision");
    });

    var editItems = document.createElement("button");
    editItems.type = "button";
    editItems.className = "card-btn";
    editItems.textContent = "Edit package & items";
    editItems.addEventListener("click", function () {
        syncPlanFromBooking();
        if (cart.level) {
            goToStep("choose", { level: cart.level });
        } else {
            goToStep("packages");
        }
    });

    var checkoutBtn = document.createElement("button");
    checkoutBtn.type = "button";
    checkoutBtn.className = "submit-btn";
    checkoutBtn.textContent = "Review & update booking";
    checkoutBtn.addEventListener("click", function () {
        syncPlanFromBooking();
        goToStep("checkout");
    });

    actions.appendChild(editVision);
    actions.appendChild(editItems);
    actions.appendChild(checkoutBtn);

    root.appendChild(badge);
    root.appendChild(summary);
    root.appendChild(table);
    root.appendChild(actions);

    var homeLink = document.createElement("a");
    homeLink.href = "wedding.html";
    homeLink.className = "choose-change-pkg";
    homeLink.textContent = "Back to home";
    homeLink.style.display = "block";
    homeLink.style.marginTop = "20px";
    root.appendChild(homeLink);
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initMyPlanPage);
}
