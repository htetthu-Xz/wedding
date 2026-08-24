document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("weddingForm");
    var error = document.getElementById("contact-error");
    var success = document.getElementById("contact-success");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        showFormMessage(error, "error", "");
        showFormMessage(success, "success", "");

        var name = document.getElementById("fullName").value.trim();
        var phone = document.getElementById("phone").value.trim();
        var email = document.getElementById("email").value.trim();
        var date = document.getElementById("weddingDate").value;
        var location = document.getElementById("location").value.trim();
        var guests = Number(document.getElementById("guests").value);
        var packageName = document.getElementById("package").value;
        var budget = document.getElementById("budget").value;
        var message = document.getElementById("message").value.trim();

        if (!name || !phone || !email || !date || !location || !guests || !packageName || !budget || !message) {
            showFormMessage(error, "error", "Please fill in every field before submitting.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFormMessage(error, "error", "Please enter a valid email address.");
            return;
        }

        if (guests < 1) {
            showFormMessage(error, "error", "Number of guests must be at least 1.");
            return;
        }

        showFormMessage(
            success,
            "success",
            "Thank you, " + name + "! Your enquiry was sent successfully. We will contact you soon."
        );

        form.reset();
    });
});
