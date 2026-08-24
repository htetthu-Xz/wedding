var storageMemory = {};

function storageGet(key) {
    if (storageMemory[key] !== undefined) {
        return storageMemory[key];
    }

    var raw = null;

    try {
        raw = localStorage.getItem(key);
    } catch (err) {
        raw = null;
    }

    if (!raw) {
        try {
            raw = sessionStorage.getItem(key);
        } catch (err) {
            raw = null;
        }
    }

    if (!raw) {
        return null;
    }

    try {
        storageMemory[key] = JSON.parse(raw);
        return storageMemory[key];
    } catch (err) {
        return null;
    }
}

function storageSet(key, value) {
    storageMemory[key] = value;
    var raw = JSON.stringify(value);
    var saved = false;

    try {
        localStorage.setItem(key, raw);
        saved = true;
    } catch (err) {
        // ignore
    }

    try {
        sessionStorage.setItem(key, raw);
        saved = true;
    } catch (err) {
        // ignore
    }

    return saved;
}

function storageRemove(key) {
    delete storageMemory[key];
    try {
        localStorage.removeItem(key);
    } catch (err) {
        // ignore
    }
    try {
        sessionStorage.removeItem(key);
    } catch (err) {
        // ignore
    }
}

function isFileProtocol() {
    return window.location.protocol === "file:";
}

function showStorageWarning() {
    if (!isFileProtocol() || !window.PLANNER_MODE) {
        return;
    }

    var banner = document.getElementById("storage-warning");
    if (!banner) {
        return;
    }

    banner.hidden = false;
    banner.textContent =
        "Tip: Open planner.html and stay on this page while planning. " +
        "If data still disappears, run the project with Live Server or python -m http.server 8080.";
}
