// ===== Playable Pac-Man Game =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ===== Game Constants =====
let CELL_SIZE = 24;
const PACMAN_SPEED = 0.10;
const GHOST_SPEED_BASE = 0.055;
const FRIGHTENED_TIME = 600;
const GHOST_RESPAWN = { x: 10, y: 9 };

const STATE = { READY: 0, PLAYING: 1, GAME_OVER: 2, WIN: 3 };

// ===== Maze (21 x 21) =====
const MAZE_RAW = [
  "#####################",
  "#o........#........o#",
  "#.###.###.#.###.###.#",
  "#o#.................o#",
  "#.###.#.#######.#.###",
  "#.....#....#....#...#",
  "###.###.##.#.##.###.#",
  "#.......##...##.....#",
  "###.###.##.#.##.###.#",
  "#.....#....#....#...#",
  "#.###.###.###.###.###",
  "#o#........P........o#",
  "#.###.###.###.###.###",
  "#.....#....#....#...#",
  "###.###.##.#.##.###.#",
  "#.......##...##.....#",
  "###.###.##.#.##.###.#",
  "#.....#....#....#...#",
  "#.###.#.#######.#.###",
  "#o........#........o#",
  "#####################",
];

const ROWS = MAZE_RAW.length;
const COLS = MAZE_RAW[0].length;

// ===== Parsed Level Data =====
let walls = [];
let dots = [];
let powerPellets = [];
let pacmanStart = { x: 10, y: 10 };

function parseMaze() {
  walls = [];
  dots = [];
  powerPellets = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const ch = MAZE_RAW[y][x];
      if (ch === '#') walls.push({ x, y });
      else if (ch === '.') dots.push({ x, y });
      else if (ch === 'o') powerPellets.push({ x, y });
      else if (ch === 'P') pacmanStart = { x, y };
      else if (ch === ' ') { /* empty corridor */ }
      else if (ch !== '#') dots.push({ x, y });
    }
  }
}

function isWall(gx, gy) {
  if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return true;
  return MAZE_RAW[gy][gx] === '#';
}

// ===== Entities =====
let pacman = {
  x: 10, y: 10,
  px: 0, py: 0,
  dir: { dx: 0, dy: 0 },
  nextDir: null,
  mouthOpen: 0,
  mouthSpeed: 0.12,
};

let ghosts = [];

function initGhosts() {
  ghosts = [
    { x: 9,  y: 1,  px: 0, py: 0, dir: { dx: 0, dy: 1 },  color: '#dc2626', type: 'blinky', eaten: false, name: 'BLINKY' },
    { x: 1,  y: 10, px: 0, py: 0, dir: { dx: 1, dy: 0 },  color: '#f4b9b0', type: 'pinky',  eaten: false, name: 'PINKY' },
    { x: 17, y: 10, px: 0, py: 0, dir: { dx: -1, dy: 0 }, color: '#00ffff', type: 'inky',   eaten: false, name: 'INKY' },
    { x: 9,  y: 19, px: 0, py: 0, dir: { dx: 0, dy: -1 }, color: '#d97706', type: 'clyde',  eaten: false, name: 'CLYDE' },
  ];
  ghosts.forEach(g => { g.px = g.x; g.py = g.y; });
}

// ===== Game State =====
let state = STATE.READY;
let score = 0;
let frame = 0;
let frightenedMode = false;
let frightenedTimer = 0;
let resetTimer = 0;
let lives = 3;
let level = 1;

// ===== Resize / Layout =====
let offsetX = 0;
let offsetY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  CELL_SIZE = Math.min(
    Math.floor(canvas.width / COLS),
    Math.floor(canvas.height / ROWS)
  );
  CELL_SIZE = Math.max(10, CELL_SIZE);

  const mazeW = COLS * CELL_SIZE;
  const mazeH = ROWS * CELL_SIZE;
  offsetX = (canvas.width - mazeW) / 2;
  offsetY = (canvas.height - mazeH) / 2;
}

function resetPositions() {
  pacman.x = pacmanStart.x;
  pacman.y = pacmanStart.y;
  pacman.px = pacman.x;
  pacman.py = pacman.y;
  pacman.dir = { dx: 0, dy: 0 };
  pacman.nextDir = null;
  initGhosts();
}

function initGame() {
  parseMaze();
  resetPositions();
  score = 0;
  lives = 3;
  level = 1;
  state = STATE.READY;
  frightenedMode = false;
  frightenedTimer = 0;
  frame = 0;
  updateHUD();
}

function nextLevel() {
  level++;
  parseMaze();
  resetPositions();
  frightenedMode = false;
  frightenedTimer = 0;
  state = STATE.READY;
  updateHUD();
}

// ===== Input =====
window.addEventListener('keydown', (e) => {
  let dir = null;
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = { dx: 0, dy: -1 };
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = { dx: 0, dy: 1 };
  else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = { dx: -1, dy: 0 };
  else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = { dx: 1, dy: 0 };

  if (dir) {
    if (state === STATE.PLAYING || state === STATE.READY) {
      e.preventDefault();
    }
    if (state === STATE.READY) {
      state = STATE.PLAYING;
    }
    if (state === STATE.PLAYING) {
      pacman.nextDir = dir;
    }
  }
});

// ===== BFS for Ghosts =====
const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];

function bfsFirstStep(start, target, currentDir) {
  if (start.x === target.x && start.y === target.y) return { dx: 0, dy: 0 };

  const queue = [{ x: start.x, y: start.y, firstDir: null }];
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const curr = queue.shift();

    for (const d of DIRS) {
      if (curr.x === start.x && curr.y === start.y &&
          d.dx === -currentDir.dx && d.dy === -currentDir.dy) {
        continue;
      }

      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      const key = `${nx},${ny}`;

      if (isWall(nx, ny) || visited.has(key)) continue;
      visited.add(key);

      const firstDir = curr.firstDir || d;
      if (nx === target.x && ny === target.y) {
        return firstDir;
      }
      queue.push({ x: nx, y: ny, firstDir });
    }
  }
  return { dx: 0, dy: 0 };
}

function getGhostTarget(ghost) {
  if (ghost.eaten) return GHOST_RESPAWN;

  const px = pacman.x;
  const py = pacman.y;

  switch (ghost.type) {
    case 'blinky':
      return { x: px, y: py };
    case 'pinky':
      return { x: px + pacman.dir.dx * 4, y: py + pacman.dir.dy * 4 };
    case 'inky': {
      const blinky = ghosts.find(g => g.type === 'blinky');
      const midX = px + pacman.dir.dx * 2;
      const midY = py + pacman.dir.dy * 2;
      if (!blinky) return { x: px, y: py };
      return { x: midX + (midX - blinky.x), y: midY + (midY - blinky.y) };
    }
    case 'clyde': {
      const dist = Math.abs(ghost.x - px) + Math.abs(ghost.y - py);
      if (dist > 8) return { x: px, y: py };
      return { x: 1, y: 19 };
    }
    default:
      return { x: px, y: py };
  }
}

function getGhostSpeed() {
  return GHOST_SPEED_BASE + (level - 1) * 0.005;
}

// ===== Update Logic =====
function updatePacman() {
  const speed = PACMAN_SPEED;

  if (pacman.nextDir) {
    const cx = pacman.x + 0.5;
    const cy = pacman.y + 0.5;
    const currCx = pacman.px + 0.5;
    const currCy = pacman.py + 0.5;
    const dist = Math.hypot(currCx - cx, currCy - cy);

    if (dist < speed * 2) {
      const nx = pacman.x + pacman.nextDir.dx;
      const ny = pacman.y + pacman.nextDir.dy;
      if (!isWall(nx, ny)) {
        pacman.dir = pacman.nextDir;
        pacman.px = pacman.x;
        pacman.py = pacman.y;
        pacman.nextDir = null;
      }
    }
  }

  const nx = pacman.px + pacman.dir.dx * speed;
  const ny = pacman.py + pacman.dir.dy * speed;
  const checkX = Math.round(nx);
  const checkY = Math.round(ny);

  if (!isWall(checkX, checkY)) {
    pacman.px = nx;
    pacman.py = ny;
    pacman.x = checkX;
    pacman.y = checkY;
  } else {
    pacman.dir = { dx: 0, dy: 0 };
    pacman.px = pacman.x;
    pacman.py = pacman.y;
  }

  pacman.mouthOpen += pacman.mouthSpeed;
  if (pacman.mouthOpen > 0.35 || pacman.mouthOpen < 0) {
    pacman.mouthSpeed = -pacman.mouthSpeed;
  }
}

function updateGhost(ghost) {
  const speed = ghost.eaten ? getGhostSpeed() * 1.4 : getGhostSpeed();

  const cx = ghost.x + 0.5;
  const cy = ghost.y + 0.5;
  const currCx = ghost.px + 0.5;
  const currCy = ghost.py + 0.5;
  const dist = Math.hypot(currCx - cx, currCy - cy);

  if (dist < speed * 1.5) {
    ghost.px = ghost.x;
    ghost.py = ghost.y;

    let chosenDir;
    if (frightenedMode && !ghost.eaten) {
      const valid = DIRS.filter(d => !(d.dx === -ghost.dir.dx && d.dy === -ghost.dir.dy))
                        .filter(d => !isWall(ghost.x + d.dx, ghost.y + d.dy));
      if (valid.length === 0) {
        chosenDir = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };
      } else {
        chosenDir = valid[Math.floor(Math.random() * valid.length)];
      }
    } else {
      const target = getGhostTarget(ghost);
      chosenDir = bfsFirstStep({ x: ghost.x, y: ghost.y }, target, ghost.dir);
      if (chosenDir.dx === 0 && chosenDir.dy === 0) {
        const valid = DIRS.filter(d => !(d.dx === -ghost.dir.dx && d.dy === -ghost.dir.dy))
                          .filter(d => !isWall(ghost.x + d.dx, ghost.y + d.dy));
        if (valid.length) chosenDir = valid[0];
        else chosenDir = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };
      }
    }

    ghost.dir = chosenDir;
    ghost.x += ghost.dir.dx;
    ghost.y += ghost.dir.dy;

    if (ghost.eaten && ghost.x === GHOST_RESPAWN.x && ghost.y === GHOST_RESPAWN.y) {
      ghost.eaten = false;
    }
  }

  ghost.px += ghost.dir.dx * speed;
  ghost.py += ghost.dir.dy * speed;
}

function collectItems() {
  const gx = Math.round(pacman.px);
  const gy = Math.round(pacman.py);

  const dotIdx = dots.findIndex(d => d.x === gx && d.y === gy);
  if (dotIdx !== -1) {
    dots.splice(dotIdx, 1);
    score += 10;
  }

  const ppIdx = powerPellets.findIndex(p => p.x === gx && p.y === gy);
  if (ppIdx !== -1) {
    powerPellets.splice(ppIdx, 1);
    score += 50;
    frightenedMode = true;
    frightenedTimer = FRIGHTENED_TIME;
  }

  if (dots.length === 0 && powerPellets.length === 0) {
    state = STATE.WIN;
    resetTimer = 120;
  }
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    state = STATE.GAME_OVER;
    resetTimer = 180;
  } else {
    resetPositions();
    frightenedMode = false;
    frightenedTimer = 0;
  }
  updateHUD();
}

function checkCollisions() {
  const pcx = pacman.px + 0.5;
  const pcy = pacman.py + 0.5;

  for (const g of ghosts) {
    const gcx = g.px + 0.5;
    const gcy = g.py + 0.5;
    const dist = Math.hypot(pcx - gcx, pcy - gcy);

    if (dist < 0.75) {
      if (frightenedMode && !g.eaten) {
        g.eaten = true;
        score += 200;
      } else if (!g.eaten) {
        loseLife();
      }
    }
  }
}

function updateHUD() {
  const scoreEl = document.getElementById('hud-score');
  const livesEl = document.getElementById('hud-lives');
  const levelEl = document.getElementById('hud-level');
  if (scoreEl) scoreEl.textContent = `SCORE ${score}`;
  if (livesEl) livesEl.textContent = `LIVES ${lives}`;
  if (levelEl) levelEl.textContent = `LEVEL ${level}`;
}

// ===== Drawing Helpers =====
function toScreen(gx, gy) {
  return {
    x: offsetX + gx * CELL_SIZE,
    y: offsetY + gy * CELL_SIZE,
  };
}

function drawWalls() {
  ctx.fillStyle = '#2a3fe5';
  for (const w of walls) {
    const s = toScreen(w.x, w.y);
    const pad = 1;
    ctx.fillRect(s.x + pad, s.y + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);
  }

  ctx.strokeStyle = '#2a3fe5';
  ctx.lineWidth = Math.max(2, CELL_SIZE / 10);
  for (const w of walls) {
    const s = toScreen(w.x, w.y);
    const r = CELL_SIZE / 4;
    ctx.beginPath();
    ctx.moveTo(s.x + r, s.y);
    ctx.lineTo(s.x + CELL_SIZE - r, s.y);
    ctx.quadraticCurveTo(s.x + CELL_SIZE, s.y, s.x + CELL_SIZE, s.y + r);
    ctx.lineTo(s.x + CELL_SIZE, s.y + CELL_SIZE - r);
    ctx.quadraticCurveTo(s.x + CELL_SIZE, s.y + CELL_SIZE, s.x + CELL_SIZE - r, s.y + CELL_SIZE);
    ctx.lineTo(s.x + r, s.y + CELL_SIZE);
    ctx.quadraticCurveTo(s.x, s.y + CELL_SIZE, s.x, s.y + CELL_SIZE - r);
    ctx.lineTo(s.x, s.y + r);
    ctx.quadraticCurveTo(s.x, s.y, s.x + r, s.y);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawDots() {
  ctx.fillStyle = '#f4b9b0';
  for (const d of dots) {
    const s = toScreen(d.x, d.y);
    const r = Math.max(2, CELL_SIZE / 8);
    ctx.beginPath();
    ctx.arc(s.x + CELL_SIZE / 2, s.y + CELL_SIZE / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerPellets() {
  const flash = Math.sin(frame * 0.15) > 0;
  if (!flash) return;
  ctx.fillStyle = '#f4b9b0';
  for (const p of powerPellets) {
    const s = toScreen(p.x, p.y);
    const r = Math.max(4, CELL_SIZE / 4);
    ctx.beginPath();
    ctx.arc(s.x + CELL_SIZE / 2, s.y + CELL_SIZE / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPacman() {
  const s = toScreen(pacman.px, pacman.py);
  const cx = s.x + CELL_SIZE / 2;
  const cy = s.y + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.38;
  const mouth = Math.abs(pacman.mouthOpen);

  ctx.save();
  ctx.translate(cx, cy);

  let angle = 0;
  if (pacman.dir.dx === -1) angle = Math.PI;
  else if (pacman.dir.dy === 1) angle = Math.PI / 2;
  else if (pacman.dir.dy === -1) angle = -Math.PI / 2;
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.arc(0, 0, r, mouth * Math.PI, (2 - mouth) * Math.PI);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = '#d97706';
  ctx.fill();

  ctx.restore();
}

function drawGhost(ghost) {
  const s = toScreen(ghost.px, ghost.py);
  const cx = s.x + CELL_SIZE / 2;
  const cy = s.y + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.38;

  if (ghost.eaten) {
    drawGhostEyes(cx, cy, r, ghost.dir, true);
    return;
  }

  const bodyColor = (frightenedMode) ? '#1e3a8a' : ghost.color;
  const flash = frightenedMode && frightenedTimer < 120 && Math.sin(frame * 0.25) > 0;
  const finalBodyColor = flash ? '#ffffff' : bodyColor;

  ctx.fillStyle = finalBodyColor;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.15, r, Math.PI, 0);
  ctx.lineTo(cx + r, cy + r * 0.7);
  for (let i = 0; i < 3; i++) {
    const wx = cx + r - (2 * r / 3) * (i + 0.5);
    ctx.lineTo(wx + r / 6, cy + r * 0.4);
    ctx.lineTo(wx - r / 6, cy + r * 0.75);
  }
  ctx.lineTo(cx - r, cy + r * 0.7);
  ctx.closePath();
  ctx.fill();

  if (frightenedMode) {
    drawFrightenedFace(cx, cy, r);
  } else {
    drawGhostEyes(cx, cy, r, ghost.dir, false);
  }
}

function drawGhostEyes(cx, cy, r, dir, eaten) {
  const eyeOffsetX = r * 0.18;
  const eyeOffsetY = -r * 0.15;
  const eyeR = r * 0.22;
  const pupilR = r * 0.1;
  const pupilOff = eaten ? 0 : r * 0.06;

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, eyeR, 0, Math.PI * 2);
  ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = eaten ? '#2a3fe5' : 'black';
  const px = (dir?.dx || 0) * pupilOff;
  const py = (dir?.dy || 0) * pupilOff;
  ctx.beginPath();
  ctx.arc(cx - eyeOffsetX + px, cy + eyeOffsetY + py, pupilR, 0, Math.PI * 2);
  ctx.arc(cx + eyeOffsetX + px, cy + eyeOffsetY + py, pupilR, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrightenedFace(cx, cy, r) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1.5, CELL_SIZE / 14);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.3, cy - r * 0.05);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.15);
  ctx.lineTo(cx - r * 0.1, cy - r * 0.05);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r * 0.1, cy - r * 0.05);
  ctx.lineTo(cx + r * 0.2, cy - r * 0.15);
  ctx.lineTo(cx + r * 0.3, cy - r * 0.05);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy + r * 0.25);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.35);
  ctx.lineTo(cx, cy + r * 0.25);
  ctx.lineTo(cx + r * 0.1, cy + r * 0.35);
  ctx.lineTo(cx + r * 0.2, cy + r * 0.25);
  ctx.stroke();
}

function drawOverlayMessage() {
  ctx.textAlign = 'center';
  const cx = offsetX + COLS * CELL_SIZE / 2;
  const cy = offsetY + ROWS * CELL_SIZE / 2;

  if (state === STATE.READY) {
    ctx.fillStyle = '#d97706';
    ctx.font = `${Math.floor(CELL_SIZE * 0.85)}px "Press Start 2P", monospace`;
    ctx.fillText('PRESS ARROWS', cx, cy - CELL_SIZE);
    ctx.fillStyle = '#8888a0';
    ctx.font = `${Math.floor(CELL_SIZE * 0.5)}px "Press Start 2P", monospace`;
    ctx.fillText('WASD TO MOVE', cx, cy + CELL_SIZE);
  } else if (state === STATE.GAME_OVER) {
    ctx.fillStyle = '#dc2626';
    ctx.font = `${Math.floor(CELL_SIZE * 0.9)}px "Press Start 2P", monospace`;
    ctx.fillText('GAME OVER', cx, cy);
  } else if (state === STATE.WIN) {
    ctx.fillStyle = '#16a34a';
    ctx.font = `${Math.floor(CELL_SIZE * 0.9)}px "Press Start 2P", monospace`;
    ctx.fillText('YOU WIN!', cx, cy);
  }
}

function drawMiniMapDots() {
  const s = toScreen(pacman.x, pacman.y);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (MAZE_RAW[y][x] === '#') continue;
      const p = toScreen(x, y);
      ctx.fillRect(p.x + CELL_SIZE * 0.4, p.y + CELL_SIZE * 0.4, CELL_SIZE * 0.2, CELL_SIZE * 0.2);
    }
  }
}

// ===== Main Loop =====
function update() {
  if (state === STATE.PLAYING) {
    updatePacman();

    for (const g of ghosts) {
      updateGhost(g);
    }

    collectItems();
    checkCollisions();

    if (frightenedMode) {
      frightenedTimer--;
      if (frightenedTimer <= 0) {
        frightenedMode = false;
      }
    }

    updateHUD();
  } else if ((state === STATE.GAME_OVER || state === STATE.WIN) && resetTimer > 0) {
    resetTimer--;
    if (resetTimer <= 0) {
      if (state === STATE.WIN) {
        nextLevel();
      } else {
        initGame();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWalls();
  drawDots();
  drawPowerPellets();

  for (const g of ghosts) {
    drawGhost(g);
  }

  drawPacman();
  drawOverlayMessage();
}

function gameLoop() {
  frame++;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ===== Init =====
resizeCanvas();
initGame();
window.addEventListener('resize', () => {
  resizeCanvas();
});
requestAnimationFrame(gameLoop);
