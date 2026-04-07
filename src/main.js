const canvas = document.getElementById("ambient");
const ctx = canvas.getContext("2d");
const reveals = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  width: 0,
  height: 0,
  particles: [],
  pointerX: 0.5,
  pointerY: 0.5,
};

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = state.width * dpr;
  canvas.height = state.height * dpr;
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(90, Math.max(36, state.width / 18)));
  state.particles = Array.from({ length: count }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    size: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.5 + 0.18,
  }));
}

function drawBackground() {
  ctx.clearRect(0, 0, state.width, state.height);

  const gradient = ctx.createRadialGradient(
    state.width * 0.55,
    state.height * 0.18,
    20,
    state.width * 0.55,
    state.height * 0.18,
    Math.max(state.width, state.height) * 0.8
  );
  gradient.addColorStop(0, "rgba(210, 164, 106, 0.1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  for (const particle of state.particles) {
    const dx = state.pointerX * state.width - particle.x;
    const dy = state.pointerY * state.height - particle.y;
    const dist = Math.max(Math.hypot(dx, dy), 0.001);
    const force = Math.min(1, 160 / dist);

    particle.vx += (dx / dist) * force * 0.01;
    particle.vy += (dy / dist) * force * 0.01;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = state.width + 20;
    if (particle.x > state.width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = state.height + 20;
    if (particle.y > state.height + 20) particle.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `rgba(245, 237, 227, ${particle.alpha})`;
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate() {
  drawBackground();
  if (!reduceMotion) {
    requestAnimationFrame(animate);
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.16 }
);

reveals.forEach((el) => observer.observe(el));

window.addEventListener("pointermove", (event) => {
  state.pointerX = event.clientX / window.innerWidth;
  state.pointerY = event.clientY / window.innerHeight;
});

window.addEventListener("resize", resize, { passive: true });

resize();
animate();
