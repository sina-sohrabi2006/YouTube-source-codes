// ---- Setup ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;              // size of each cell in px
const tileCount = canvas.width / gridSize; // 20x20 grid

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');

let snake, direction, nextDirection, food, score, highScore;
let gameRunning = false;
let paused = false;
let gameSpeed = 120; // ms per frame, lower = faster
let loopId = null;

highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
highScoreEl.textContent = highScore;

// ---- Game Init ----
function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameSpeed = 120;
  scoreEl.textContent = score;
  placeFood();
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
  }
}

// ---- Game Loop ----
function gameLoop() {
  if (!gameRunning || paused) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return endGame();
  }

  // Self collision
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    // Speed up slightly every 50 points, with a floor
    if (gameSpeed > 60) gameSpeed -= 3;
  } else {
    snake.pop();
  }

  draw();
  loopId = setTimeout(gameLoop, gameSpeed);
}

// ---- Drawing ----
function draw() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  const fx = food.x * gridSize + gridSize / 2;
  const fy = food.y * gridSize + gridSize / 2;
  ctx.arc(fx, fy, gridSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw snake
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(
      seg.x * gridSize + 1,
      seg.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });
}

// ---- Game State ----
function startGame() {
  initGame();
  gameRunning = true;
  paused = false;
  overlay.classList.add('hidden');
  clearTimeout(loopId);
  draw();
  loopId = setTimeout(gameLoop, gameSpeed);
}

function endGame() {
  gameRunning = false;
  clearTimeout(loopId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreEl.textContent = highScore;
  }

  overlayTitle.textContent = 'Game Over';
  overlayText.textContent = `You scored ${score} points. Press Start to play again.`;
  startBtn.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!gameRunning) return;
  paused = !paused;
  if (paused) {
    overlayTitle.textContent = 'Paused';
    overlayText.textContent = 'Press Space to resume';
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    loopId = setTimeout(gameLoop, gameSpeed);
  }
}

// ---- Input Handling ----
function setDirection(x, y) {
  // Prevent reversing directly into itself
  if (direction.x === -x && direction.y === -y) return;
  nextDirection = { x, y };
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W':
      setDirection(0, -1); break;
    case 'ArrowDown': case 's': case 'S':
      setDirection(0, 1); break;
    case 'ArrowLeft': case 'a': case 'A':
      setDirection(-1, 0); break;
    case 'ArrowRight': case 'd': case 'D':
      setDirection(1, 0); break;
    case ' ':
      e.preventDefault();
      togglePause();
      break;
  }

  // Auto-start on first arrow key press
  if (!gameRunning && e.key.startsWith('Arrow')) {
    startGame();
  }
});

// Mobile buttons
document.getElementById('upBtn').addEventListener('click', () => setDirection(0, -1));
document.getElementById('downBtn').addEventListener('click', () => setDirection(0, 1));
document.getElementById('leftBtn').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('rightBtn').addEventListener('click', () => setDirection(1, 0));

startBtn.addEventListener('click', startGame);

// Initial draw before game starts
initGame();
draw();