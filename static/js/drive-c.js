(function () {
  var explorerOverlay, imageOverlay, imageEl, imageTitleEl;
  var bound = false;

  function init() {
    explorerOverlay = document.getElementById("drive-c-overlay");
    imageOverlay = document.getElementById("drive-c-image-overlay");
    imageEl = document.getElementById("drive-c-image");
    imageTitleEl = document.getElementById("drive-c-image-title");

    if (!explorerOverlay) return;

    if (!bound) {
      bound = true;

      explorerOverlay.querySelector(".drive-c-close").addEventListener("click", closeExplorer);
      explorerOverlay.addEventListener("click", function (e) {
        if (e.target === explorerOverlay) closeExplorer();
      });

      explorerOverlay.querySelectorAll(".drive-folder-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          openImage(btn.getAttribute("data-image"), btn.getAttribute("data-title"));
        });
      });

      if (imageOverlay) {
        imageOverlay.querySelector(".drive-c-image-close").addEventListener("click", closeImage);
        imageOverlay.addEventListener("click", function (e) {
          if (e.target === imageOverlay) closeImage();
        });
      }

      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        if (imageOverlay && !imageOverlay.classList.contains("is-hidden")) closeImage();
        else if (explorerOverlay && !explorerOverlay.classList.contains("is-hidden")) closeExplorer();
      });
    }
  }

  function openExplorer() {
    init();
    if (!explorerOverlay) return;

    closeImage();
    explorerOverlay.classList.remove("is-hidden");
    explorerOverlay.setAttribute("aria-hidden", "false");
  }

  function closeExplorer() {
    if (!explorerOverlay) return;
    explorerOverlay.classList.add("is-hidden");
    explorerOverlay.setAttribute("aria-hidden", "true");
    closeImage();
  }

  function openImage(key, title) {
    if (!imageOverlay || !imageEl) return;

    var src = imageEl.getAttribute("data-" + key) || "";
    if (!src) return;

    if (imageTitleEl && title) imageTitleEl.textContent = title;
    imageEl.src = src;
    imageEl.alt = title || "Image";

    imageOverlay.classList.remove("is-hidden");
    imageOverlay.setAttribute("aria-hidden", "false");
  }

  function closeImage() {
    if (!imageOverlay) return;
    imageOverlay.classList.add("is-hidden");
    imageOverlay.setAttribute("aria-hidden", "true");
    if (imageEl) {
      imageEl.removeAttribute("src");
      imageEl.alt = "";
    }
  }

  window.DriveC = {
    open: openExplorer,
    close: closeExplorer,
  };
})();
