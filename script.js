// ===== Subtle Particle Network Background =====
const canvas = document.getElementById("dots");
const ctx = canvas.getContext("2d");
let particles = [];
let frame = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particleCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 25000));
const connectionDistance = 120;
const maxConnections = 3;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.size = Math.random() * 1.5 + 1;
    this.opacity = Math.random() * 0.35 + 0.25;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}
initParticles();
window.addEventListener("resize", initParticles);

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    let connections = 0;
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance && connections < maxConnections) {
        const opacity = (1 - distance / connectionDistance) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        connections++;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frame++;

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  drawConnections();

  requestAnimationFrame(animate);
}
animate();

// ===== Name Text Reveal Animation =====
function initNameAnimation() {
  const nameElement = document.querySelector(".name-visible");
  if (!nameElement) return;

  const text = nameElement.textContent;
  nameElement.textContent = "";
  nameElement.setAttribute("aria-hidden", "true");

  const chars = text.split("");
  chars.forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "name-char";
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.animationDelay = `${0.25 + index * 0.04}s`;
    nameElement.appendChild(span);
  });
}

initNameAnimation();
