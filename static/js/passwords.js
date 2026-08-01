(function () {
  var promptOverlay, rewardOverlay, nedryOverlay, form, input, quaidImg, countEl;
  var quaidSrc = "";
  var nedryTimer;

  function init() {
    promptOverlay = document.getElementById("passwords-overlay");
    rewardOverlay = document.getElementById("passwords-reward-overlay");
    nedryOverlay = document.getElementById("nedry-overlay");
    form = document.getElementById("passwords-form");
    input = document.getElementById("passwords-input");
    quaidImg = document.getElementById("passwords-quaid");
    countEl = document.getElementById("passwords-visitor-count");

    if (!promptOverlay || !form) return;

    quaidSrc = quaidImg ? quaidImg.getAttribute("data-src") || "" : "";

    form.addEventListener("submit", onSubmit);
    promptOverlay.querySelector(".passwords-close").addEventListener("click", closePrompt);
    promptOverlay.querySelector(".passwords-cancel").addEventListener("click", closePrompt);
    promptOverlay.addEventListener("click", function (e) {
      if (e.target === promptOverlay) closePrompt();
    });

    if (rewardOverlay) {
      rewardOverlay.querySelector(".passwords-reward-close").addEventListener("click", closeReward);
      rewardOverlay.addEventListener("click", function (e) {
        if (e.target === rewardOverlay) closeReward();
      });
    }

    if (nedryOverlay) {
      nedryOverlay.querySelector(".nedry-dismiss").addEventListener("click", closeNedry);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (nedryOverlay && !nedryOverlay.classList.contains("is-hidden")) closeNedry();
        else if (rewardOverlay && !rewardOverlay.classList.contains("is-hidden")) closeReward();
        else if (promptOverlay && !promptOverlay.classList.contains("is-hidden")) closePrompt();
      }
    });
  }

  function open() {
    if (!promptOverlay) init();
    if (!promptOverlay) return;

    closeReward();
    closeNedry();
    promptOverlay.classList.remove("is-hidden");
    promptOverlay.setAttribute("aria-hidden", "false");
    form.reset();
    if (input) input.focus();
  }

  function closePrompt() {
    if (!promptOverlay) return;
    promptOverlay.classList.add("is-hidden");
    promptOverlay.setAttribute("aria-hidden", "true");
    form.reset();
  }

  function closeReward() {
    if (!rewardOverlay) return;
    rewardOverlay.classList.add("is-hidden");
    rewardOverlay.setAttribute("aria-hidden", "true");
    if (quaidImg) {
      quaidImg.removeAttribute("src");
      quaidImg.alt = "";
    }
  }

  function showNedry() {
    if (!nedryOverlay) return;
    nedryOverlay.classList.remove("is-hidden");
    nedryOverlay.setAttribute("aria-hidden", "false");
    clearTimeout(nedryTimer);
    nedryTimer = setTimeout(closeNedry, 5000);
  }

  function closeNedry() {
    if (!nedryOverlay) return;
    clearTimeout(nedryTimer);
    nedryOverlay.classList.add("is-hidden");
    nedryOverlay.setAttribute("aria-hidden", "true");
  }

  function formatCount(n) {
    if (n === null || n === undefined) return "—";
    return Number(n).toLocaleString("en-US");
  }

  function showReward(count) {
    closePrompt();
    if (!rewardOverlay) return;

    if (quaidImg && quaidSrc) {
      quaidImg.src = quaidSrc;
      quaidImg.alt = "Quaid";
    }
    if (countEl) countEl.textContent = formatCount(count);

    rewardOverlay.classList.remove("is-hidden");
    rewardOverlay.setAttribute("aria-hidden", "false");
  }

  function onSubmit(e) {
    e.preventDefault();
    var password = input ? input.value : "";

    fetch("/api/passwords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.ok) {
          showReward(result.data.count);
          return;
        }
        if (result.status === 403 && result.data.error === "magic_word") {
          closePrompt();
          showNedry();
          return;
        }
        closePrompt();
        showNedry();
      })
      .catch(function () {
        closePrompt();
        showNedry();
      });
  }

  window.PasswordsEgg = { open: open, close: closePrompt };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
