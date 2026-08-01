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
    el.classList.toggle("is-hidden", !open);
    el.hidden = !open;
    el.setAttribute("aria-hidden", open ? "false" : "true");
    if (open && !wasOpen) openCount += 1;
    if (!open && wasOpen) openCount = Math.max(0, openCount - 1);
    syncBodyLock();
  };
})();
