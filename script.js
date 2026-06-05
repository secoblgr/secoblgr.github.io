// ===== Arcade Dot Grid Background =====
const canvas = document.getElementById("dots");
const ctx = canvas.getContext("2d");
let dots = [];
let frame = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const spacing = 40;

class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseSize = 2;
    this.maxSize = 5;
    this.size = this.baseSize;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(time) {
    const pulse = Math.sin(time * 0.003 + this.phase);
    this.size =
      this.baseSize +
      (pulse + 1) * 0.5 * (this.maxSize - this.baseSize);
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 185, 176, ${
      0.3 + (this.size / this.maxSize) * 0.4
    })`;
    ctx.fill();
  }
}

function initDots() {
  dots = [];
  const cols = Math.ceil(canvas.width / spacing) + 1;
  const rows = Math.ceil(canvas.height / spacing) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(new Dot(c * spacing, r * spacing));
    }
  }
}
initDots();
window.addEventListener("resize", initDots);

// Draw Pac-Man that moves across screen
let pacmanX = -30;
let pacmanSpeed = 2;
let pacmanRow = 0;

function drawPacman(x, y) {
  const size = 12;
  const mouthOpen = Math.abs(Math.sin(frame * 0.1)) * 0.3 + 0.05;

  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, 0, size, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = "#D97706";
  ctx.fill();

  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frame++;

  // Draw grid dots
  dots.forEach((d) => {
    d.update(frame);
    d.draw();
  });

  // Draw wandering Pacman across random rows
  const totalRows = Math.floor(canvas.height / spacing);
  const rowY = (pacmanRow % totalRows) * spacing + spacing / 2;
  drawPacman(pacmanX, rowY);
  pacmanX += pacmanSpeed;

  if (pacmanX > canvas.width + 30) {
    pacmanX = -30;
    pacmanRow = Math.floor(Math.random() * totalRows);
  }

  requestAnimationFrame(animate);
}
animate();
