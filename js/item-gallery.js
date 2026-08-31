function createItemGallery(serviceId, item) {
    var sources = getItemImages(serviceId, item);
    var candidates = sources.concat([getItemImageFallback(serviceId), DEFAULT_ITEM_IMAGE]);
    var current = 0;

    var gallery = document.createElement("div");
    gallery.className = "item-gallery";
    gallery.setAttribute("role", "group");
    gallery.setAttribute("aria-label", item.name + " photos");

    var img = document.createElement("img");
    img.className = "choose-item-photo";
    img.alt = item.name;
    img.loading = "lazy";
    img.decoding = "async";

    var dotsWrap = document.createElement("div");
    dotsWrap.className = "gallery-dots";

    function loadImageForSlide(slideIndex) {
        var start = slideIndex * 3;
        var slideCandidates = [];

        if (sources[slideIndex]) {
            slideCandidates.push(sources[slideIndex]);
        }
        slideCandidates.push(getItemImageFallback(serviceId), DEFAULT_ITEM_IMAGE);

        var attempt = 0;
        img.onerror = function () {
            attempt += 1;
            if (attempt < slideCandidates.length) {
                img.src = slideCandidates[attempt];
            } else {
                img.onerror = null;
            }
        };
        img.src = slideCandidates[0];
    }

    function renderDots() {
        dotsWrap.innerHTML = "";
        if (sources.length <= 1) {
            return;
        }

        for (var d = 0; d < sources.length; d++) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "gallery-dot" + (d === current ? " is-active" : "");
            dot.setAttribute("aria-label", "Photo " + (d + 1));
            dot.addEventListener("click", (function (idx) {
                return function (event) {
                    event.stopPropagation();
                    showPhoto(idx);
                };
            })(d));
            dotsWrap.appendChild(dot);
        }
    }

    function showPhoto(index) {
        if (index < 0) {
            index = sources.length - 1;
        }
        if (index >= sources.length) {
            index = 0;
        }
        current = index;
        loadImageForSlide(current);
        renderDots();
    }

    if (sources.length > 1) {
        var prev = document.createElement("button");
        prev.type = "button";
        prev.className = "gallery-nav gallery-prev";
        prev.setAttribute("aria-label", "Previous photo");
        prev.innerHTML = "<i class=\"fa-solid fa-chevron-left\"></i>";
        prev.addEventListener("click", function (event) {
            event.stopPropagation();
            showPhoto(current - 1);
        });

        var next = document.createElement("button");
        next.type = "button";
        next.className = "gallery-nav gallery-next";
        next.setAttribute("aria-label", "Next photo");
        next.innerHTML = "<i class=\"fa-solid fa-chevron-right\"></i>";
        next.addEventListener("click", function (event) {
            event.stopPropagation();
            showPhoto(current + 1);
        });

        gallery.appendChild(prev);
        gallery.appendChild(next);
    }

    gallery.appendChild(img);
    gallery.appendChild(dotsWrap);
    showPhoto(0);

    return gallery;
}
