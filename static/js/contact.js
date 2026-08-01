(function () {
  var overlay, form, statusEl, submitBtn, closeBtn, turnstileLoaded, siteKey;

  function init() {
    overlay = document.getElementById("contact-overlay");
    form = document.getElementById("contact-form");
    if (!overlay || !form) return;

    statusEl = document.getElementById("contact-status");
    submitBtn = document.getElementById("contact-submit");
    closeBtn = overlay.querySelector(".contact-close");

    var turnstileEl = overlay.querySelector(".cf-turnstile");
    siteKey = turnstileEl ? turnstileEl.getAttribute("data-sitekey") : "";

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    form.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.classList.contains("is-hidden")) close();
    });
  }

  function loadTurnstile() {
    if (!siteKey || turnstileLoaded) return Promise.resolve();
    turnstileLoaded = true;
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function renderTurnstile() {
    if (!siteKey || !window.turnstile) return;
    var el = overlay.querySelector(".cf-turnstile");
    if (!el || el.dataset.rendered === "true") return;
    window.turnstile.render(el, { sitekey: siteKey });
    el.dataset.rendered = "true";
  }

  function open() {
    if (!overlay) init();
    if (!overlay) return;

    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    setStatus("");

    loadTurnstile().then(function () {
      renderTurnstile();
      var nameInput = document.getElementById("contact-name");
      if (nameInput) nameInput.focus();
    });
  }

  function close() {
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    setStatus("");
    form.reset();
    if (window.turnstile) {
      var el = overlay.querySelector(".cf-turnstile");
      if (el && el.dataset.rendered === "true") {
        window.turnstile.reset(el);
      }
    }
    var startMenu = document.getElementById("start-menu");
    if (startMenu) startMenu.classList.remove("is-open");
  }

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", !!isError);
  }

  function onSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!siteKey) {
      setStatus("Form isn't wired up yet.", true);
      return;
    }

    var name = document.getElementById("contact-name").value.trim();
    var email = document.getElementById("contact-email").value.trim();
    var message = document.getElementById("contact-message").value.trim();
    var website = document.getElementById("contact-website").value.trim();
    var token = window.turnstile ? window.turnstile.getResponse() : "";

    if (!name || !email || !message) {
      setStatus("Fill in all fields.", true);
      return;
    }

    if (!token) {
      setStatus("Check the verification box.", true);
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending...");

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        website: website,
        turnstileToken: token,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data.ok) {
          setStatus("Sent.");
          form.reset();
          if (window.turnstile) window.turnstile.reset();
          return;
        }
        setStatus(result.data.error || "Could not send message.", true);
        if (window.turnstile) window.turnstile.reset();
      })
      .catch(function () {
        setStatus("Could not send message.", true);
        if (window.turnstile) window.turnstile.reset();
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  }

  window.ContactForm = { open: open, close: close };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
