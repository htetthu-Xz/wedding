var USERS_KEY = "weddingUsers";
var SESSION_KEY = "weddingSession";

function readUsers() {
    var users = storageGet(USERS_KEY);
    return users || [];
}

function saveUsers(users) {
    return storageSet(USERS_KEY, users);
}

function getSession() {
    return storageGet(SESSION_KEY);
}

function setSession(user) {
    if (!storageSet(SESSION_KEY, {
        userId: user.id,
        name: user.name,
        email: user.email
    })) {
        return false;
    }
    return true;
}

function clearSession() {
    storageRemove(SESSION_KEY);
}

function isLoggedIn() {
    return !!getSession();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registerUser(name, email, password) {
    var users = readUsers();
    var normalizedEmail = email.trim().toLowerCase();
    var i;

    for (i = 0; i < users.length; i++) {
        if (users[i].email === normalizedEmail) {
            return { ok: false, message: "This email is already registered." };
        }
    }

    var user = {
        id: "user-" + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: password
    };

    users.push(user);
    if (!saveUsers(users)) {
        return { ok: false, message: "Could not save account. Browser storage is blocked or full." };
    }

    if (!setSession(user)) {
        return { ok: false, message: "Account created but login failed. Try logging in." };
    }

    return { ok: true, user: user };
}

function loginUser(email, password) {
    var users = readUsers();
    var normalizedEmail = email.trim().toLowerCase();
    var i;

    for (i = 0; i < users.length; i++) {
        if (users[i].email === normalizedEmail && users[i].password === password) {
            if (!setSession(users[i])) {
                return { ok: false, message: "Login failed. Browser storage may be blocked." };
            }
            return { ok: true, user: users[i] };
        }
    }

    return { ok: false, message: "Email or password is wrong." };
}

function logoutUser() {
    clearSession();
}

function getSafeReturnUrl() {
    if (window.PLANNER_MODE) {
        var params = new URLSearchParams(window.location.search);
        var returnStep = params.get("returnStep");

        if (returnStep) {
            return returnStep;
        }

        if (typeof getPostLoginStep === "function") {
            return getPostLoginStep();
        }

        return "checkout";
    }

    var params = new URLSearchParams(window.location.search);
    var raw = params.get("return");

    if (!raw) {
        return "vision.html";
    }

    if (raw.indexOf("http:") === 0 || raw.indexOf("https:") === 0 || raw.indexOf("//") === 0) {
        return "vision.html";
    }

    return raw;
}

function requireLoginForCheckout() {
    if (isLoggedIn()) {
        return true;
    }

    flashMessage("info", "Please log in to submit your booking.");

    if (window.PLANNER_MODE) {
        goToStep("login", { msg: "login_required", returnStep: "checkout" });
        return false;
    }

    var returnUrl = encodeURIComponent("checkout.html" + (typeof cartToSearch === "function" ? cartToSearch() : ""));
    window.location.href = "logIn.html?return=" + returnUrl + "&msg=login_required";
    return false;
}

function getReturnUrl() {
    return getSafeReturnUrl();
}
