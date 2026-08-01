(function () {
  var COLS = 20;
  var ROWS = 15;
  var CELL = 16;
  var TICK_MS = 200;

  var overlay, canvas, ctx, scoreEl, statusEl, newBtn, closeBtn;
  var snake, direction, nextDirection, food, score, timer, running;

  var COLORS = {
    bg: "#000000",
    snake: "#4a8a4a",
    head: "#6cb86c",
    food: "#a89958",
    grid: "#1a1a1a"
  };

  function init() {
    overlay = document.getElementById("snake-overlay");
    canvas = document.getElementById("snake-canvas");
    if (!overlay || !canvas) return;

    ctx = canvas.getContext("2d");
    scoreEl = document.getElementById("snake-score");
    statusEl = document.getElementById("snake-status");
    newBtn = document.getElementById("snake-new");
    closeBtn = overlay.querySelector(".snake-close");

    newBtn.addEventListener("click", resetGame);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    var dirButtons = overlay.querySelectorAll(".snake-dir");
    for (var i = 0; i < dirButtons.length; i++) {
      (function (btn) {
        function steer(e) {
          e.preventDefault();
          queueDirection(Number(btn.dataset.x), Number(btn.dataset.y));
        }
        btn.addEventListener("click", steer);
        btn.addEventListener("touchstart", steer, { passive: false });
      })(dirButtons[i]);
    }
  }

  function open() {
    if (!overlay) init();
    if (!overlay) return;

    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    resetGame();
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    stopLoop();
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    var startMenu = document.getElementById("start-menu");
    if (startMenu) startMenu.classList.remove("is-open");
  }

  function resetGame() {
    stopLoop();
    snake = [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    food = spawnFood();
    running = true;
    updateScore();
    setStatus("");
    draw();
    timer = setInterval(tick, TICK_MS);
  }

  function stopLoop() {
    running = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function spawnFood() {
    var spot;
    do {
      spot = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS)
      };
    } while (occupies(spot.x, spot.y));
    return spot;
  }

  function occupies(x, y) {
    for (var i = 0; i < snake.length; i++) {
      if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
  }

  function tick() {
    if (!running) return;

    direction = nextDirection;
    var head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || occupies(head.x, head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      food = spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    stopLoop();
    setStatus("Game over");
    draw();
  }

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.grid;
    for (var x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (var y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    ctx.fillStyle = COLORS.food;
    ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2);

    for (var i = snake.length - 1; i >= 0; i--) {
      ctx.fillStyle = i === 0 ? COLORS.head : COLORS.snake;
      ctx.fillRect(snake[i].x * CELL + 1, snake[i].y * CELL + 1, CELL - 2, CELL - 2);
    }
  }

  function queueDirection(x, y) {
    if (!running) return;
    if (x === -direction.x && y === -direction.y) return;
    nextDirection = { x: x, y: y };
  }

  function onKeyDown(e) {
    if (overlay.classList.contains("is-hidden")) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        queueDirection(0, -1);
        break;
      case "ArrowDown":
        e.preventDefault();
        queueDirection(0, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        queueDirection(-1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        queueDirection(1, 0);
        break;
      case "Escape":
        close();
        break;
    }
  }

  var touchStart = null;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e) {
    if (!touchStart || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touchStart.x;
    var dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      queueDirection(dx > 0 ? 1 : -1, 0);
    } else {
      queueDirection(0, dy > 0 ? 1 : -1);
    }
  }

  window.SnakeGame = { open: open, close: close };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
