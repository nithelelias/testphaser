/**
 * cosmic-bg.js — Plugin visual de fondo cósmico (estrellas + nebulosas)
 * Uso: import './cosmic-bg.js';  (auto-init)
 */

(() => {
  const STAR_COUNT = 80;
  const NEBULA_COUNT = 4;
  const NEBULA_INTERVAL = [6000, 12000]; // ms entre apariciones

  const NEBULA_COLORS = [
    'rgba(92, 45, 145, 0.15)',   // purple
    'rgba(155, 89, 182, 0.12)',  // purple-light
    'rgba(200, 50, 150, 0.10)',  // fuchsia
    'rgba(180, 30, 120, 0.12)',  // fuchsia-dark
    'rgba(30, 60, 160, 0.12)',   // blue
    'rgba(60, 100, 200, 0.10)',  // blue-light
    'rgba(20, 80, 50, 0.10)',    // dark green
    'rgba(30, 110, 70, 0.12)',   // dark green-light
  ];

  // ── Contenedor ──
  const container = document.createElement('div');
  container.id = 'cosmic-bg';
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
  });
  document.body.prepend(container);

  // Asegurar que #app quede encima
  const app = document.getElementById('app');
  if (app) app.style.position = app.style.position || 'relative';

  // ── Estilo dinámico ──
  const style = document.createElement('style');
  style.textContent = `
    #cosmic-bg .star {
      position: absolute;
      border-radius: 50%;
      background: #fff;
      will-change: opacity, filter;
    }
    #cosmic-bg .nebula {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      will-change: opacity, transform;
      opacity: 0;
      transition: opacity 3s ease-in-out;
    }
    #cosmic-bg .nebula.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // ── Helpers ──
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Estrellas ──
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size = rand(1, 3);
    Object.assign(el.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${rand(0, 100)}%`,
      top: `${rand(0, 100)}%`,
      opacity: rand(0.2, 0.8),
    });
    container.appendChild(el);
    stars.push({
      el,
      baseOpacity: rand(0.3, 0.9),
      speed: rand(0.5, 2),      // ciclos por segundo (aprox)
      phase: rand(0, Math.PI * 2),
      brightPeak: rand(1.2, 2), // brightness máximo
    });
  }

  // Animación de brillo con requestAnimationFrame
  let lastTime = 0;
  function animateStars(now) {
    if (!lastTime) lastTime = now;
    const t = now / 1000; // segundos
    for (const s of stars) {
      const wave = Math.sin(t * s.speed + s.phase);          // -1..1
      const norm = (wave + 1) / 2;                            // 0..1
      const opacity = s.baseOpacity * (0.3 + 0.7 * norm);
      const brightness = 1 + (s.brightPeak - 1) * norm;
      s.el.style.opacity = opacity;
      s.el.style.filter = `brightness(${brightness})`;
    }
    requestAnimationFrame(animateStars);
  }
  requestAnimationFrame(animateStars);

  // ── Nebulosas ──
  function spawnNebula() {
    const el = document.createElement('div');
    el.className = 'nebula';
    const size = rand(150, 350);
    const color = pick(NEBULA_COLORS);
    Object.assign(el.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${rand(-10, 90)}%`,
      top: `${rand(-10, 90)}%`,
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
    });
    container.appendChild(el);

    // Fade in
    requestAnimationFrame(() => el.classList.add('visible'));

    // Duración de vida
    const life = rand(8000, 16000);
    setTimeout(() => {
      el.classList.remove('visible');
      // Eliminar del DOM tras la transición
      setTimeout(() => el.remove(), 3200);
    }, life);
  }

  // Generar nebulosas periódicamente
  function scheduleNebula() {
    const delay = rand(NEBULA_INTERVAL[0], NEBULA_INTERVAL[1]);
    setTimeout(() => {
      spawnNebula();
      scheduleNebula();
    }, delay);
  }

  // Arrancar con unas pocas nebulosas iniciales
  for (let i = 0; i < 2; i++) {
    setTimeout(() => spawnNebula(), rand(500, 2000));
  }
  scheduleNebula();
})();
