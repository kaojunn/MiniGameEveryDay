const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const statusEl = document.getElementById("status");
const actionButton = document.getElementById("actionButton");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const STORAGE_KEY = "star-catcher-best-score";

const keys = {
  left: false,
  right: false,
};

const state = {
  mode: "start",
  score: 0,
  bestScore: readBestScore(),
  elapsed: 0,
  spawnTimer: 0,
  lastFrame: 0,
  pointerActive: false,
  stars: [],
  player: {
    width: 92,
    height: 24,
    x: GAME_WIDTH / 2 - 46,
    y: GAME_HEIGHT - 56,
    speed: 460,
  },
};

function readBestScore() {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch (error) {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch (error) {
    // Ignore storage failures so the game still works in embedded contexts.
  }
}

function resetGame() {
  state.mode = "playing";
  state.score = 0;
  state.elapsed = 0;
  state.spawnTimer = 0;
  state.pointerActive = false;
  state.stars = [];
  state.player.x = GAME_WIDTH / 2 - state.player.width / 2;
  updateHud();
}

function startGame() {
  resetGame();
  actionButton.textContent = "Restart";
}

function endGame() {
  state.mode = "gameover";

  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    saveBestScore(state.bestScore);
  }

  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  bestScoreEl.textContent = String(state.bestScore);

  if (state.mode === "start") {
    statusEl.textContent = "Ready";
  } else if (state.mode === "playing") {
    statusEl.textContent = "Playing";
  } else {
    statusEl.textContent = "Game Over";
  }
}

function spawnStar() {
  const dangerChance = Math.min(0.18 + state.score * 0.02, 0.45);
  const kind = Math.random() < dangerChance ? "danger" : "bonus";
  const radius = kind === "danger" ? randomBetween(12, 22) : randomBetween(10, 18);
  const speedBase = 180 + state.score * 10;

  state.stars.push({
    kind,
    radius,
    x: randomBetween(radius, GAME_WIDTH - radius),
    y: -radius,
    speed: kind === "danger" ? speedBase + 70 : speedBase,
    drift: randomBetween(-45, 45),
    rotation: Math.random() * Math.PI * 2,
  });
}

function updatePlayer(deltaSeconds) {
  if (keys.left) {
    state.player.x -= state.player.speed * deltaSeconds;
  }

  if (keys.right) {
    state.player.x += state.player.speed * deltaSeconds;
  }

  state.player.x = clamp(state.player.x, 0, GAME_WIDTH - state.player.width);
}

function updateStars(deltaSeconds) {
  const nextStars = [];

  for (const star of state.stars) {
    star.y += star.speed * deltaSeconds;
    star.x += Math.sin(state.elapsed * 2 + star.rotation) * star.drift * deltaSeconds;

    if (checkCollision(star, state.player)) {
      if (star.kind === "danger") {
        endGame();
        return;
      }

      state.score += 1;

      if (state.score > state.bestScore) {
        state.bestScore = state.score;
      }

      updateHud();
      continue;
    }

    if (star.y - star.radius <= GAME_HEIGHT) {
      nextStars.push(star);
    }
  }

  state.stars = nextStars;
}

function update(deltaSeconds) {
  if (state.mode !== "playing") {
    return;
  }

  state.elapsed += deltaSeconds;
  state.spawnTimer -= deltaSeconds;

  if (state.spawnTimer <= 0) {
    spawnStar();
    state.spawnTimer = Math.max(0.24, 0.85 - state.score * 0.025);
  }

  updatePlayer(deltaSeconds);
  updateStars(deltaSeconds);
}

function checkCollision(star, player) {
  const closestX = clamp(star.x, player.x, player.x + player.width);
  const closestY = clamp(star.y, player.y, player.y + player.height);
  const dx = star.x - closestX;
  const dy = star.y - closestY;

  return dx * dx + dy * dy < star.radius * star.radius;
}

function renderBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, "#0d2040");
  gradient.addColorStop(1, "#071120");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (let index = 0; index < 70; index += 1) {
    const x = ((index * 137.5) % GAME_WIDTH);
    const y = ((index * 89.3 + state.elapsed * 8) % GAME_HEIGHT);
    const size = index % 3 === 0 ? 2 : 1;

    ctx.fillStyle = index % 4 === 0 ? "rgba(139, 233, 255, 0.9)" : "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(x, y, size, size);
  }
}

function renderPlayer() {
  const { x, y, width, height } = state.player;
  const shipGradient = ctx.createLinearGradient(x, y, x, y + height);
  shipGradient.addColorStop(0, "#89f7fe");
  shipGradient.addColorStop(1, "#66a6ff");

  ctx.fillStyle = shipGradient;
  roundRect(ctx, x, y, width, height, 10);
  ctx.fill();

  ctx.fillStyle = "#f7fbff";
  roundRect(ctx, x + width * 0.35, y - 12, width * 0.3, 16, 8);
  ctx.fill();
}

function renderStars() {
  for (const star of state.stars) {
    if (star.kind === "danger") {
      drawDangerStar(star);
    } else {
      drawBonusStar(star);
    }
  }
}

function drawBonusStar(star) {
  ctx.save();
  ctx.translate(star.x, star.y);
  ctx.rotate(state.elapsed * 1.6 + star.rotation);
  ctx.fillStyle = "#8be9ff";
  ctx.beginPath();

  for (let point = 0; point < 5; point += 1) {
    const outerAngle = (Math.PI * 2 * point) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    const outerRadius = star.radius;
    const innerRadius = star.radius * 0.45;

    const outerX = Math.cos(outerAngle) * outerRadius;
    const outerY = Math.sin(outerAngle) * outerRadius;
    const innerX = Math.cos(innerAngle) * innerRadius;
    const innerY = Math.sin(innerAngle) * innerRadius;

    if (point === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }

    ctx.lineTo(innerX, innerY);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDangerStar(star) {
  ctx.save();
  ctx.translate(star.x, star.y);
  ctx.rotate(state.elapsed * 2.4 + star.rotation);

  ctx.fillStyle = "#ff5c7c";
  ctx.beginPath();

  for (let point = 0; point < 8; point += 1) {
    const angle = (Math.PI * 2 * point) / 8;
    const radius = point % 2 === 0 ? star.radius : star.radius * 0.58;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    if (point === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderOverlay() {
  if (state.mode === "playing") {
    return;
  }

  ctx.fillStyle = "rgba(3, 8, 15, 0.58)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f7fbff";
  ctx.font = "700 42px Arial";
  ctx.fillText(state.mode === "start" ? "Star Catcher" : "Game Over", GAME_WIDTH / 2, 180);

  ctx.font = "400 24px Arial";
  const message = state.mode === "start"
    ? "A vibe-coded experiment: I update this game in public from daily player feedback."
    : `You scored ${state.score}. Press restart for another run.`;
  ctx.fillText(message, GAME_WIDTH / 2, 225);

  ctx.font = "400 18px Arial";
  ctx.fillStyle = "#8cb6ff";
  const supportText = state.mode === "start"
    ? "Catch blue energy, avoid red meteors, and tell me what to improve next."
    : "Keyboard, mouse, and touch are supported.";
  ctx.fillText(supportText, GAME_WIDTH / 2, 260);
}

function render() {
  renderBackground();
  renderStars();
  renderPlayer();
  renderOverlay();
}

function frame(timestamp) {
  if (!state.lastFrame) {
    state.lastFrame = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - state.lastFrame) / 1000, 0.032);
  state.lastFrame = timestamp;

  update(deltaSeconds);
  render();
  window.requestAnimationFrame(frame);
}

function movePlayerTo(clientX) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = ((clientX - rect.left) / rect.width) * GAME_WIDTH;
  state.player.x = clamp(relativeX - state.player.width / 2, 0, GAME_WIDTH - state.player.width);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

actionButton.addEventListener("click", startGame);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    keys.left = true;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

canvas.addEventListener("pointerdown", (event) => {
  state.pointerActive = true;
  movePlayerTo(event.clientX);
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.pointerActive) {
    return;
  }

  movePlayerTo(event.clientX);
});

window.addEventListener("pointerup", () => {
  state.pointerActive = false;
});

updateHud();
render();
window.requestAnimationFrame(frame);
