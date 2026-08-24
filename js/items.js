document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var level = params.get("level") || getCart().level;
    var serviceId = params.get("id");

    if (!level || !PACKAGES[level]) {
        window.location.replace("service.html");
        return;
    }

    window.location.replace("package-services.html" + cartToSearch(level) + "#service-" + (serviceId || ""));
});
