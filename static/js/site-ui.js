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

    var openContact = document.getElementById("open-contact");
    if (openContact) {
      openContact.addEventListener("click", function () {
        loadContact().then(function () {
          window.ContactForm.open();
        });
      });
    }

    var loadPasswords = lazyLoader("/js/passwords.js", function () {
      return !!window.PasswordsEgg;
    });

    var openPasswords = document.getElementById("open-passwords");
    if (openPasswords) {
      openPasswords.addEventListener("click", function () {
        loadPasswords().then(function () {
          window.PasswordsEgg.open();
        });
      });
    }
  });
})();
