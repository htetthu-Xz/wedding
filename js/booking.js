var BOOKINGS_KEY = "weddingBookings";

function readBookings() {
    var list = storageGet(BOOKINGS_KEY);
    return list || [];
}

function saveBookings(list) {
    return storageSet(BOOKINGS_KEY, list);
}

function getUserBooking(userId) {
    if (!userId) {
        return null;
    }

    var list = readBookings();
    for (var i = 0; i < list.length; i++) {
        if (list[i].userId === userId) {
            return list[i];
        }
    }
    return null;
}

function getActiveBooking() {
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session) {
        return null;
    }
    return getUserBooking(session.userId);
}

function hasActiveBooking() {
    return !!getActiveBooking();
}

function isEditMode() {
    try {
        return new URLSearchParams(window.location.search).get("edit") === "1";
    } catch (err) {
        return false;
    }
}

function cloneCartForBooking(cart) {
    var choices = {};
    var list = window.SERVICES || [];
    var saved = cart.choices || {};

    for (var i = 0; i < list.length; i++) {
        var key = list[i].id;
        if (saved[key] && saved[key].itemId && saved[key].itemName) {
            choices[key] = {
                itemId: saved[key].itemId,
                itemName: saved[key].itemName
            };
        } else {
            choices[key] = null;
        }
    }

    return {
        level: cart.level || null,
        choices: choices
    };
}

function applyBookingToWorkspace(booking) {
    if (!booking) {
        return;
    }

    savePlan({
        vision: booking.vision || null,
        target: booking.target || null
    });

    if (typeof saveCart === "function" && booking.cart) {
        saveCart(cloneCartForBooking(booking.cart));
    }
}

function loadSessionBooking() {
    var booking = getActiveBooking();
    if (booking) {
        applyBookingToWorkspace(booking);
    }
    return booking;
}

function clearBookingWorkspace() {
    if (typeof clearPlan === "function") {
        clearPlan();
    }
    if (typeof clearCart === "function") {
        clearCart();
    }
    if (typeof storageRemove === "function") {
        storageRemove("weddingPlan");
        storageRemove("weddingCart");
    }
}

function saveUserBooking() {
    var session = getSession();
    if (!session) {
        return { ok: false, message: "You must be logged in to save a booking." };
    }

    var plan = getPlan();
    var cart = getCart();

    if (!plan.vision || !plan.target || !cart.level) {
        return { ok: false, message: "Plan is incomplete." };
    }

    var booking = {
        userId: session.userId,
        vision: plan.vision,
        target: plan.target,
        cart: cloneCartForBooking(cart),
        bookedAt: new Date().toISOString(),
        status: "confirmed"
    };

    var list = readBookings();
    var replaced = false;

    for (var i = 0; i < list.length; i++) {
        if (list[i].userId === session.userId) {
            booking.bookedAt = list[i].bookedAt || booking.bookedAt;
            booking.updatedAt = new Date().toISOString();
            list[i] = booking;
            replaced = true;
            break;
        }
    }

    if (!replaced) {
        list.push(booking);
    }

    if (!saveBookings(list)) {
        return { ok: false, message: "Could not save booking. Browser storage may be blocked." };
    }

    applyBookingToWorkspace(booking);
    return { ok: true, booking: booking };
}

function getPostLoginStep() {
    if (hasActiveBooking()) {
        return "my-plan";
    }

    if (hasVision() && hasTarget()) {
        return "packages";
    }

    if (hasVision()) {
        return "target";
    }

    return "vision";
}

function shouldBlockNewPlanning(step) {
    if (!hasActiveBooking() || isEditMode()) {
        return false;
    }

    return step === "register" || step === "vision";
}

function formatBookedDate(iso) {
    if (!iso) {
        return "Recently";
    }

    try {
        var d = new Date(iso);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    } catch (err) {
        return iso;
    }
}
