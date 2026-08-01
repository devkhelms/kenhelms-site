(function () {
  var STORAGE_KEY = "kenhelms-boot-seen";
  var lines = [
    "SITE(R) Command Shell Version 6.22",
    "(C) 1985-" + new Date().getFullYear(),
    "HIMEM is testing extended memory ... done.",
    "Loading CONFIG.SYS ... OK",
    "",
    "C:\\SITE> welcome.bat",
    "Loading portfolio module ... OK",
    "640K ought to be enough for anybody.",
  ];

  function skipBoot() {
    document.documentElement.classList.remove("boot-active");
    document.documentElement.classList.add("boot-skip");
    var overlay = document.getElementById("boot-overlay");
    if (overlay) overlay.classList.add("is-hidden");
  }

  function markSeen() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
    skipBoot();
  }

  function runBoot() {
    var overlay = document.getElementById("boot-overlay");
    var container = document.getElementById("boot-overlay-lines");
    if (!overlay || !container) {
      markSeen();
      return;
    }

    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("boot-active");

    var index = 0;

    function nextLine() {
      if (index >= lines.length) {
        setTimeout(function () {
          overlay.classList.add("is-fading");
          setTimeout(markSeen, 320);
        }, 450);
        return;
      }

      var text = lines[index];
      var p = document.createElement("p");
      if (text.indexOf("C:\\SITE>") === 0) p.className = "boot-spacer";
      if (text.indexOf("640K") === 0) p.className = "boot-muted";
      p.textContent = text;
      container.appendChild(p);
      index += 1;
      setTimeout(nextLine, text === "" ? 120 : 220);
    }

    nextLine();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
