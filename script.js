const emojis = ['🍕','🎮','🚀','🐶','🎵','🌈','⚽','🍩'];
const cardValues = [...emojis, ...emojis]; // 8 pairs = 16 cards

let board = document.getElementById('board');
let movesEl = document.getElementById('moves');
let timerEl = document.getElementById('timer');
let winOverlay = document.getElementById('winOverlay');
let winStats = document.getElementById('winStats');

let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let lockBoard = false;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createBoard() {
  board.innerHTML = '';
  const shuffled = shuffle([...cardValues]);

  shuffled.forEach((value) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = value;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">❓</div>
        <div class="card-back">${value}</div>
      </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  if (timerInterval === null) startTimer();

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.value === card2.dataset.value;

  if (isMatch) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCount += 2;
    flippedCards = [];

    if (matchedCount === cardValues.length) {
      endGame();
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
    }, 800);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = seconds;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function endGame() {
  stopTimer();
  winStats.textContent = `You finished in ${moves} moves and ${seconds} seconds!`;
  winOverlay.classList.add('active');
}

function resetGame() {
  stopTimer();
  flippedCards = [];
  matchedCount = 0;
  moves = 0;
  seconds = 0;
  lockBoard = false;
  timerInterval = null;
  movesEl.textContent = 0;
  timerEl.textContent = 0;
  winOverlay.classList.remove('active');
  createBoard();
}

document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('playAgainBtn').addEventListener('click', resetGame);

createBoard();