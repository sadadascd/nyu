// GESTÃO AUDIO WEB AUDIO API
let soundEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type = 'square', duration = 0.1) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

document.getElementById('btn-audio-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  document.getElementById('btn-audio-toggle').innerText = soundEnabled ? '🔊 Som: ON' : '🔇 Som: OFF';
});

// PONTUAÇÃO E LOCALSTORAGE
let totalScore = 0;
let highScores = {
  snake: localStorage.getItem('hs_snake') || 0,
  shooter: localStorage.getItem('hs_shooter') || 0,
  breakout: localStorage.getItem('hs_breakout') || 0
};

document.getElementById('snake-high').innerText = highScores.snake;
document.getElementById('shooter-high').innerText = highScores.shooter;
document.getElementById('breakout-high').innerText = highScores.breakout;

function addScore(pts) {
  totalScore += pts;
  document.getElementById('global-score').innerText = totalScore;
}

function updateHighScore(game, score) {
  if (score > highScores[game]) {
    highScores[game] = score;
    localStorage.setItem(`hs_${game}`, score);
    document.getElementById(`${game}-high`).innerText = score;
  }
}

function triggerShake(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

// ABAS DO ARCADE
const tabs = {
  snake: document.getElementById('tab-snake'),
  shooter: document.getElementById('tab-shooter'),
  breakout: document.getElementById('tab-breakout')
};
const sections = {
  snake: document.getElementById('section-snake'),
  shooter: document.getElementById('section-shooter'),
  breakout: document.getElementById('section-breakout')
};

Object.keys(tabs).forEach(key => {
  tabs[key].addEventListener('click', () => {
    playSound(400, 'sine', 0.05);
    Object.keys(tabs).forEach(k => {
      tabs[k].classList.remove('active');
      sections[k].classList.add('hidden');
    });
    tabs[key].classList.add('active');
    sections[key].classList.remove('hidden');
  });
});

// PARTÍCULAS
class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.radius = Math.random() * 3 + 1;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.alpha = 1;
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.alpha -= 0.03;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 1. SNAKE
const snakeCanvas = document.getElementById('snake-canvas');
const snakeCtx = snakeCanvas.getContext('2d');
const gridSize = 20, tileCount = 20;
let snake = [{x: 10, y: 10}], food = {x: 5, y: 5, type: 'normal'}, dx = 1, dy = 0, snakeScore = 0, snakeLoop = null, snakeParticles = [];

document.getElementById('btn-play-snake').onclick = () => {
  snake = [{x: 10, y: 10}]; dx = 1; dy = 0; snakeScore = 0;
  document.getElementById('snake-score').innerText = '0';
  document.getElementById('snake-overlay').classList.add('hidden');
  spawnFood();
  if (snakeLoop) clearInterval(snakeLoop);
  snakeLoop = setInterval(updateSnake, 100);
};

function spawnFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
  food.type = Math.random() > 0.8 ? 'gold' : 'normal';
}

function updateSnake() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
    playSound(120, 'sawtooth', 0.3);
    triggerShake('wrapper-snake');
    clearInterval(snakeLoop);
    updateHighScore('snake', snakeScore);
    document.getElementById('snake-overlay').classList.remove('hidden');
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    const pts = food.type === 'gold' ? 30 : 10;
    snakeScore += pts;
    document.getElementById('snake-score').innerText = snakeScore;
    addScore(pts);
    playSound(food.type === 'gold' ? 880 : 520, 'square', 0.1);
    for (let i = 0; i < 12; i++) snakeParticles.push(new Particle(food.x * gridSize + 10, food.y * gridSize + 10, food.type === 'gold' ? '#eab308' : '#ef4444'));
    spawnFood();
  } else {
    snake.pop();
  }

  snakeCtx.fillStyle = '#020617';
  snakeCtx.fillRect(0, 0, 400, 400);

  // Comida
  snakeCtx.fillStyle = food.type === 'gold' ? '#eab308' : '#ef4444';
  snakeCtx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);

  // Cobrinha
  snakeCtx.fillStyle = '#10b981';
  snake.forEach(s => snakeCtx.fillRect(s.x * gridSize + 1, s.y * gridSize + 1, gridSize - 2, gridSize - 2));

  // Partículas
  snakeParticles.forEach((p, index) => {
    p.update(); p.draw(snakeCtx);
    if (p.alpha <= 0) snakeParticles.splice(index, 1);
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
  if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
  if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
  if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});
document.getElementById('btn-up').onclick = () => { if (dy === 0) { dx = 0; dy = -1; } };
document.getElementById('btn-down').onclick = () => { if (dy === 0) { dx = 0; dy = 1; } };
document.getElementById('btn-left').onclick = () => { if (dx === 0) { dx = -1; dy = 0; } };
document.getElementById('btn-right').onclick = () => { if (dx === 0) { dx = 1; dy = 0; } };

// 2. SHOOTER
const shooterCanvas = document.getElementById('shooter-canvas');
const shooterCtx = shooterCanvas.getContext('2d');
let target = {x: 200, y: 200, radius: 22, vx: 3, vy: 3}, shooterScore = 0, shooterTime = 30, shooterLoop = null, shooterTimer = null, shooterParticles = [];

document.getElementById('btn-play-shooter').onclick = () => {
  shooterScore = 0; shooterTime = 30;
  document.getElementById('shooter-score').innerText = '0';
  document.getElementById('shooter-timer').innerText = '30';
  document.getElementById('shooter-overlay').classList.add('hidden');

  if (shooterLoop) cancelAnimationFrame(shooterLoop);
  if (shooterTimer) clearInterval(shooterTimer);

  shooterTimer = setInterval(() => {
    shooterTime--;
    document.getElementById('shooter-timer').innerText = shooterTime;
    if (shooterTime <= 0) {
      clearInterval(shooterTimer);
      cancelAnimationFrame(shooterLoop);
      playSound(200, 'triangle', 0.4);
      updateHighScore('shooter', shooterScore);
      document.getElementById('shooter-overlay').classList.remove('hidden');
    }
  }, 1000);

  renderShooter();
};

function renderShooter() {
  shooterCtx.fillStyle = '#020617';
  shooterCtx.fillRect(0, 0, 400, 400);

  target.x += target.vx; target.y += target.vy;
  if (target.x - target.radius < 0 || target.x + target.radius > 400) target.vx *= -1;
  if (target.y - target.radius < 0 || target.y + target.radius > 400) target.vy *= -1;

  shooterCtx.fillStyle = '#ef4444';
  shooterCtx.beginPath(); shooterCtx.arc(target.x, target.y, target.radius, 0, Math.PI * 2); shooterCtx.fill();
  shooterCtx.fillStyle = '#ffffff';
  shooterCtx.beginPath(); shooterCtx.arc(target.x, target.y, target.radius * 0.5, 0, Math.PI * 2); shooterCtx.fill();

  shooterParticles.forEach((p, index) => {
    p.update(); p.draw(shooterCtx);
    if (p.alpha <= 0) shooterParticles.splice(index, 1);
  });

  if (shooterTime > 0) shooterLoop = requestAnimationFrame(renderShooter);
}

shooterCanvas.addEventListener('click', e => {
  if (shooterTime <= 0) return;
  const rect = shooterCanvas.getBoundingClientRect();
  const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
  if (Math.hypot(cx - target.x, cy - target.y) < target.radius) {
    shooterScore += 15;
    document.getElementById('shooter-score').innerText = shooterScore;
    addScore(15);
    playSound(800, 'square', 0.08);
    for (let i = 0; i < 15; i++) shooterParticles.push(new Particle(target.x, target.y, '#38bdf8'));
    target.x = Math.random() * 340 + 30;
    target.y = Math.random() * 340 + 30;
  }
});

// 3. BREAKOUT
const breakoutCanvas = document.getElementById('breakout-canvas');
const breakoutCtx = breakoutCanvas.getContext('2d');
let paddleWidth = 75, paddleX = (400 - 75) / 2;
let ballX = 200, ballY = 300, ballVx = 3, ballVy = -3;
let breakoutScore = 0, breakoutLives = 3, breakoutLoop = null;
let bricks = [], powerups = [], breakoutParticles = [];

document.getElementById('btn-play-breakout').onclick = () => {
  breakoutScore = 0; breakoutLives = 3; paddleWidth = 75;
  document.getElementById('breakout-score').innerText = '0';
  document.getElementById('breakout-lives').innerText = '3';
  document.getElementById('breakout-overlay').classList.add('hidden');
  resetBreakoutBall();
  initBricks();
  if (breakoutLoop) cancelAnimationFrame(breakoutLoop);
  renderBreakout();
};

function resetBreakoutBall() {
  ballX = 200; ballY = 300; ballVx = 3; ballVy = -3;
}

function initBricks() {
  bricks = [];
  for (let r = 0; r < 4; r++) {
    bricks[r] = [];
    for (let c = 0; c < 5; c++) {
      bricks[r][c] = { x: c * 75 + 15, y: r * 22 + 30, status: 1 };
    }
  }
}

function renderBreakout() {
  breakoutCtx.fillStyle = '#020617';
  breakoutCtx.fillRect(0, 0, 400, 400);

  // Blocos
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      let b = bricks[r][c];
      if (b.status === 1) {
        if (ballX > b.x && ballX < b.x + 70 && ballY > b.y && ballY < b.y + 18) {
          ballVy *= -1;
          b.status = 0;
          breakoutScore += 20;
          document.getElementById('breakout-score').innerText = breakoutScore;
          addScore(20);
          playSound(600, 'square', 0.08);

          for (let i = 0; i < 8; i++) breakoutParticles.push(new Particle(b.x + 35, b.y + 9, '#38bdf8'));
          if (Math.random() > 0.7) powerups.push({ x: b.x + 35, y: b.y, vy: 2 });
        }
        breakoutCtx.fillStyle = '#38bdf8';
        breakoutCtx.fillRect(b.x, b.y, 70, 18);
      }
    }
  }

  // Raquete & Bola
  breakoutCtx.fillStyle = '#10b981';
  breakoutCtx.fillRect(paddleX, 375, paddleWidth, 10);
  breakoutCtx.beginPath(); breakoutCtx.arc(ballX, ballY, 6, 0, Math.PI * 2); breakoutCtx.fill();

  // Movimento Bola
  ballX += ballVx; ballY += ballVy;
  if (ballX < 6 || ballX > 394) ballVx *= -1;
  if (ballY < 6) ballVy *= -1;
  if (ballY > 369 && ballX > paddleX && ballX < paddleX + paddleWidth) {
    ballVy = -Math.abs(ballVy);
    playSound(440, 'sine', 0.05);
  } else if (ballY > 400) {
    breakoutLives--;
    document.getElementById('breakout-lives').innerText = breakoutLives;
    playSound(150, 'sawtooth', 0.2);
    triggerShake('wrapper-breakout');
    if (breakoutLives <= 0) {
      updateHighScore('breakout', breakoutScore);
      document.getElementById('breakout-overlay').classList.remove('hidden');
      return;
    } else {
      resetBreakoutBall();
    }
  }

  // Powerups
  powerups.forEach((p, index) => {
    p.y += p.vy;
    breakoutCtx.fillStyle = '#eab308';
    breakoutCtx.fillRect(p.x - 5, p.y - 5, 10, 10);
    if (p.y > 370 && p.x > paddleX && p.x < paddleX + paddleWidth) {
      paddleWidth = 110;
      playSound(750, 'triangle', 0.15);
      powerups.splice(index, 1);
    }
  });

  // Partículas
  breakoutParticles.forEach((p, index) => {
    p.update(); p.draw(breakoutCtx);
    if (p.alpha <= 0) breakoutParticles.splice(index, 1);
  });

  breakoutLoop = requestAnimationFrame(renderBreakout);
}

breakoutCanvas.addEventListener('mousemove', e => {
  const rect = breakoutCanvas.getBoundingClientRect();
  paddleX = e.clientX - rect.left - paddleWidth / 2;
});