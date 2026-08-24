function initCheckoutPage() {
    var root = document.getElementById("checkout-root");
    if (!root) {
        return;
    }

    if (window.PLANNER_MODE) {
        hydrateFromPlannerParams(new URLSearchParams(window.location.search));
    } else {
        hydrateFromLocation();
    }

    renderFlowSteps("checkout");

    var cart = getCart();
    var plan = getPlan();
    var pkg = cart.level && PACKAGES[cart.level] ? PACKAGES[cart.level] : null;

    root.innerHTML = "";

    if (!pkg) {
        showPageMessage("page-message", "error", "Please choose a package first.");
        var link = document.createElement("a");
        link.className = "card-btn";
        link.href = "#";
        link.textContent = hasTarget() ? "View packages" : "Set your target first";
        link.addEventListener("click", function (e) {
            e.preventDefault();
            goToStep(hasTarget() ? "packages" : "target");
        });
        link.style.display = "inline-block";
        link.style.marginTop = "12px";
        root.appendChild(link);
        return;
    }

    if (!hasVision() || !hasTarget()) {
        showPageMessage("page-message", "error", "Please complete vision and target before checkout.");
        window.setTimeout(function () {
            goToStep(!hasVision() ? "vision" : "target");
        }, 1500);
        return;
    }

    var heading = document.createElement("h1");
    heading.textContent = "Checkout";

    var intro = document.createElement("p");
    intro.className = "subtitle";
    intro.textContent = pkg.name + " package · choose all 8 services to submit.";

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
    if (getSession()) {
        summaryHtml += "<p><strong>Booked by:</strong> " + getSession().name + " (" + getSession().email + ")</p>";
    }
    summary.innerHTML = summaryHtml;

    var calcGrid = document.createElement("div");
    calcGrid.className = "calc-grid";
    var guests = plan.target ? plan.target.guests : 1;
    var budget = plan.target ? plan.target.budget : 0;
    calcGrid.innerHTML =
        '<div class="calc-box"><strong>' + formatMMK(costPerGuest(pkg.price, guests)) + '</strong><span>Cost per guest</span></div>' +
        '<div class="calc-box"><strong>' + daysUntilWedding(plan.target ? plan.target.weddingDate : "") + ' days</strong><span>Until wedding</span></div>' +
        '<div class="calc-box"><strong>' + completionPercent(chosenCount(), SERVICES.length) + '%</strong><span>Plan complete</span></div>' +
        '<div class="calc-box"><strong>' + budgetUsagePercent(budget, pkg.price) + '%</strong><span>Budget used</span></div>';

    var table = document.createElement("table");
    table.className = "checkout-table";
    table.innerHTML = "<thead><tr><th>Service</th><th>Choice</th></tr></thead>";
    var tbody = document.createElement("tbody");
    var missing = [];

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
            missing.push(service.name);
        }
        row.appendChild(serviceCell);
        row.appendChild(choiceCell);
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    var total = document.createElement("p");
    total.className = "checkout-total";
    total.textContent = "Total: " + formatMMK(getTotal());

    var totalNote = document.createElement("p");
    totalNote.className = "subtitle";
    totalNote.textContent = "One bundle price for the whole wedding.";
    if (pkg.id !== "premium") {
        totalNote.textContent += " You save " + formatMMK(savingsFromPremium(pkg.price)) + " vs Premium.";
    }

    var back = document.createElement("a");
    back.className = "card-btn";
    back.href = "#";
    back.textContent = missing.length ? "Finish remaining items" : "Edit choices";
    back.addEventListener("click", function (e) {
        e.preventDefault();
        goToStep("choose", { level: cart.level });
    });

    var form = document.createElement("form");
    form.id = "checkout-form";
    var feedback = document.createElement("p");
    feedback.id = "checkout-feedback";
    feedback.className = "form-message";
    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "submit-btn";
    submit.textContent = isLoggedIn()
        ? (hasActiveBooking() ? "Update booking" : "Submit booking")
        : "Login to submit";
    submit.disabled = !isComplete();
    form.appendChild(feedback);
    form.appendChild(submit);

    if (!isLoggedIn()) {
        var loginNote = document.createElement("p");
        loginNote.className = "subtitle";
        loginNote.textContent = "You must log in before submitting your booking.";
        form.appendChild(loginNote);
    }

    if (missing.length) {
        var need = document.createElement("p");
        need.className = "subtitle";
        need.textContent = "Still need: " + missing.join(", ");
        form.appendChild(need);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showFormMessage(feedback, "", "");

        if (!isComplete()) {
            showFormMessage(feedback, "error", "Please choose 1 item in all 8 services before submitting.");
            return;
        }

        if (!requireLoginForCheckout()) {
            return;
        }

        var latestPkg = PACKAGES[getCart().level];
        var session = getSession();
        var wasUpdate = session && getUserBooking(session.userId);
        var saveResult = saveUserBooking();

        if (!saveResult.ok) {
            showFormMessage(feedback, "error", saveResult.message);
            return;
        }

        showFormMessage(
            feedback,
            "success",
            wasUpdate ? "Booking updated successfully! Redirecting to home..." : "Booking submitted successfully! Redirecting to home..."
        );
        flashMessage(
            "success",
            "Thank you! Your " + latestPkg.name + " wedding plan is saved."
        );

        window.setTimeout(function () {
            window.location.replace("wedding.html");
        }, 1400);
    });

    root.appendChild(heading);
    root.appendChild(intro);
    root.appendChild(summary);
    root.appendChild(calcGrid);
    root.appendChild(table);
    root.appendChild(total);
    root.appendChild(totalNote);
    root.appendChild(back);
    root.appendChild(form);
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initCheckoutPage);
}
