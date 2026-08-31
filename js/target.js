function initTargetPage() {
    if (!hasVision()) {
        goToStep("vision");
        return;
    }

    renderFlowSteps("target");

    var form = document.getElementById("target-form");
    if (!form) {
        return;
    }

    var preview = document.getElementById("target-preview");
    var error = document.getElementById("target-error");
    var success = document.getElementById("target-success");
    var plan = getPlan();

    if (plan.target) {
        document.getElementById("partner1").value = plan.target.partner1 || "";
        document.getElementById("partner2").value = plan.target.partner2 || "";
        document.getElementById("weddingDate").value = plan.target.weddingDate || "";
        document.getElementById("city").value = plan.target.city || "";
        document.getElementById("guests").value = plan.target.guests || "";
        document.getElementById("budget").value = plan.target.budget || "";
    }

    function updatePreview() {
        var budget = Number(document.getElementById("budget").value) || 0;
        var guests = Number(document.getElementById("guests").value) || 0;
        var date = document.getElementById("weddingDate").value;
        var recommended = recommendPackage(budget);
        var pkg = PACKAGES[recommended];
        var days = daysUntilWedding(date);
        var daysLabel = date ? days + " days" : "Pick a date";

        preview.innerHTML =
            '<div class="calc-grid">' +
            '<div class="calc-box"><strong>' + pkg.name + '</strong><span>Recommended package</span></div>' +
            '<div class="calc-box"><strong>' + guestTier(guests) + '</strong><span>Guest size</span></div>' +
            '<div class="calc-box"><strong>' + daysLabel + '</strong><span>Until wedding</span></div>' +
            '<div class="calc-box"><strong>' + formatMMK(budgetDiff(budget, pkg.price)) + '</strong><span>Budget vs package</span></div>' +
            "</div>";
    }

    ["budget", "guests", "weddingDate"].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", updatePreview);
        }
    });

    updatePreview();

    if (form.dataset.bound !== "1") {
        form.dataset.bound = "1";

        form.addEventListener("submit", function (event) {
        event.preventDefault();
        showFormMessage(error, "error", "");
        showFormMessage(success, "success", "");

        var partner1 = document.getElementById("partner1").value.trim();
        var partner2 = document.getElementById("partner2").value.trim();
        var weddingDate = document.getElementById("weddingDate").value;
        var city = document.getElementById("city").value.trim();
        var guests = Number(document.getElementById("guests").value);
        var budget = Number(document.getElementById("budget").value);

        if (!partner1 || !partner2 || !weddingDate || !city || !guests || !budget) {
            showFormMessage(error, "error", "Please fill in every field.");
            return;
        }

        if (guests < 1) {
            showFormMessage(error, "error", "Guest count must be at least 1.");
            return;
        }

        if (budget < 1000000) {
            showFormMessage(error, "error", "Budget must be at least 1,000,000 MMK.");
            return;
        }

        if (daysUntilWedding(weddingDate) < 0) {
            showFormMessage(error, "error", "Wedding date cannot be in the past.");
            return;
        }

        var result = setTarget({
            partner1: partner1,
            partner2: partner2,
            weddingDate: weddingDate,
            city: city,
            guests: guests,
            budget: budget,
            recommendedPackage: recommendPackage(budget)
        });

        if (!result.ok) {
            showFormMessage(error, "error", result.message);
            return;
        }

        showFormMessage(success, "success", "Target saved! Opening packages...");
        flashMessage("success", "Wedding target saved for " + partner1 + " & " + partner2);

        window.setTimeout(function () {
            if (hasActiveBooking() && isEditMode()) {
                goToStep("my-plan");
            } else if (typeof isBrowseMode === "function" && isBrowseMode()) {
                goToStep("packages", { browse: true });
            } else {
                goToStep("packages");
            }
        }, 800);
    });
    }
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initTargetPage);
}
