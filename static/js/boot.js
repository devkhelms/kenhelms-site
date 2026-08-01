(function () {
  var STORAGE_KEY = "kenhelms-boot-seen";
  var bootLines = [
    "SITE(R) Command Shell Version 6.22",
    "(C) 1985-" + new Date().getFullYear(),
    "HIMEM is testing extended memory ... done.",
    "Loading CONFIG.SYS ... OK",
    "",
    "C:\\SITE> welcome.bat",
    "Loading portfolio module ... OK",
    "640K ought to be enough for anybody.",
  ];
  var rebootLines = [
    "C:\\SITE> shutdown /r",
    "Closing open windows ... OK",
    "Saving settings ... OK",
    "Stopping portfolio module ... OK",
    "",
    "Restarting system ...",
  ];

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function skipBoot() {
    document.documentElement.classList.remove("boot-active", "boot-rebooting");
    document.documentElement.classList.add("boot-skip");
    var overlay = document.getElementById("boot-overlay");
    if (overlay) {
      overlay.classList.add("is-hidden");
      overlay.hidden = true;
      overlay.classList.remove("is-reboot-fade");
    }
  }

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
    skipBoot();
  }

  function decorateLine(text) {
    var p = document.createElement("p");
    if (text.indexOf("C:\\SITE>") === 0) p.className = "boot-spacer";
    if (text.indexOf("640K") === 0) p.className = "boot-muted";
    if (text.indexOf("Restarting") === 0) p.className = "boot-muted";
    p.textContent = text;
    return p;
  }

  function lineDelay(text, slow) {
    if (prefersReducedMotion()) return text === "" ? 40 : 60;
    if (slow) return text === "" ? 280 : 520;
    return text === "" ? 120 : 220;
  }

  function playSequence(lines, options) {
    var overlay = document.getElementById("boot-overlay");
    var container = document.getElementById("boot-overlay-lines");
    var prompt = overlay ? overlay.querySelector(".boot-overlay-prompt") : null;
    if (!overlay || !container) {
      if (options.onComplete) options.onComplete();
      return;
    }

    container.innerHTML = "";
    overlay.classList.remove("is-hidden", "is-fading", "is-reboot-fade");
    overlay.hidden = false;
    overlay.style.pointerEvents = "";
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.remove("boot-skip");
    document.documentElement.classList.add("boot-active");
    if (options.rebooting) document.documentElement.classList.add("boot-rebooting");
    if (prompt) prompt.style.visibility = options.rebooting ? "hidden" : "";

    var index = 0;
    var slow = !!options.slow;

    function nextLine() {
      if (index >= lines.length) {
        if (options.onComplete) options.onComplete();
        return;
      }

      var text = lines[index];
      container.appendChild(decorateLine(text));
      index += 1;
      setTimeout(nextLine, lineDelay(text, slow));
    }

    nextLine();
  }

  function finishBoot() {
    var overlay = document.getElementById("boot-overlay");
    if (!overlay) {
      markSeen();
      return;
    }

    setTimeout(function () {
      if (overlay) overlay.style.pointerEvents = "none";
      overlay.classList.add("is-fading");
      setTimeout(markSeen, prefersReducedMotion() ? 80 : 320);
    }, prefersReducedMotion() ? 80 : 450);
  }

  function runBoot() {
    playSequence(bootLines, {
      slow: false,
      rebooting: false,
      onComplete: finishBoot,
    });
  }

  function reboot() {
    playSequence(rebootLines, {
      slow: true,
      rebooting: true,
      onComplete: function () {
        var overlay = document.getElementById("boot-overlay");
        var fadeMs = prefersReducedMotion() ? 120 : 1200;
        var holdMs = prefersReducedMotion() ? 60 : 500;

        if (overlay) overlay.classList.add("is-reboot-fade", "is-fading");

        setTimeout(function () {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            /* ignore */
          }
          window.location.reload();
        }, fadeMs + holdMs);
      },
    });
  }

  function init() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        skipBoot();
        return;
      }
    } catch (e) {
      skipBoot();
      return;
    }
    runBoot();
  }

  window.SiteBoot = { reboot: reboot };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
