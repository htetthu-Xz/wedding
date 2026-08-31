var chooseActiveIndex = 0;

function findUnchosenIndex(start) {
    var list = window.SERVICES || [];
    for (var i = start; i < list.length; i++) {
        if (!getChoice(list[i].id)) {
            return i;
        }
    }
    for (var j = 0; j < start; j++) {
        if (!getChoice(list[j].id)) {
            return j;
        }
    }
    return -1;
}

function firstChooseIndex() {
    var idx = findUnchosenIndex(0);
    return idx === -1 ? 0 : idx;
}

function initChoosePage(options) {
    options = options || {};
    var params = new URLSearchParams(window.location.search);
    var browsing = options.browse || (typeof isBrowseMode === "function" && isBrowseMode());
    var level = options.level || params.get("level") || getCart().level;
    var actionMsg = document.getElementById("planner-action-message");

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

    if (!level || !PACKAGES[level]) {
        showPageMessage("page-message", "error", "Please choose a package first.");
        window.setTimeout(function () {
            goToStep("packages");
        }, 1200);
        return;
    }

    if (window.PLANNER_MODE) {
        hydrateFromPlannerParams(params);
    } else {
        hydrateFromLocation();
    }

    var levelResult = setLevel(level);
    if (levelResult.cleared && !options.skipClearMessage) {
        showFormMessage(actionMsg, "info", "Package changed. Please choose all 8 items again.");
    }

    syncPageUrl();
    renderFlowSteps("choose");

    var pkg = PACKAGES[level];
    var titleEl = document.getElementById("page-title");
    var priceEl = document.getElementById("page-price");
    var badgeEl = document.getElementById("choose-package-badge");
    var root = document.getElementById("planner-root");
    var sidebar = document.getElementById("choose-sidebar");
    var prevBtn = document.getElementById("choose-prev");
    var nextBtn = document.getElementById("choose-next");

    if (titleEl) {
        titleEl.textContent = "Curate your " + pkg.name + " wedding";
    }
    if (priceEl) {
        priceEl.textContent = formatMMK(pkg.price) + " bundle · 8 services · 1 pick each";
    }
    if (badgeEl) {
        badgeEl.textContent = pkg.name + " package";
    }

    chooseActiveIndex = firstChooseIndex();

    function showChooseMessage(result) {
        if (!actionMsg || !result || !result.ok) {
            return;
        }

        var text = result.serviceName + ": \"" + result.itemName + "\" selected (" + result.count + "/8).";
        if (result.complete) {
            text += " All services complete — ready for checkout!";
        }
        showFormMessage(actionMsg, "success", text);
    }

    function updateProgress() {
        var progressWrap = document.getElementById("planner-progress");
        if (!progressWrap) {
            return;
        }

        var count = chosenCount();
        var percent = completionPercent(count, SERVICES.length);
        var dots = "";

        for (var d = 0; d < SERVICES.length; d++) {
            var dotClass = "choose-dot";
            if (getChoice(SERVICES[d].id)) {
                dotClass += " is-done";
            }
            if (d === chooseActiveIndex) {
                dotClass += " is-active";
            }
            dots += '<span class="' + dotClass + '" title="' + SERVICES[d].name + '"></span>';
        }

        progressWrap.innerHTML =
            '<div class="choose-progress-top">' +
            '<span class="choose-progress-count">' + count + ' of 8 complete</span>' +
            '<span class="choose-progress-percent">' + percent + '%</span>' +
            "</div>" +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
            '<div class="choose-dots">' + dots + "</div>";
    }

    function updateNavButtons() {
        if (prevBtn) {
            prevBtn.disabled = chooseActiveIndex === 0;
        }

        if (!nextBtn) {
            return;
        }

        if (isComplete()) {
            nextBtn.innerHTML = "Checkout <i class=\"fa-solid fa-arrow-right\"></i>";
            nextBtn.dataset.mode = "checkout";
        } else if (chooseActiveIndex >= SERVICES.length - 1) {
            nextBtn.innerHTML = "Find missing items <i class=\"fa-solid fa-search\"></i>";
            nextBtn.dataset.mode = "find";
        } else {
            nextBtn.innerHTML = "Next service <i class=\"fa-solid fa-arrow-right\"></i>";
            nextBtn.dataset.mode = "next";
        }
    }

    function renderSidebar() {
        if (!sidebar) {
            return;
        }

        sidebar.innerHTML = "";
        var heading = document.createElement("p");
        heading.className = "choose-sidebar-title";
        heading.textContent = "Your 8 services";
        sidebar.appendChild(heading);

        var list = document.createElement("div");
        list.className = "choose-service-list";

        for (var i = 0; i < SERVICES.length; i++) {
            var service = SERVICES[i];
            var choice = getChoice(service.id);
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "choose-service-pill";

            if (i === chooseActiveIndex) {
                btn.className += " is-active";
            }
            if (choice) {
                btn.className += " is-done";
            }

            var icon = document.createElement("span");
            icon.className = "pill-icon";
            icon.textContent = service.icon;

            var text = document.createElement("span");
            text.className = "pill-text";
            text.textContent = service.name;

            var status = document.createElement("span");
            status.className = "pill-status";
            if (choice) {
                status.innerHTML = "<i class=\"fa-solid fa-check\"></i>";
            } else {
                status.textContent = String(i + 1);
            }

            btn.appendChild(icon);
            btn.appendChild(text);
            btn.appendChild(status);

            btn.addEventListener("click", (function (idx) {
                return function () {
                    chooseActiveIndex = idx;
                    renderChooseView();
                };
            })(i));

            list.appendChild(btn);
        }

        sidebar.appendChild(list);
    }

    function renderMain() {
        if (!root) {
            return;
        }

        root.innerHTML = "";
        var service = SERVICES[chooseActiveIndex];
        var choice = getChoice(service.id);
        var items = (ITEMS[service.id] && ITEMS[service.id][level]) || [];

        var panel = document.createElement("div");
        panel.className = "choose-service-panel";

        var header = document.createElement("div");
        header.className = "choose-panel-header";

        var iconWrap = document.createElement("div");
        iconWrap.className = "choose-panel-icon";
        iconWrap.textContent = service.icon;

        var headerText = document.createElement("div");
        var h2 = document.createElement("h2");
        h2.textContent = service.name;
        var blurb = document.createElement("p");
        blurb.className = "choose-panel-blurb";
        blurb.textContent = service.blurb;

        var current = document.createElement("p");
        current.className = "choose-current";
        if (choice) {
            current.innerHTML = "<i class=\"fa-solid fa-heart\"></i> Selected: <strong>" + choice.itemName + "</strong>";
        } else {
            current.className += " is-empty";
            current.textContent = "Tap an option below to select";
        }

        headerText.appendChild(h2);
        headerText.appendChild(blurb);
        headerText.appendChild(current);
        header.appendChild(iconWrap);
        header.appendChild(headerText);
        panel.appendChild(header);

        var grid = document.createElement("div");
        grid.className = "choose-item-grid";

        if (!items.length) {
            var empty = document.createElement("p");
            empty.className = "choose-empty";
            empty.textContent = "No items available for this service at this package level.";
            panel.appendChild(empty);
        }

        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var isChosen = choice && choice.itemId === item.id;
            var card = document.createElement("div");
            card.className = "choose-item-card" + (isChosen ? " is-selected" : "");
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            var visual = document.createElement("div");
            visual.className = "choose-item-visual";

            var photo = document.createElement("img");
            photo.className = "choose-item-photo";
            photo.src = getItemImage(service.id, item);
            photo.alt = item.name;
            photo.loading = "lazy";
            photo.decoding = "async";
            photo.addEventListener("error", function () {
                if (photo.src.indexOf(DEFAULT_ITEM_IMAGE) === -1) {
                    photo.src = DEFAULT_ITEM_IMAGE;
                }
            });

            var zoomBtn = document.createElement("button");
            zoomBtn.type = "button";
            zoomBtn.className = "choose-item-zoom";
            zoomBtn.setAttribute("aria-label", "View full image of " + item.name);
            zoomBtn.innerHTML = "<i class=\"fa-solid fa-magnifying-glass-plus\"></i>";
            zoomBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                openImageLightbox(photo.src, item.name);
            });

            photo.addEventListener("click", function (event) {
                event.stopPropagation();
                openImageLightbox(photo.src, item.name);
            });

            visual.appendChild(photo);
            visual.appendChild(zoomBtn);

            if (isChosen) {
                var badge = document.createElement("span");
                badge.className = "choose-item-badge";
                badge.innerHTML = "<i class=\"fa-solid fa-check\"></i>";
                visual.appendChild(badge);
            }

            var name = document.createElement("span");
            name.className = "choose-item-name";
            name.textContent = item.name;

            var action = document.createElement("span");
            action.className = "choose-item-action";
            action.textContent = isChosen ? "Chosen" : "Select";

            card.appendChild(visual);
            card.appendChild(name);
            card.appendChild(action);

            card.addEventListener("click", (function (serviceId, picked) {
                return function () {
                    var result = chooseItem(serviceId, picked);
                    showChooseMessage(result);

                    if (result.complete) {
                        flashMessage("success", "All 8 services chosen! You can checkout now.");
                    } else if (!getChoice(SERVICES[chooseActiveIndex].id)) {
                        var nextIdx = findUnchosenIndex(chooseActiveIndex + 1);
                        if (nextIdx !== -1) {
                            chooseActiveIndex = nextIdx;
                        }
                    }

                    renderChooseView();
                };
            })(service.id, item));

            grid.appendChild(card);
        }

        panel.appendChild(grid);
        root.appendChild(panel);
    }

    function renderChooseView() {
        renderSidebar();
        renderMain();
        updateProgress();
        updateNavButtons();
        updateCartLinks();
    }

    if (prevBtn && prevBtn.dataset.bound !== "1") {
        prevBtn.dataset.bound = "1";
        prevBtn.addEventListener("click", function () {
            if (chooseActiveIndex > 0) {
                chooseActiveIndex -= 1;
                renderChooseView();
            }
        });
    }

    if (nextBtn && nextBtn.dataset.bound !== "1") {
        nextBtn.dataset.bound = "1";
        nextBtn.addEventListener("click", function () {
            var mode = nextBtn.dataset.mode;

            if (mode === "checkout") {
                goToStep("checkout");
                return;
            }

            if (mode === "find") {
                var missing = findUnchosenIndex(0);
                if (missing !== -1) {
                    chooseActiveIndex = missing;
                    renderChooseView();
                }
                return;
            }

            if (chooseActiveIndex < SERVICES.length - 1) {
                chooseActiveIndex += 1;
                renderChooseView();
            }
        });
    }

    var changePkg = document.getElementById("choose-change-pkg");
    if (changePkg && changePkg.dataset.bound !== "1") {
        changePkg.dataset.bound = "1";
        changePkg.addEventListener("click", function (event) {
            event.preventDefault();
            goToStep("packages", { browse: browsing });
        });
    }

    renderChooseView();
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", function () {
        initChoosePage();
    });
}
