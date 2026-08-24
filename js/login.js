function initLoginPage() {
    var form = document.getElementById("login-form");
    if (!form || form.dataset.bound === "1") {
        return;
    }
    form.dataset.bound = "1";

    var error = document.getElementById("login-error");
    var success = document.getElementById("login-success");
    var emailInput = document.getElementById("login-email");
    var passwordInput = document.getElementById("login-password");

    if (isLoggedIn()) {
        renderNavAuth();
        showFormMessage(success, "success", "You are already logged in. Redirecting...");
        window.setTimeout(function () {
            if (window.PLANNER_MODE) {
                goToStep(getSafeReturnUrl());
            } else {
                window.location.href = getReturnUrl();
            }
        }, 900);
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showFormMessage(error, "error", "");
        showFormMessage(success, "success", "");

        var email = emailInput ? emailInput.value : "";
        var password = passwordInput ? passwordInput.value : "";

        if (!email || !password) {
            showFormMessage(error, "error", "Please enter email and password.");
            return;
        }

        var result = loginUser(email, password);
        if (!result.ok) {
            showFormMessage(error, "error", result.message);
            return;
        }

        showFormMessage(success, "success", "Login successful! Redirecting...");
        renderNavAuth();
        window.setTimeout(function () {
            if (window.PLANNER_MODE) {
                goToStep(getSafeReturnUrl());
            } else {
                window.location.href = getReturnUrl();
            }
        }, 800);
    });
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initLoginPage);
}
