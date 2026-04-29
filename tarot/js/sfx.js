/**
 * sfx.js — Efectos de sonido y música de la app
 */

const SFX = {
  flip:  new Audio('sounds/sfx-card-flip.mp3'),
  put:   new Audio('sounds/sfx-card-put.mp3'),
  return: new Audio('sounds/sfx-card-return.mp3'),
  click: new Audio('sounds/sfx-click.mp3'),
};

export function playFlip()  { SFX.flip.currentTime = 0; SFX.flip.play(); }
export function playPut()   { SFX.put.currentTime = 0;  SFX.put.play(); }
export function playClick() { SFX.click.currentTime = 0; SFX.click.play(); }
export function playReturn() { SFX.click.currentTime = 0; SFX.return.play(); }

// ── Música de fondo ──
const melody = new Audio('sounds/melody.mp3');
melody.loop = true;
melody.volume = 0;

let melodyStarted = false;

export function startMelody() {
  if (melodyStarted) return;
  melodyStarted = true;
  melody.play().then(() => {
    // Fade in de 0 → 0.4 en 500ms
    const steps = 25;
    const target = 0.4;
    const interval = 500 / steps;
    let step = 0;
    const fade = setInterval(() => {
      step++;
      melody.volume = Math.min(target, (step / steps) * target);
      if (step >= steps) clearInterval(fade);
    }, interval);
  }).catch(() => {});
}
