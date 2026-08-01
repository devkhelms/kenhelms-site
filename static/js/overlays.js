(function () {
  var openCount = 0;

  function syncBodyLock() {
    var root = document.getElementById("app-overlays");
    var locked = openCount > 0;
    document.documentElement.classList.toggle("overlay-open", locked);
    if (root) root.setAttribute("aria-hidden", locked ? "false" : "true");
  }

  window.setOverlayOpen = function (el, open) {
    if (!el) return;
    var wasOpen = !el.hidden && !el.classList.contains("is-hidden");

    if (open) {
      el.classList.remove("is-hidden");
      el.removeAttribute("hidden");
    } else {
      el.classList.add("is-hidden");
      el.setAttribute("hidden", "");
    }

    el.setAttribute("aria-hidden", open ? "false" : "true");

    if (open && !wasOpen) openCount += 1;
    if (!open && wasOpen) openCount = Math.max(0, openCount - 1);
    syncBodyLock();
  };
})();
