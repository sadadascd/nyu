// GESTÃO DE PONTUAÇÃO GLOBAL
let totalScore = 0;
function addScore(pts) {
  totalScore += pts;
  document.getElementById('global-score').innerText = totalScore;
}

// --------------------------------------------------
// 1. LÓGICA DO JOGO DE DESBLOQUEIO (SIMON)
// --------------------------------------------------
const simonBtns = document.querySelectorAll('.simon-btn');
const btnStartSimon = document.getElementById('btn-start-simon');
const simonStatus = document.getElementById('simon-status');

let simonSequence = [];
let playerSequence = [];
let simonPlaying = false;

btnStartSimon.addEventListener('click', startSimon);

function startSimon() {
  simonSequence = [];
  playerSequence = [];
  simonStatus.innerText = "Observe a sequência...";
  btnStartSimon.classList.add('hidden');
  nextSimonRound();
}

function nextSimonRound() {
  playerSequence = [];
  simonSequence = [];
  // Gera sequência de 3 passos para liberação
  for(let i = 0; i < 3; i++) {
    simonSequence.push(Math.floor(Math.random() * 4));
  }
  playSimonSequence();
}

function playSimonSequence() {
  simonPlaying = true;
  let i = 0;
  const interval = setInterval(() => {
    flashSimonBtn(simonSequence[i]);
    i++;
    if(i >= simonSequence.length) {
      clearInterval(interval);
      simonPlaying = false;
      simonStatus.innerText = "Sua vez! Repita a sequência.";
    }
  }, 600);
}

function flashSimonBtn(colorIndex) {
  const btn = simonBtns[colorIndex];
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 300);
}

simonBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if(simonPlaying || simonSequence.length === 0) return;
    
    const colorClicked = parseInt(e.target.dataset.color);
    flashSimonBtn(colorClicked);
    playerSequence.push(colorClicked);

    const currentIndex = playerSequence.length - 1;

    if(playerSequence[currentIndex] !== simonSequence[currentIndex]) {
      simonStatus.innerText = "❌ Sequência errada! Tente de novo.";
      btnStartSimon.classList.remove('hidden');
      simonSequence = [];
      return;
    }

    if(playerSequence.length === simonSequence.length) {
      simonStatus.innerText = "✅ Acesso Concedido!";
      setTimeout(unlockArcadeHub, 800);
    }
  });
});

function unlockArcadeHub() {
  document.getElementById('gatekeeper').classList.add('hidden');
  document.getElementById('arcade-portal').classList.remove('hidden');
}

// --------------------------------------------------
// 2. TROCA DE ABAS DO ARCADE
// --------------------------------------------------
const tabSnake = document.getElementById('tab-snake');
const tabShooter = document.getElementById('tab-shooter');
const sectionSnake = document.getElementById('section-snake');
const sectionShooter = document.getElementById('section-shooter');

tabSnake.addEventListener('click', () => {
  tabSnake.classList.add('active');
  tabShooter.classList.remove('active');
  sectionSnake.classList.remove('hidden');
  sectionShooter.classList.add('hidden');
});

tabShooter.addEventListener('click', () => {
  tabShooter.classList.add('active');
  tabSnake.classList.remove('active');
  sectionShooter.classList.remove('hidden');
  sectionSnake.classList.add('hidden');
});

// --------------------------------------------------
// 3. JOGO DA COBRINHA (SNAKE)
// --------------------------------------------------
const snakeCanvas = document.getElementById('snake-canvas');
const snakeCtx = snakeCanvas.getContext('2d');
const btnPlaySnake = document.getElementById('btn-play-snake');
const snakeOverlay = document.getElementById('snake-overlay');
const snakeScoreEl = document.getElementById('snake-score');

const gridSize = 20;
const tileCount = snakeCanvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let dx = 1, dy = 0;
let snakeScore = 0;
let snakeLoop = null;

btnPlaySnake.addEventListener('click', startSnake);

function startSnake() {
  snake = [{x: 10, y: 10}];
  dx = 1; dy = 0;
  snakeScore = 0;
  snakeScoreEl.innerText = '0';
  snakeOverlay.classList.add('hidden');
  spawnFood();
  if(snakeLoop) clearInterval(snakeLoop);
  snakeLoop = setInterval(updateSnake, 100);
}

function updateSnake() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Colisão com Paredes
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return gameOverSnake();
  }

  // Colisão com o Corpo
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      return gameOverSnake();
    }
  }

  snake.unshift(head);

  // Comer Comida
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 10;
    snakeScoreEl.innerText = snakeScore;
    addScore(10);
    spawnFood();
  } else {
    snake.pop();
  }

  drawSnakeGame();
}

function drawSnakeGame() {
  snakeCtx.fillStyle = '#020617';
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  // Desenhar Comida
  snakeCtx.fillStyle = '#ef4444';
  snakeCtx.shadowBlur = 10;
  snakeCtx.shadowColor = '#ef4444';
  snakeCtx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  // Desenhar Cobrinha
  snakeCtx.fillStyle = '#10b981';
  snakeCtx.shadowColor = '#10b981';
  snake.forEach(segment => {
    snakeCtx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
  snakeCtx.shadowBlur = 0;
}

function spawnFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function gameOverSnake() {
  clearInterval(snakeLoop);
  snakeOverlay.classList.remove('hidden');
  btnPlaySnake.innerText = "Tentar Novamente";
}

// Controles Teclado + Mobile
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
  if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
  if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
  if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});

document.getElementById('btn-up').onclick = () => { if(dy === 0){ dx = 0; dy = -1; } };
document.getElementById('btn-down').onclick = () => { if(dy === 0){ dx = 0; dy = 1; } };
document.getElementById('btn-left').onclick = () => { if(dx === 0){ dx = -1; dy = 0; } };
document.getElementById('btn-right').onclick = () => { if(dx === 0){ dx = 1; dy = 0; } };

// --------------------------------------------------
// 4. JOGO DE TIRO AO ALVO
// --------------------------------------------------
const shooterCanvas = document.getElementById('shooter-canvas');
const shooterCtx = shooterCanvas.getContext('2d');
const btnPlayShooter = document.getElementById('btn-play-shooter');
const shooterOverlay = document.getElementById('shooter-overlay');
const shooterScoreEl = document.getElementById('shooter-score');
const shooterTimerEl = document.getElementById('shooter-timer');

let target = { x: 200, y: 200, radius: 25, vx: 3, vy: 3 };
let shooterScore = 0;
let shooterTimeLeft = 30;
let shooterLoop = null;
let timerInterval = null;
let shooterActive = false;

btnPlayShooter.addEventListener('click', startShooter);

function startShooter() {
  shooterScore = 0;
  shooterTimeLeft = 30;
  shooterScoreEl.innerText = '0';
  shooterTimerEl.innerText = '30';
  shooterOverlay.classList.add('hidden');
  shooterActive = true;

  resetTarget();

  if(shooterLoop) cancelAnimationFrame(shooterLoop);
  if(timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    shooterTimeLeft--;
    shooterTimerEl.innerText = shooterTimeLeft;
    if(shooterTimeLeft <= 0) {
      gameOverShooter();
    }
  }, 1000);

  renderShooter();
}

function resetTarget() {
  target.x = Math.random() * (shooterCanvas.width - 60) + 30;
  target.y = Math.random() * (shooterCanvas.height - 60) + 30;
  target.vx = (Math.random() - 0.5) * 6;
  target.vy = (Math.random() - 0.5) * 6;
}

function renderShooter() {
  if(!shooterActive) return;

  shooterCtx.fillStyle = '#020617';
  shooterCtx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);

  // Mover Alvo
  target.x += target.vx;
  target.y += target.vy;

  if(target.x - target.radius < 0 || target.x + target.radius > shooterCanvas.width) target.vx *= -1;
  if(target.y - target.radius < 0 || target.y + target.radius > shooterCanvas.height) target.vy *= -1;

  // Desenhar Alvo
  shooterCtx.beginPath();
  shooterCtx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
  shooterCtx.fillStyle = '#ef4444';
  shooterCtx.shadowBlur = 15;
  shooterCtx.shadowColor = '#ef4444';
  shooterCtx.fill();

  shooterCtx.beginPath();
  shooterCtx.arc(target.x, target.y, target.radius * 0.5, 0, Math.PI * 2);
  shooterCtx.fillStyle = '#ffffff';
  shooterCtx.fill();
  shooterCtx.shadowBlur = 0;

  shooterLoop = requestAnimationFrame(renderShooter);
}

shooterCanvas.addEventListener('click', (e) => {
  if(!shooterActive) return;

  const rect = shooterCanvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const dist = Math.hypot(clickX - target.x, clickY - target.y);

  if(dist < target.radius) {
    shooterScore += 15;
    shooterScoreEl.innerText = shooterScore;
    addScore(15);
    resetTarget();
  }
});

function gameOverShooter() {
  shooterActive = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(shooterLoop);
  shooterOverlay.classList.remove('hidden');
  btnPlayShooter.innerText = "Jogar Novamente";
}