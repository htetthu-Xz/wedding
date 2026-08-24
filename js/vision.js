function initVisionPage() {
    if (shouldBlockNewPlanning("vision")) {
        goToStep("my-plan");
        return;
    }

    renderFlowSteps("vision");

    var container = document.getElementById("vision-list");
    var actionMsg = document.getElementById("vision-action-message");
    var plan = getPlan();

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (var i = 0; i < VISIONS.length; i++) {
        var vision = VISIONS[i];
        var card = document.createElement("button");
        card.type = "button";
        card.className = "choice-card";
        if (plan.vision && plan.vision.id === vision.id) {
            card.className += " is-selected";
        }

        card.innerHTML =
            '<div class="icon">' + vision.icon + "</div>" +
            "<h2>" + vision.name + "</h2>" +
            "<p>" + vision.blurb + "</p>";

        card.addEventListener("click", (function (picked) {
            return function () {
                showPageMessage("page-message", "", "");

                var result = setVision({
                    id: picked.id,
                    name: picked.name
                });

                if (!result.ok) {
                    showFormMessage(actionMsg, "error", result.message);
                    return;
                }

                showFormMessage(actionMsg, "success", "\"" + picked.name + "\" saved!");
                flashMessage("success", "Vision saved: " + picked.name);

                window.setTimeout(function () {
                    if (hasActiveBooking() && isEditMode()) {
                        goToStep("my-plan");
                    } else {
                        goToStep("target");
                    }
                }, 600);
            };
        })(vision));

        container.appendChild(card);
    }
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initVisionPage);
}
