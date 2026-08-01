(function () {
  window.setOverlayOpen = function (el, open) {
    if (!el) return;
    el.classList.toggle("is-hidden", !open);
    el.hidden = !open;
    el.setAttribute("aria-hidden", open ? "false" : "true");
  };
})();
