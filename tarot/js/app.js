/**
 * app.js — Estado global, navegación y orquestación de la app
 */

import { loadCartas, loadEstructura, getEstructurasDisponibles } from './data.js';
import { interpretarTirada } from './engine.js';
import { playClick, startMelody } from './sfx.js';
import {
  renderSplash,
  renderEstructuras,
  renderSeleccionCartas,
  updateSlot,
  updateDeck,
  showRevealButtons,
  renderRevelacion,
  renderInterpretacion,
} from './ui.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Estado global ────────────────────────────────────────────────────────────

const state = {
  pantalla: 0,
  estructuraId: null,
  estructura: null,
  cartasData: null,
  selecciones: [null, null, null],
  deck: [],
  resultado: [],
};

function resetState() {
  state.pantalla = 1;
  state.estructuraId = null;
  state.estructura = null;
  state.selecciones = [null, null, null];
  state.deck = shuffle(Object.keys(state.cartasData));
  state.resultado = [];
}

function refreshSeleccion() {
  renderSeleccionCartas(
    state.deck,
    state.cartasData,
    state.estructura,
    handleCardDrop,
    handleCardSkip,
  );
}

function handleCardDrop(cartaId, slotIndex) {
  state.selecciones[slotIndex] = cartaId;
  state.deck = state.deck.filter(id => id !== cartaId);

  updateSlot(slotIndex, state.cartasData[cartaId]);

  if (state.selecciones.every(s => s !== null)) {
    showRevealButtons();
  } else {
    updateDeck(state.deck, state.cartasData, handleCardDrop, handleCardSkip);
  }
}

function handleCardSkip(cartaId) {
  // Mueve la carta del tope al fondo del mazo
  state.deck = [cartaId, ...state.deck.slice(0, -1)];
  updateDeck(state.deck, state.cartasData, handleCardDrop, handleCardSkip);
}

// ─── Navegación ───────────────────────────────────────────────────────────────

function navigate(pantalla) {
  state.pantalla = pantalla;

  switch (pantalla) {
    case 0:
      renderSplash();
      setTimeout(() => navigate(1), 2500);
      break;

    case 1:
      renderEstructuras(getEstructurasDisponibles());
      break;

    case 2:
      refreshSeleccion();
      break;

    case 4:
      renderRevelacion(state.selecciones, state.cartasData, () => navigate(5));
      break;

    case 5:
      renderInterpretacion(state.resultado);
      break;
  }
}

// ─── Delegación de eventos ────────────────────────────────────────────────────

document.getElementById('app').addEventListener('click', async (e) => {
  // P1 → seleccionar estructura
  const estructuraCard = e.target.closest('.estructura-card');
  if (estructuraCard) {
    startMelody();
    playClick();
    const id = estructuraCard.dataset.id;
    state.estructuraId = id;
    state.estructura = await loadEstructura(id);
    state.selecciones = [null, null, null];
    state.deck = shuffle(Object.keys(state.cartasData));
    navigate(2);
    return;
  }

  // P2 → revelar (todas las cartas elegidas)
  if (e.target.id === 'btn-revelar') {
    playClick();
    state.resultado = interpretarTirada(
      state.selecciones,
      state.estructura,
      state.cartasData,
    );
    navigate(4);
    return;
  }

  // P2 → volver a empezar
  if (e.target.id === 'btn-volver') {
    playClick();
    state.selecciones = [null, null, null];
    state.deck = shuffle(Object.keys(state.cartasData));
    navigate(2);
    return;
  }

  // P5 → nueva tirada
  if (e.target.id === 'btn-nueva-tirada') {
    playClick();
    resetState();
    navigate(1);
    return;
  }
});

// ─── Inicialización ───────────────────────────────────────────────────────────

export async function init() {
  state.cartasData = await loadCartas();
  navigate(0);
}
