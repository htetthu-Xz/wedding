function isBrowseMode() {
    try {
        return new URLSearchParams(window.location.search).get("browse") === "1";
    } catch (err) {
        return false;
    }
}

function servicesHref() {
    return "planner.html?step=packages&browse=1";
}

function preserveBrowseParam(params) {
    if (isBrowseMode()) {
        params.set("browse", "1");
    } else {
        params.delete("browse");
    }
    return params;
}
