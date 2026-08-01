(function () {
  function setStatus(text) {
    var el = document.getElementById("status-message");
    if (el) el.textContent = text;
  }

  function closeStartMenu() {
    var startMenu = document.getElementById("start-menu");
    if (startMenu) startMenu.classList.remove("is-open");
  }

  function focusPortfolio() {
    var win = document.getElementById("portfolio-window");
    if (!win) return;
    window.scrollTo(0, 0);
    if (win.scrollIntoView) {
      try {
        win.scrollIntoView({ block: "start", behavior: "instant" });
      } catch (e) {
        win.scrollIntoView(true);
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
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      action();
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

  function initStartMenu() {
    var startBtn = document.getElementById("start-btn");
    var startMenu = document.getElementById("start-menu");
    var startWrap = startBtn ? startBtn.closest(".start-wrap") : null;
    if (!startBtn || !startMenu) return;

    startBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      startMenu.classList.toggle("is-open");
    });

    startMenu.addEventListener("click", function (e) {
      var item = e.target.closest(".start-menu-item");
      if (!item || !item.id) return;
      e.preventDefault();
      e.stopPropagation();
      handleMenuAction(item.id);
    });

    document.addEventListener("click", function (e) {
      if (!startMenu.classList.contains("is-open")) return;
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
