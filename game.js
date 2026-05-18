const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const statusEl = document.querySelector("#status");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const startSpeed = 135;
const minSpeed = 62;

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore;
let gameTimer;
let speed;
let running;
let paused;
let gameOver;

function loadBestScore() {
  return Number(localStorage.getItem("snakeBestScore") || 0);
}

function saveBestScore(value) {
  localStorage.setItem("snakeBestScore", String(value));
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speed = startSpeed;
  running = false;
  paused = false;
  gameOver = false;
  pauseButton.textContent = "暂停";
  statusEl.textContent = "按方向键或 WASD 开始";
  scoreEl.textContent = "0";
  placeFood();
  stopLoop();
  draw();
}

function startLoop() {
  if (running || gameOver) return;
  running = true;
  paused = false;
  statusEl.textContent = "进行中";
  pauseButton.textContent = "暂停";
  scheduleTick();
}

function stopLoop() {
  clearTimeout(gameTimer);
  gameTimer = undefined;
  running = false;
}

function scheduleTick() {
  clearTimeout(gameTimer);
  gameTimer = setTimeout(() => {
    update();
    draw();
    if (running) scheduleTick();
  }, speed);
}

function update() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (hitWall(head) || hitSnake(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = String(score);
    if (score > bestScore) {
      bestScore = score;
      bestEl.textContent = String(bestScore);
      saveBestScore(bestScore);
    }
    speed = Math.max(minSpeed, startSpeed - Math.floor(score / 50) * 10);
    placeFood();
  } else {
    snake.pop();
  }
}

function endGame() {
  stopLoop();
  gameOver = true;
  statusEl.textContent = "游戏结束，按空格或重新开始";
}

function hitWall(point) {
  return point.x < 0 || point.x >= tileCount || point.y < 0 || point.y >= tileCount;
}

function hitSnake(point) {
  return snake.some((part) => part.x === point.x && part.y === point.y);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake?.some((part) => part.x === food.x && part.y === food.y));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.fillStyle = "#11181c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawFood() {
  const pad = 4;
  ctx.fillStyle = "#ff6b5f";
  ctx.beginPath();
  ctx.roundRect(
    food.x * gridSize + pad,
    food.y * gridSize + pad,
    gridSize - pad * 2,
    gridSize - pad * 2,
    5,
  );
  ctx.fill();
}

function drawSnake() {
  snake.forEach((part, index) => {
    const pad = index === 0 ? 2 : 3;
    ctx.fillStyle = index === 0 ? "#b6f26f" : "#69d391";
    ctx.beginPath();
    ctx.roundRect(
      part.x * gridSize + pad,
      part.y * gridSize + pad,
      gridSize - pad * 2,
      gridSize - pad * 2,
      5,
    );
    ctx.fill();
  });
}

function setDirection(newDirection) {
  const reversing =
    newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
  if (!reversing) {
    nextDirection = newDirection;
  }
}

function togglePause() {
  if (gameOver) return;
  if (!running && !paused) {
    startLoop();
    return;
  }

  paused = !paused;
  if (paused) {
    stopLoop();
    paused = true;
    statusEl.textContent = "已暂停";
    pauseButton.textContent = "继续";
  } else {
    startLoop();
  }
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
  };

  if (event.code === "Space") {
    event.preventDefault();
    if (gameOver) {
      resetGame();
      startLoop();
    } else {
      togglePause();
    }
    return;
  }

  const newDirection = keyMap[event.key];
  if (!newDirection) return;

  event.preventDefault();
  setDirection(newDirection);
  startLoop();
}

pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", () => {
  resetGame();
  startLoop();
});
window.addEventListener("keydown", handleKeydown);

bestScore = loadBestScore();
bestEl.textContent = String(bestScore);
resetGame();
