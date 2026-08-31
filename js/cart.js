var STORAGE_KEY = "weddingCart";
var memoryCart = null;

function emptyChoices() {
    var choices = {};
    var list = window.SERVICES || [];
    for (var i = 0; i < list.length; i++) {
        choices[list[i].id] = null;
    }
    return choices;
}

function readStoredCart() {
    var parsed = storageGet(STORAGE_KEY);
    if (!parsed) {
        return {
            level: null,
            choices: emptyChoices()
        };
    }

    var choices = emptyChoices();
    var saved = parsed.choices || {};

    for (var key in choices) {
        if (saved[key] && saved[key].itemId && saved[key].itemName) {
            choices[key] = {
                itemId: saved[key].itemId,
                itemName: saved[key].itemName
            };
        }
    }

    return {
        level: parsed.level || null,
        choices: choices
    };
}

function findItem(serviceId, level, itemId) {
    var group = window.ITEMS && ITEMS[serviceId] && ITEMS[serviceId][level];
    if (!group) {
        return null;
    }

    for (var i = 0; i < group.length; i++) {
        if (group[i].id === itemId) {
            return group[i];
        }
    }

    return null;
}

function cartFromParams(params, baseCart) {
    var cart = baseCart || {
        level: null,
        choices: emptyChoices()
    };

    var level = params.get("level");
    if (!level || !window.PACKAGES || !PACKAGES[level]) {
        return cart;
    }

    if (cart.level !== level) {
        cart.level = level;
        cart.choices = emptyChoices();
    } else {
        cart.level = level;
    }

    var list = window.SERVICES || [];
    for (var i = 0; i < list.length; i++) {
        var serviceId = list[i].id;
        var itemId = params.get(serviceId);
        if (!itemId) {
            continue;
        }

        var item = findItem(serviceId, level, itemId);
        if (item) {
            cart.choices[serviceId] = {
                itemId: item.id,
                itemName: item.name
            };
        }
    }

    return cart;
}

function hydrateFromLocation() {
    var params = new URLSearchParams(window.location.search);
    if (!params.get("level")) {
        return getCart();
    }

    var cart = cartFromParams(params, readStoredCart());
    saveCart(cart);
    return cart;
}

function hydrateFromPlannerParams(params) {
    if (!params || !params.get("level")) {
        return getCart();
    }

    if (typeof hasVision === "function" && typeof hasTarget === "function") {
        if (!hasVision() || !hasTarget()) {
            try {
                if (window.history && history.replaceState) {
                    history.replaceState(null, "", "planner.html?step=vision");
                }
            } catch (err) {
                // ignore
            }
            return getCart();
        }
    }

    var cart = cartFromParams(params, readStoredCart());
    saveCart(cart);
    return cart;
}

function getCart() {
    if (!memoryCart) {
        memoryCart = readStoredCart();
    }
    return memoryCart;
}

function saveCart(cart) {
    memoryCart = cart;
    storageSet(STORAGE_KEY, cart);
}

function cartToSearch(extraLevel) {
    var cart = getCart();
    var params = new URLSearchParams();
    var level = extraLevel || cart.level;

    if (level) {
        params.set("level", level);
    }

    var choices = cart.choices || {};
    for (var key in choices) {
        if (choices[key] && choices[key].itemId && (!extraLevel || cart.level === extraLevel)) {
            params.set(key, choices[key].itemId);
        }
    }

    var query = params.toString();
    return query ? "?" + query : "";
}

function plannerHref(level) {
    if (window.PLANNER_MODE) {
        var q = cartToSearch(level);
        if (q) {
            return "planner.html?step=choose&" + q.substring(1);
        }
        return "planner.html?step=choose&level=" + encodeURIComponent(level);
    }
    return "package-services.html" + cartToSearch(level);
}

function checkoutHref() {
    if (window.PLANNER_MODE) {
        var q = cartToSearch();
        return "planner.html?step=checkout" + (q ? "&" + q.substring(1) : "");
    }
    return "checkout.html" + cartToSearch();
}

function setLevel(levelId) {
    if (!levelId || !window.PACKAGES || !PACKAGES[levelId]) {
        return { changed: false, cleared: false };
    }

    var cart = getCart();
    var changed = cart.level !== levelId;
    var cleared = false;

    if (changed) {
        cart.level = levelId;
        cart.choices = emptyChoices();
        cleared = true;
        saveCart(cart);
    } else if (!cart.level) {
        cart.level = levelId;
        saveCart(cart);
    }

    updateCartLinks();
    return { changed: changed, cleared: cleared, levelId: levelId };
}

function chooseItem(serviceId, item) {
    var cart = getCart();
    var serviceName = serviceId;

    if (window.SERVICES) {
        for (var i = 0; i < SERVICES.length; i++) {
            if (SERVICES[i].id === serviceId) {
                serviceName = SERVICES[i].name;
                break;
            }
        }
    }

    cart.choices[serviceId] = {
        itemId: item.id,
        itemName: item.name
    };
    saveCart(cart);
    syncPageUrl();
    updateCartLinks();

    return {
        ok: true,
        serviceName: serviceName,
        itemName: item.name,
        count: chosenCount(),
        complete: isComplete()
    };
}

function getChoice(serviceId) {
    return getCart().choices[serviceId] || null;
}

function chosenCount() {
    var choices = getCart().choices;
    var count = 0;
    for (var key in choices) {
        if (choices[key]) {
            count += 1;
        }
    }
    return count;
}

function isComplete() {
    var list = window.SERVICES || [];
    return list.length > 0 && chosenCount() === list.length;
}

function getTotal() {
    var cart = getCart();
    if (!cart.level || !window.PACKAGES || !PACKAGES[cart.level]) {
        return 0;
    }
    return PACKAGES[cart.level].price;
}

function formatMMK(n) {
    return Number(n).toLocaleString("en-US") + " MMK";
}

function clearCart() {
    saveCart({
        level: null,
        choices: emptyChoices()
    });
    updateCartLinks();
}

function syncPageUrl() {
    var cart = getCart();
    if (!cart.level || !window.history || !history.replaceState) {
        return;
    }

    if (window.PLANNER_MODE) {
        try {
            var params = new URLSearchParams();
            params.set("step", "choose");
            params.set("level", cart.level);
            if (typeof isBrowseMode === "function" && isBrowseMode()) {
                params.set("browse", "1");
            }
            var choices = cart.choices || {};
            for (var key in choices) {
                if (choices[key] && choices[key].itemId) {
                    params.set(key, choices[key].itemId);
                }
            }
            history.replaceState(null, "", "planner.html?" + params.toString());
        } catch (err) {
            // ignore
        }
        return;
    }

    var file = window.location.pathname.split("/").pop();
    if (!file) {
        return;
    }

    try {
        history.replaceState(null, "", file + cartToSearch());
    } catch (err) {
        // ignore
    }
}

function updateCartLinks() {
    var text = "Cart (" + chosenCount() + "/8)";
    var checkoutUrl = checkoutHref();
    var cart = getCart();

    var links = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < links.length; i++) {
        links[i].textContent = text;
        if (cart.level) {
            links[i].setAttribute("href", checkoutUrl);
        }
    }

    var checkoutLinks = document.querySelectorAll("[data-checkout-link]");
    for (var j = 0; j < checkoutLinks.length; j++) {
        checkoutLinks[j].setAttribute("href", cart.level ? checkoutUrl : "service.html");
    }

    var status = document.getElementById("planner-status");
    if (status) {
        status.textContent = chosenCount() + " / 8 chosen";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    hydrateFromLocation();
    updateCartLinks();
});
