function recommendPackage(budget) {
    var amount = Number(budget) || 0;
    if (amount < 4000000) {
        return "basic";
    }
    if (amount < 9000000) {
        return "standard";
    }
    return "premium";
}

function budgetDiff(budget, packagePrice) {
    return Number(budget) - Number(packagePrice);
}

function costPerGuest(packagePrice, guests) {
    var count = Number(guests) || 1;
    if (count < 1) {
        count = 1;
    }
    return Math.round(Number(packagePrice) / count);
}

function daysUntilWedding(dateString) {
    if (!dateString) {
        return 0;
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var wedding = new Date(dateString);
    if (isNaN(wedding.getTime())) {
        return 0;
    }
    wedding.setHours(0, 0, 0, 0);
    var diff = wedding.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function guestTier(guests) {
    var count = Number(guests) || 0;
    if (count < 50) {
        return "Small wedding";
    }
    if (count <= 150) {
        return "Medium wedding";
    }
    return "Large wedding";
}

function completionPercent(chosen, total) {
    if (!total) {
        return 0;
    }
    return Math.round((chosen / total) * 100);
}

function budgetUsagePercent(budget, packagePrice) {
    var b = Number(budget) || 0;
    if (!b) {
        return 0;
    }
    return Math.round((Number(packagePrice) / b) * 100);
}

function savingsFromPremium(chosenPrice) {
    if (!window.PACKAGES || !PACKAGES.premium) {
        return 0;
    }
    return Math.max(0, PACKAGES.premium.price - Number(chosenPrice));
}
