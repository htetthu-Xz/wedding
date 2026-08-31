function showFormMessage(element, type, message) {
    if (!element) {
        return;
    }

    element.textContent = message || "";
    element.className = "form-message";
    element.hidden = !message;

    if (!message) {
        return;
    }

    if (type === "success") {
        element.className = "form-message form-success";
    } else if (type === "error") {
        element.className = "form-message form-error";
    } else {
        element.className = "form-message form-info";
    }
}

function showPageMessage(elementId, type, message) {
    var el = document.getElementById(elementId);
    if (!el) {
        return;
    }

    if (!message) {
        el.hidden = true;
        el.textContent = "";
        el.className = "page-message";
        return;
    }

    el.hidden = false;
    el.textContent = message;
    el.className = "page-message page-message-" + type;
}

function flashMessage(type, message) {
    storageSet("weddingFlash", { type: type, message: message });
}

function readFlashMessage() {
    var flash = storageGet("weddingFlash");
    storageRemove("weddingFlash");
    return flash;
}

function renderFlashMessage(elementId) {
    var flash = readFlashMessage();
    if (flash && flash.message) {
        showPageMessage(elementId, flash.type, flash.message);
    }
}

function getQueryMessage() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("msg");
    if (!type) {
        return null;
    }

    var messages = {
        login_required: {
            type: "info",
            message: "Please log in to complete your booking."
        },
        logged_out: {
            type: "success",
            message: "You have been logged out. Your plan is still saved on this browser."
        },
        registered: {
            type: "success",
            message: "Account created! Continue planning your wedding."
        }
    };

    return messages[type] || null;
}

function renderQueryMessage(elementId) {
    var msg = getQueryMessage();
    if (msg) {
        showPageMessage(elementId, msg.type, msg.message);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderFlashMessage("page-message");
    renderQueryMessage("page-message");
});
