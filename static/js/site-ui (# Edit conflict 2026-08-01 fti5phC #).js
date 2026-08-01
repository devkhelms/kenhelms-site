(function () {
  function setStatus(text) {
    var el = document.getElementById("status-message");
    if (el) el.textContent = text;
  }

  function closeStartMenu() {
    var startMenu = document.getElementById("start-menu");
    if (startMenu) startMenu.classList.remove("is-open");
    document.documentElement.classList.remove("start-menu-open");
  }

  function openStartMenu() {
    var startMenu = document.getElementById("start-menu");
    if (!startMenu) return;
    startMenu.classList.add("is-open");
    document.documentElement.classList.add("start-menu-open");
  }

  function toggleStartMenu() {
    var startMenu = document.getElementById("start-menu");
    if (!startMenu) return;
    if (startMenu.classList.contains("is-open")) closeStartMenu();
    else openStartMenu();
  }

  function focusPortfolio() {
    var win = document.getElementById("portfolio-window");
    if (!win) return;
    window.scrollTo(0, 0);
    if (win.scrollIntoView) {
      try {
        win.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch (e) {
        try {
          win.scrollIntoView({ block: "center" });
        } catch (e2) {
          win.scrollIntoView(true);
        }
      }
    }
    win.classList.remove("is-highlight");
    void win.offsetWidth;
    win.classList.add("is-highlight");
    setStatus("Portfolio");
    setTimeout(function () {
      win.classList.remove("is-highlight");
      setStatus("Ready");
    }, 1200);
  }

  function openDriveCExplorer() {
    if (window.DriveC) window.DriveC.open();
  }

  function handleMenuAction(id) {
    closeStartMenu();
    switch (id) {
      case "launch-portfolio":
        focusPortfolio();
        break;
      case "launch-files":
        setStatus("C:\\");
        openDriveCExplorer();
        break;
      case "launch-snake":
        if (window.SnakeGame) window.SnakeGame.open();
        break;
      case "launch-contact":
        if (window.ContactForm) window.ContactForm.open();
        break;
      case "launch-passwords":
        if (window.PasswordsEgg) window.PasswordsEgg.open();
        break;
      case "launch-reboot":
        setStatus("Restarting...");
        if (window.SiteBoot && window.SiteBoot.reboot) window.SiteBoot.reboot();
        break;
      default:
        break;
    }
  }

  function bindActivate(el, action) {
    if (!el) return;
    var lastRun = 0;
    function run(e) {
      e.preventDefault();
      e.stopPropagation();
      var now = Date.now();
      if (now - lastRun < 450) return;
      lastRun = now;
      action();
    }
    el.addEventListener("click", run);
    el.addEventListener("pointerup", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      run(e);
    });
  }

  function bindStatusHints() {
    var defaults = {
      "focus-portfolio": "Open portfolio window",
      "open-passwords": "C:\\PASSWORDS.CSV",
      "open-drive-c": "C:\\",
      "open-contact": "Launch contact form",
      "launch-snake": "Snake",
      "launch-contact": "Contact",
      "launch-passwords": "PASSWORDS.CSV",
      "launch-portfolio": "Portfolio",
      "launch-files": "C:\\",
      "launch-reboot": "Restart system",
      "start-btn": "Start menu",
    };

    Object.keys(defaults).forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener("mouseenter", function () {
        setStatus(defaults[id]);
      });
      node.addEventListener("mouseleave", function () {
        setStatus("Ready");
      });
      node.addEventListener("focus", function () {
        setStatus(defaults[id]);
      });
      node.addEventListener("blur", function () {
        setStatus("Ready");
      });
    });
  }

  function bindMenuItem(id) {
    var item = document.getElementById(id);
    if (!item) return;
    bindActivate(item, function () {
      handleMenuAction(id);
    });
  }

  function initStartMenu() {
    var startBtn = document.getElementById("start-btn");
    var startMenu = document.getElementById("start-menu");
    var startWrap = startBtn ? startBtn.closest(".start-wrap") : null;
    if (!startBtn || !startMenu) return;

    bindActivate(startBtn, toggleStartMenu);

    [
      "launch-portfolio",
      "launch-files",
      "launch-snake",
      "launch-contact",
      "launch-passwords",
      "launch-reboot",
    ].forEach(bindMenuItem);

    document.addEventListener("pointerdown", function (e) {
      if (!startMenu.classList.contains("is-open")) return;
      if (startMenu.contains(e.target)) return;
      if (startWrap && startWrap.contains(e.target)) return;
      closeStartMenu();
    });
  }

  function initDesktopActions() {
    bindActivate(document.getElementById("open-contact"), function () {
      if (window.ContactForm) window.ContactForm.open();
    });
    bindActivate(document.getElementById("open-passwords"), function () {
      if (window.PasswordsEgg) window.PasswordsEgg.open();
    });
    bindActivate(document.getElementById("open-drive-c"), openDriveCExplorer);
    bindActivate(document.getElementById("focus-portfolio"), focusPortfolio);
  }

  function updateClock() {
    var el = document.getElementById("taskbar-clock");
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStartMenu();
    initDesktopActions();
    updateClock();
    setInterval(updateClock, 30000);
    bindStatusHints();
  });
})();
