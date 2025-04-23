const emojiList = ['🐶', '🐱', '🐹', '🐸', '🦁', '🐼', '🐵', '🦊', '🐰', '🐨', '🦄', '🐷', '🐔', '🐙', '🦖', '🦕'];
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let timerInterval;
let seconds = 0;
let difficulty = 'medium';

const board = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const winMessage = document.getElementById('win-message');
const rankingList = document.getElementById('ranking-list');
const rankingSection = document.getElementById('ranking');

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerDisplay.textContent = '00:00';
  timerInterval = setInterval(() => {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function updateMoves() {
  moves++;
  movesDisplay.textContent = moves;
}

function setDifficulty() {
  const value = document.getElementById('difficulty').value;
  difficulty = value;
}

function getPairCount() {
  switch (difficulty) {
    case 'easy': return 4;
    case 'medium': return 8;
    case 'hard': return 18;
  }
}

function getGridSizeClass() {
  board.dataset.size = difficulty;
}

function createBoard() {
  setDifficulty();
  const pairCount = getPairCount();
  const emojis = shuffle([...emojiList]).slice(0, pairCount);
  cards = shuffle([...emojis, ...emojis]);

  board.innerHTML = '';
  getGridSizeClass();

  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.index = index;
    card.dataset.emoji = emoji;
    card.addEventListener('click', revealCard);
    board.appendChild(card);
  });
}

function revealCard(e) {
  if (lockBoard) return;

  const card = e.currentTarget;
  if (card.classList.contains('revealed') || card.classList.contains('matched')) return;

  card.classList.add('revealed');
  card.textContent = card.dataset.emoji;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  updateMoves();
  checkMatch();
}

function checkMatch() {
  lockBoard = true;

  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;

    if (matchedPairs === getPairCount()) {
      clearInterval(timerInterval);
      showWinMessage();
      saveRecord();
    }

    resetTurn();
  } else {
    setTimeout(() => {
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function showWinMessage() {
  winMessage.classList.remove('hidden');
  rankingSection.classList.remove('hidden');
}

function saveRecord() {
  const record = {
    time: formatTime(seconds),
    moves: moves,
    date: new Date().toLocaleString()
  };

  const records = JSON.parse(localStorage.getItem(`ranking-${difficulty}`)) || [];
  records.push(record);
  records.sort((a, b) => a.moves - b.moves || a.time.localeCompare(b.time));
  const top5 = records.slice(0, 5);

  localStorage.setItem(`ranking-${difficulty}`, JSON.stringify(top5));
  renderRanking(top5);
}

function renderRanking(data) {
  rankingList.innerHTML = '';
  data.forEach((r, i) => {
    const item = document.createElement('li');
    item.textContent = `#${i + 1} - ${r.time} (${r.moves} mov) em ${r.date}`;
    rankingList.appendChild(item);
  });
}

function changeTheme() {
  const theme = document.getElementById('theme').value;
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
}

function startGame() {
  clearInterval(timerInterval);
  [firstCard, secondCard, lockBoard, matchedPairs, moves, seconds] = [null, null, false, 0, 0, 0];

  winMessage.classList.add('hidden');
  rankingSection.classList.add('hidden');
  movesDisplay.textContent = '0';
  timerDisplay.textContent = '00:00';

  changeTheme();
  createBoard();
  startTimer();
}

window.onload = startGame;
