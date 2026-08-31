var lightboxEl = null;

function ensureImageLightbox() {
    if (lightboxEl) {
        return lightboxEl;
    }

    lightboxEl = document.createElement("div");
    lightboxEl.id = "image-lightbox";
    lightboxEl.className = "image-lightbox";
    lightboxEl.hidden = true;
    lightboxEl.innerHTML =
        '<div class="image-lightbox-backdrop" data-lightbox-close></div>' +
        '<div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Full size image">' +
        '<button type="button" class="image-lightbox-close" data-lightbox-close aria-label="Close">' +
        '<i class="fa-solid fa-xmark"></i></button>' +
        '<p class="image-lightbox-caption" id="image-lightbox-caption"></p>' +
        '<div class="image-lightbox-frame">' +
        '<img id="image-lightbox-img" class="image-lightbox-img" src="" alt="">' +
        "</div></div>";

    document.body.appendChild(lightboxEl);

    lightboxEl.addEventListener("click", function (event) {
        if (event.target.closest("[data-lightbox-close]")) {
            closeImageLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightboxEl && !lightboxEl.hidden) {
            closeImageLightbox();
        }
    });

    return lightboxEl;
}

function openImageLightbox(src, alt) {
    var box = ensureImageLightbox();
    var img = document.getElementById("image-lightbox-img");
    var caption = document.getElementById("image-lightbox-caption");

    if (!img) {
        return;
    }

    img.src = src;
    img.alt = alt || "Wedding item";

    if (caption) {
        caption.textContent = alt || "";
    }

    box.hidden = false;
    document.body.classList.add("lightbox-open");
}

function closeImageLightbox() {
    if (!lightboxEl) {
        return;
    }

    lightboxEl.hidden = true;
    document.body.classList.remove("lightbox-open");

    var img = document.getElementById("image-lightbox-img");
    if (img) {
        img.src = "";
    }
}
