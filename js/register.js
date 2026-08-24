function initRegisterPage() {
    var form = document.getElementById("register-form");
    if (!form) {
        return;
    }

    if (isLoggedIn()) {
        goToStep(hasActiveBooking() ? "my-plan" : "vision");
        return;
    }

    if (form.dataset.bound === "1") {
        return;
    }

    form.dataset.bound = "1";

    var error = document.getElementById("register-error");
    var success = document.getElementById("register-success");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showFormMessage(error, "error", "");
        showFormMessage(success, "success", "");

        var name = document.getElementById("name").value.trim();
        var email = document.getElementById("email").value.trim();
        var password = document.getElementById("password").value;
        var confirm = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirm) {
            showFormMessage(error, "error", "Please fill in every field.");
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage(error, "error", "Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            showFormMessage(error, "error", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirm) {
            showFormMessage(error, "error", "Passwords do not match.");
            return;
        }

        var result = registerUser(name, email, password);
        if (!result.ok) {
            showFormMessage(error, "error", result.message);
            return;
        }

        showFormMessage(success, "success", "Account created successfully!");
        flashMessage("success", "Welcome, " + result.user.name.split(" ")[0] + "! Let's plan your wedding.");
        renderNavAuth();

        window.setTimeout(function () {
            goToStep(getPostLoginStep());
        }, 800);
    });
}

if (!window.PLANNER_MODE) {
    document.addEventListener("DOMContentLoaded", initRegisterPage);
}
