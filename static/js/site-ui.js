(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function lazyLoader(src, ready) {
    var loaded = false;
    return function () {
      if (loaded && ready()) return Promise.resolve();
      if (loaded) {
        return new Promise(function (resolve) {
          var check = setInterval(function () {
            if (ready()) {
              clearInterval(check);
              resolve();
            }
          }, 20);
        });
      }
      loaded = true;
      return loadScript(src).then(function () {
        return new Promise(function (resolve) {
          var check = setInterval(function () {
            if (ready()) {
              clearInterval(check);
              resolve();
            }
          }, 20);
        });
      });
    };
  }

  function setStatus(text) {
    var el = document.getElementById("status-message");
    if (el) el.textContent = text;
  }

  function focusPortfolio() {
    var win = document.getElementById("portfolio-window");
    if (!win) return;
    win.scrollIntoView({ behavior: "smooth", block: "center" });
    win.classList.remove("is-highlight");
    void win.offsetWidth;
    win.classList.add("is-highlight");
    setStatus("Portfolio");
    setTimeout(function () {
      win.classList.remove("is-highlight");
      setStatus("Ready");
    }, 1200);
  }

  function updateClock() {
    var el = document.getElementById("taskbar-clock");
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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

    var projects = document.getElementById("projects");
    if (projects) {
      projects.addEventListener("mouseenter", function () {
        setStatus("Projects");
      });
      projects.addEventListener("mouseleave", function () {
        setStatus("Ready");
      });
    }

    var elsewhere = document.getElementById("elsewhere");
    if (elsewhere) {
      elsewhere.addEventListener("mouseenter", function () {
        setStatus("Elsewhere");
      });
      elsewhere.addEventListener("mouseleave", function () {
        setStatus("Ready");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var startBtn = document.getElementById("start-btn");
    var startMenu = document.getElementById("start-menu");

    if (startBtn && startMenu) {
      startBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        startMenu.classList.toggle("is-open");
      });
      document.addEventListener("click", function () {
        startMenu.classList.remove("is-open");
      });
      startMenu.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    var loadSnake = lazyLoader("/js/snake.js", function () {
      return !!window.SnakeGame;
    });

    var loadContact = lazyLoader("/js/contact.js", function () {
      return !!window.ContactForm;
    });

    var loadPasswords = lazyLoader("/js/passwords.js", function () {
      return !!window.PasswordsEgg;
    });

    var loadDriveC = lazyLoader("/js/drive-c.js", function () {
      return !!window.DriveC;
    });

    function openDriveCExplorer() {
      loadDriveC().then(function () {
        window.DriveC.open();
      });
    }

    var launchSnake = document.getElementById("launch-snake");
    if (launchSnake) {
      launchSnake.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        loadSnake().then(function () {
          window.SnakeGame.open();
        });
      });
    }

    var launchContact = document.getElementById("launch-contact");
    if (launchContact) {
      launchContact.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        loadContact().then(function () {
          window.ContactForm.open();
        });
      });
    }

    var launchPasswords = document.getElementById("launch-passwords");
    if (launchPasswords) {
      launchPasswords.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        loadPasswords().then(function () {
          window.PasswordsEgg.open();
        });
      });
    }

    var launchPortfolio = document.getElementById("launch-portfolio");
    if (launchPortfolio) {
      launchPortfolio.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        focusPortfolio();
      });
    }

    var launchFiles = document.getElementById("launch-files");
    if (launchFiles) {
      launchFiles.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        setStatus("C:\\");
        openDriveCExplorer();
      });
    }

    var launchReboot = document.getElementById("launch-reboot");
    if (launchReboot) {
      launchReboot.addEventListener("click", function () {
        if (startMenu) startMenu.classList.remove("is-open");
        setStatus("Restarting...");
        if (window.SiteBoot && window.SiteBoot.reboot) window.SiteBoot.reboot();
      });
    }

    var openContact = document.getElementById("open-contact");
    if (openContact) {
      openContact.addEventListener("click", function () {
        loadContact().then(function () {
          window.ContactForm.open();
        });
      });
    }

    var openPasswords = document.getElementById("open-passwords");
    if (openPasswords) {
      openPasswords.addEventListener("click", function () {
        loadPasswords().then(function () {
          window.PasswordsEgg.open();
        });
      });
    }

    var openDriveC = document.getElementById("open-drive-c");
    if (openDriveC) {
      openDriveC.addEventListener("click", openDriveCExplorer);
    }

    var focusPortfolioBtn = document.getElementById("focus-portfolio");
    if (focusPortfolioBtn) {
      focusPortfolioBtn.addEventListener("click", focusPortfolio);
    }

    updateClock();
    setInterval(updateClock, 30000);
    bindStatusHints();
  });
})();
