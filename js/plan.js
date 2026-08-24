var PLAN_KEY = "weddingPlan";

function emptyPlan() {
    return {
        vision: null,
        target: null
    };
}

function getPlan() {
    var plan = storageGet(PLAN_KEY);
    if (!plan) {
        return emptyPlan();
    }
    return {
        vision: plan.vision || null,
        target: plan.target || null
    };
}

function savePlan(plan) {
    return storageSet(PLAN_KEY, plan);
}

function setVision(vision) {
    var plan = getPlan();
    plan.vision = vision;
    if (!savePlan(plan)) {
        return { ok: false, message: "Could not save vision. Browser storage is blocked." };
    }
    return { ok: true };
}

function setTarget(target) {
    var plan = getPlan();
    plan.target = target;
    if (!savePlan(plan)) {
        return { ok: false, message: "Could not save target details. Browser storage is blocked." };
    }
    return { ok: true };
}

function hasVision() {
    return !!getPlan().vision;
}

function hasTarget() {
    return !!getPlan().target;
}

function clearPlan() {
    savePlan(emptyPlan());
}
