const ROWS = 6;
const COLS = 7;
let grid = [];
let currentPlayer = 'red';
let gameOver = false;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const winOverlay = document.getElementById('winOverlay');
const winMessage = document.getElementById('winMessage');

function createBoard() {
  boardEl.innerHTML = '';
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  // Build cells column-first so click column logic is easy,
  // but display row-first (top to bottom)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => handleClick(c));
      boardEl.appendChild(cell);
    }
  }
}

function handleClick(col) {
  if (gameOver) return;

  // find lowest empty row in this column
  let targetRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!grid[r][col]) {
      targetRow = r;
      break;
    }
  }

  if (targetRow === -1) return; // column full

  grid[targetRow][col] = currentPlayer;
  const cellEl = boardEl.querySelector(`[data-row="${targetRow}"][data-col="${col}"]`);
  cellEl.classList.add(currentPlayer, 'drop');

  if (checkWin(targetRow, col)) {
    gameOver = true;
    winMessage.textContent = `${currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow'} Wins!`;
    winOverlay.classList.add('active');
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    winMessage.textContent = "It's a Draw!";
    winOverlay.classList.add('active');
    return;
  }

  currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
  statusEl.textContent = `Player ${currentPlayer === 'red' ? 'Red' : 'Yellow'}'s Turn`;
}

function checkWin(row, col) {
  const directions = [
    [[0, 1], [0, -1]],   // horizontal
    [[1, 0], [-1, 0]],   // vertical
    [[1, 1], [-1, -1]],  // diagonal \
    [[1, -1], [-1, 1]],  // diagonal /
  ];

  const player = grid[row][col];

  for (const [dir1, dir2] of directions) {
    let count = 1;
    count += countDirection(row, col, dir1[0], dir1[1], player);
    count += countDirection(row, col, dir2[0], dir2[1], player);
    if (count >= 4) return true;
  }
  return false;
}

function countDirection(row, col, dRow, dCol, player) {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;

  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
    count++;
    r += dRow;
    c += dCol;
  }
  return count;
}

function isBoardFull() {
  return grid[0].every(cell => cell !== null);
}

function resetGame() {
  currentPlayer = 'red';
  gameOver = false;
  statusEl.textContent = "Player Red's Turn";
  winOverlay.classList.remove('active');
  createBoard();
}

document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('playAgainBtn').addEventListener('click', resetGame);

createBoard();