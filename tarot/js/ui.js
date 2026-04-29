/**
 * ui.js — Renderizado de cada pantalla de la app
 */

import { getCardImage, CARD_BACK } from "./cards-map.js";
import { playFlip, playPut, playReturn } from "./sfx.js";

const app = document.getElementById("app");

function render(html) {
  app.innerHTML = html;
}

// ─── PANTALLA 0: Splash ───────────────────────────────────────────────────────

export function renderSplash() {
  render(`
    <div class="screen screen--splash">
      <div class="splash__content">
        <div class="splash__symbol">✦</div>
        <h1 class="splash__title">Tarot</h1>
        <p class="splash__subtitle">Descubre lo que las cartas revelan</p>
      </div>
    </div>
  `);
}

// ─── PANTALLA 1: Selección de estructura ─────────────────────────────────────

export function renderEstructuras(estructuras) {
  const cards = estructuras
    .map(
      (e) => `
    <button class="estructura-card" data-id="${e.id}">
      <span class="estructura-card__icon">${e.icono}</span>
      <span class="estructura-card__nombre">${e.nombre}</span>
      <span class="estructura-card__desc">${e.descripcion}</span>
    </button>
  `,
    )
    .join("");

  render(`
    <div class="screen screen--estructuras">
      <header class="screen__header">
        <h2 class="screen__title">¿Qué deseas explorar?</h2>
      </header>
      <div class="estructuras-list">
        ${cards}
      </div>
    </div>
  `);
}

// ─── PANTALLA 1.5: Selección de fase del ciclo ──────────────────────────────

export function renderSeleccionFase(fases) {
  const cards = fases
    .map(
      (f) => `
    <button class="fase-card" data-fase-id="${f.id}">
      <span class="fase-card__icon">${f.icono}</span>
      <span class="fase-card__nombre">${f.nombre}</span>
      <span class="fase-card__desc">${f.descripcion}</span>
    </button>
  `,
    )
    .join("");

  const preguntas = fases
    .map(
      (f, i) => `
    <div class="guia-fase">
      <span class="guia-fase__num">${i + 1}.</span>
      <div class="guia-fase__body">
        <p class="guia-fase__pregunta">${f.pregunta}</p>
        <button class="guia-fase__btn" data-fase-id="${f.id}">
          ${f.icono} Sí, es mi fase → ${f.nombre}
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  render(`
    <div class="screen screen--fases">
      <header class="screen__header">
        <h2 class="screen__title">¿En qué fase estás?</h2>
        <p class="fases__subtitle">Elige tu fase actual del ciclo</p>
      </header>
      <div class="fases-list">
        ${cards}
      </div>
      <button class="btn btn--ghost fases__no-se" id="btn-no-se">
        🤔 No sé en qué fase estoy
      </button>
      <div class="guia-fases" id="guia-fases" hidden>
        <p class="guia-fases__intro">Responde estas preguntas para identificar tu fase:</p>
        ${preguntas}
      </div>
      <button class="btn btn--ghost fases__volver" id="btn-volver-estructuras">
        ← Volver
      </button>
    </div>
  `);
}

// ─── PANTALLA 2: Selección de cartas (render inicial) ───────────────────────

export function renderSeleccionCartas(
  deck,
  cartasData,
  estructura,
  onDrop,
  onSkip,
) {
  const topCardId = deck[deck.length - 1];
  const topData = cartasData[topCardId];
  const shadowCount = Math.min(3, deck.length - 1);

  const shadows = Array.from({ length: shadowCount }, (_, i) => {
    const d = shadowCount - i;
    return `<div class="deck-shadow" style="--d:${d}"><img src="${CARD_BACK}" alt=""></div>`;
  }).join("");

  const slotItems = estructura.posiciones
    .map(
      (pos, i) => `
    <div class="slot" data-slot-index="${i}">
      <span class="slot__posicion">${pos}</span>
      <span class="slot__empty-icon">✦</span>
    </div>`,
    )
    .join("");

  render(`
    <div class="screen screen--seleccion-nueva">
      <header class="screen__header">
        <h2 class="screen__title">Elige tus cartas</h2>
        <p class="seleccion__instruccion">Arrastra la carta a su posición</p>
      </header>
      <div class="slots-area" data-slot-count="${estructura.posiciones.length}">${slotItems}</div>
      <div class="deck-area">
        <div class="deck">
          ${shadows}
          <div class="deck-card deck-card--top" data-carta-id="${topCardId}">
            <img class="deck-card__img" src="${CARD_BACK}" alt="${topData.nombre}" onerror="this.src='${CARD_BACK}'">
            <span class="deck-card__nombre">${topData.nombre}</span>
          </div>
        </div>
        <p class="deck-count">${deck.length} carta${deck.length !== 1 ? "s" : ""} en el mazo</p>
      </div>
    </div>
  `);

  _setupCardDrag(app, onDrop, onSkip);
}

function _animateNewTopCard() {
  const card = app.querySelector(".deck-card--top");
  if (!card) return;
  card.classList.remove("is-new");
  // Forzar reflow para que la animación se dispare de nuevo
  void card.offsetWidth;
  card.classList.add("is-new");
}

/** Actualiza un slot sin tocar el resto del DOM */
export function updateSlot(slotIndex, carta) {
  const slot = app.querySelector(`[data-slot-index="${slotIndex}"]`);
  if (!slot) return;
  const posicion = slot.querySelector(".slot__posicion").textContent;
  slot.classList.add("slot--filled");
  slot.innerHTML = `
    <span class="slot__posicion">${posicion}</span>
    <img class="slot__img" src="${CARD_BACK}" alt="${carta.nombre}">
    <span class="slot__label">${carta.nombre}</span>
  `;
}

/** Actualiza solo el mazo sin tocar los slots */
export function updateDeck(deck, cartasData, onDrop, onSkip) {
  if (deck.length === 0) {
    app.querySelector(".deck-area")?.remove();
    return;
  }

  const topCardId = deck[deck.length - 1];
  const topData = cartasData[topCardId];
  const shadowCount = Math.min(3, deck.length - 1);

  const shadows = Array.from({ length: shadowCount }, (_, i) => {
    const d = shadowCount - i;
    return `<div class="deck-shadow" style="--d:${d}"><img src="${CARD_BACK}" alt=""></div>`;
  }).join("");

  const deckEl = app.querySelector(".deck");
  if (deckEl) {
    deckEl.innerHTML = `
      ${shadows}
      <div class="deck-card deck-card--top" data-carta-id="${topCardId}">
        <img class="deck-card__img" src="${CARD_BACK}" alt="${topData.nombre}" onerror="this.src='${CARD_BACK}'">
        <span class="deck-card__nombre">${topData.nombre}</span>
      </div>
    `;
    _animateNewTopCard();
    _setupCardDrag(app, onDrop, onSkip);
  }

  const countEl = app.querySelector(".deck-count");
  if (countEl)
    countEl.textContent = `${deck.length} carta${deck.length !== 1 ? "s" : ""} en el mazo`;
}

/** Reemplaza el mazo por los botones de acción cuando todos los slots están llenos */
export function showRevealButtons() {
  app.querySelector(".deck-area")?.remove();
  const screen = app.querySelector(".screen--seleccion-nueva");
  if (!screen) return;
  const actions = document.createElement("div");
  actions.className = "confirm-actions";
  actions.innerHTML = `
    <button class="btn btn--primary" id="btn-revelar">Revelar</button>
    <button class="btn btn--ghost" id="btn-volver">Volver a empezar</button>
  `;
  screen.appendChild(actions);
}

function _setupCardDrag(appEl, onDrop, onSkip) {
  const topCard = appEl.querySelector(".deck-card--top");
  if (!topCard) return;

  const cartaId = topCard.dataset.cartaId;

  topCard.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    topCard.setPointerCapture(e.pointerId);

    const rect = topCard.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;

    // Ghost que sigue al dedo/cursor
    const ghost = topCard.cloneNode(true);
    ghost.style.cssText = `
      position:fixed; top:${rect.top}px; left:${rect.left}px;
      width:${rect.width}px; height:${rect.height}px;
      pointer-events:none; z-index:9999; opacity:0.92;
      transform:scale(1.08) rotate(3deg);
      border-radius:12px; transition:none;
      animation:none;
      box-shadow:0 20px 48px rgba(0,0,0,0.7);
    `;
    // Cancelar cualquier animación heredada en subelementos del ghost
    ghost.querySelectorAll("*").forEach((el) => {
      el.style.animation = "none";
    });
    document.body.appendChild(ghost);
    topCard.style.transition = "opacity 0.12s";
    topCard.style.opacity = "0.25";

    let activeSlot = null;

    function slotUnder(x, y) {
      ghost.style.display = "none";
      const el = document.elementFromPoint(x, y);
      ghost.style.display = "";
      return el?.closest("[data-slot-index]") ?? null;
    }

    function onMove(e) {
      ghost.style.left = `${e.clientX - offX}px`;
      ghost.style.top = `${e.clientY - offY}px`;

      const slot = slotUnder(e.clientX, e.clientY);
      if (slot !== activeSlot) {
        activeSlot?.classList.remove("slot--hover");
        activeSlot =
          slot && !slot.classList.contains("slot--filled") ? slot : null;
        activeSlot?.classList.add("slot--hover");
      }
    }

    function onUp(e) {
      topCard.removeEventListener("pointermove", onMove);
      topCard.removeEventListener("pointerup", onUp);
      topCard.removeEventListener("pointercancel", onUp);

      const slot = slotUnder(e.clientX, e.clientY);
      activeSlot?.classList.remove("slot--hover");

      if (slot && !slot.classList.contains("slot--filled")) {
        ghost.remove();
        topCard.style.transition = "";
        topCard.style.opacity = "";
        onDrop(cartaId, parseInt(slot.dataset.slotIndex));
        playPut();
        return;
      }

      // Leer posición lógica del ghost desde sus propiedades CSS directas
      // (no getBoundingClientRect, que está distorsionado por scale/rotate)
      const ghostLeft = parseFloat(ghost.style.left);
      const ghostTop = parseFloat(ghost.style.top);
      const ghostW = rect.width;
      const ghostH = rect.height;

      const deckEl = appEl.querySelector(".deck");
      const deckRect = deckEl?.getBoundingClientRect();

      // El ghost sigue solapando el mazo si cualquier parte de su caja lógica intersecta el deck
      const overlaps =
        deckRect &&
        ghostLeft < deckRect.right &&
        ghostLeft + ghostW > deckRect.left &&
        ghostTop < deckRect.bottom &&
        ghostTop + ghostH > deckRect.top;

      if (overlaps) {
        // Snap back → regresar exactamente al origen
        ghost.style.transition = [
          "left 0.28s cubic-bezier(0.22,1,0.36,1)",
          "top 0.28s cubic-bezier(0.22,1,0.36,1)",
          "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          "opacity 0.2s ease",
        ].join(",");
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.transform = "scale(1) rotate(0deg)";
        ghost.style.opacity = "0";
        ghost.addEventListener(
          "transitionend",
          () => {
            ghost.remove();
            topCard.style.transition = "";
            topCard.style.opacity = "";
          },
          { once: true },
        );
      } else {
        // Fuera del mazo → volar al centro del deck y reordenar
        const destLeft = deckRect
          ? deckRect.left + (deckRect.width - ghostW) / 2
          : rect.left;
        const destTop = deckRect
          ? deckRect.top + (deckRect.height - ghostH) / 2
          : rect.top;

        ghost.style.transition = [
          "left 0.35s cubic-bezier(0.4,0,0.2,1)",
          "top 0.35s cubic-bezier(0.4,0,0.2,1)",
          "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          "opacity 0.3s ease",
        ].join(",");
        ghost.style.left = `${destLeft}px`;
        ghost.style.top = `${destTop}px`;
        ghost.style.transform = "scale(0.72) rotate(-6deg)";
        ghost.style.opacity = "0";
        ghost.addEventListener(
          "transitionend",
          () => {
            ghost.remove();
            topCard.style.transition = "";
            topCard.style.opacity = "";
            onSkip(cartaId);
            playReturn();
          },
          { once: true },
        );
      }
    }

    topCard.addEventListener("pointermove", onMove);
    topCard.addEventListener("pointerup", onUp);
    topCard.addEventListener("pointercancel", onUp);
  });
}

// ─── PANTALLA 3: Confirmación ─────────────────────────────────────────────────

export function renderConfirmacion(selecciones, estructura, cartasData) {
  const items = selecciones
    .map((cartaId, i) => {
      const carta = cartasData[cartaId];
      const posicion = estructura.posiciones[i];
      return `
      <div class="confirm-carta">
        <img class="confirm-carta__img" src="${CARD_BACK}" alt="Carta oculta">
        <span class="confirm-carta__posicion">${posicion}</span>
        <span class="confirm-carta__nombre">${carta.nombre}</span>
      </div>
    `;
    })
    .join("");

  render(`
    <div class="screen screen--confirmacion">
      <header class="screen__header">
        <h2 class="screen__title">Tu tirada</h2>
      </header>
      <div class="confirm-cartas">
        ${items}
      </div>
      <div class="confirm-actions">
        <button class="btn btn--primary" id="btn-revelar">Revelar</button>
        <button class="btn btn--ghost" id="btn-volver">Volver a elegir</button>
      </div>
    </div>
  `);
}

// ─── PANTALLA 4: Revelación ───────────────────────────────────────────────────

export function renderRevelacion(selecciones, cartasData, onFinish) {
  const items = selecciones
    .map((cartaId) => {
      const carta = cartasData[cartaId];
      const img = getCardImage(carta.id);
      return `
      <div class="flip-card" data-carta-id="${carta.id}">
        <div class="flip-card__inner">
          <div class="flip-card__back">
            <img src="${CARD_BACK}" alt="Reverso">
          </div>
          <div class="flip-card__front">
            <img src="${img}" alt="${carta.nombre}" onerror="this.src='${CARD_BACK}'">
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  render(`
    <div class="screen screen--revelacion">
      <div class="revelacion-cartas">
        ${items}
      </div>
    </div>
  `);

  // Flip escalonado
  const cards = app.querySelectorAll(".flip-card");
  cards.forEach((card, i) => {
    setTimeout(
      () => {
        card.classList.add("flipped");
        playFlip();
        if (i === cards.length - 1) {
          setTimeout(onFinish, 800);
        }
      },
      600 + i * 900,
    );
  });
}

// ─── PANTALLA 5: Interpretación ───────────────────────────────────────────────

export function renderInterpretacion(resultado) {
  const slides = resultado
    .map((r, i) => {
      const img = getCardImage(r.carta.id);
      return `
      <section class="lectura-slide" data-index="${i}">
        <img class="lectura-slide__img" src="${img}" alt="${r.carta.nombre}" onerror="this.src='${CARD_BACK}'">
      </section>
    `;
    })
    .join("");

  render(`
    <div class="screen screen--lectura">
      <button class="lectura-mute" id="btn-mute" aria-label="Silenciar voz">🔊</button>
      ${slides}
      <div class="lectura-panel">
        <span class="lectura-panel__badge badge"></span>
        <h2 class="lectura-panel__nombre"></h2>
        <p class="lectura-panel__texto"></p>
        <button class="btn btn--primary lectura-panel__cta" id="btn-nueva-tirada" hidden>Nueva tirada</button>
      </div>
    </div>
  `);

  const screenEl = app.querySelector(".screen--lectura");
  const panel = app.querySelector(".lectura-panel");
  const badge = panel.querySelector(".lectura-panel__badge");
  const nombre = panel.querySelector(".lectura-panel__nombre");
  const texto = panel.querySelector(".lectura-panel__texto");
  const cta = panel.querySelector(".lectura-panel__cta");
  const allSlides = Array.from(screenEl.querySelectorAll(".lectura-slide"));

  let current = 0;
  let isAnimating = false;
  let isMuted = false;

  // ── Botón mute ──
  const muteBtn = screenEl.querySelector("#btn-mute");
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    if (isMuted) stopSpeech();
  });

  // ── Speech TTS (API nativa, voz femenina) ──
  const synth = window.speechSynthesis ?? null;
  let femaleVoice = null;

  function findFemaleVoice() {
    if (!synth) return;
    const voices = synth.getVoices();
    femaleVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("es") &&
          /(female|femenin|mujer|paulina|conchita|mónica|lucia)/i.test(v.name),
      ) ??
      voices.find((v) => v.lang.startsWith("es")) ??
      null;
  }

  if (synth) {
    findFemaleVoice();
    synth.addEventListener("voiceschanged", findFemaleVoice);
  }

  function speakText(text) {
    try {
      if (!synth || isMuted) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      utter.rate = 0.95;
      utter.pitch = 1.1;
      utter.volume = 0.6;
      if (femaleVoice) utter.voice = femaleVoice;
      synth.speak(utter);
    } catch (error) {
      console.warn("Error al reproducir voz:", error);
    }
  }

  function stopSpeech() {
    try {
      if (!synth) return;
      synth.cancel();
    } catch (error) {
      console.warn("Error al cancelar voz:", error);
    }
  }

  // Posicionar slides según índice actual
  function layoutSlides() {
    allSlides.forEach((slide, i) => {
      if (i < current) slide.dataset.pos = "above";
      else if (i === current) slide.dataset.pos = "center";
      else slide.dataset.pos = "below";
    });
  }

  function setPanel(index) {
    const r = resultado[index];
    const isLast = index === resultado.length - 1;
    badge.textContent = r.posicion;
    nombre.textContent = r.carta.nombre;
    texto.textContent = r.texto;
    cta.hidden = !isLast;
  }

  function goTo(index) {
    if (
      index < 0 ||
      index >= allSlides.length ||
      index === current ||
      isAnimating
    )
      return;
    isAnimating = true;

    // Parar voz al desplazarse
    stopSpeech();

    // Fade out panel
    panel.classList.remove("is-visible");

    current = index;
    layoutSlides();

    // Esperar que la transición de los slides termine, luego actualizar panel
    setTimeout(() => {
      setPanel(current);
      panel.classList.add("is-visible");
      // Leer el texto de la nueva carta
      speakText(resultado[current].texto);
      isAnimating = false;
    }, 500);
  }

  // ── Wheel (desktop) ──
  screenEl.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (isAnimating) return;
      if (e.deltaY > 0) goTo(current + 1);
      else if (e.deltaY < 0) goTo(current - 1);
    },
    { passive: false },
  );

  // ── Touch (mobile) ──
  let touchStartY = 0;
  let touchStartTime = 0;

  screenEl.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    },
    { passive: true },
  );

  screenEl.addEventListener(
    "touchend",
    (e) => {
      if (isAnimating) return;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const elapsed = Date.now() - touchStartTime;
      const velocity = Math.abs(deltaY) / elapsed;

      // Umbral: 40px de desplazamiento o velocidad alta
      if (Math.abs(deltaY) > 40 || velocity > 0.3) {
        if (deltaY > 0)
          goTo(current + 1); // swipe up → siguiente
        else goTo(current - 1); // swipe down → anterior
      }
    },
    { passive: true },
  );

  // Estado inicial
  layoutSlides();
  setPanel(0);
  panel.classList.add("is-visible");
  // Leer la primera carta
  setTimeout(() => speakText(resultado[0].texto), 600);
}
