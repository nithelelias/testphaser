/**
 * engine.js — Lógica de interpretación del tarot
 */

/** Devuelve un elemento aleatorio de un array */
export function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Genera el texto interpretativo para una carta en una posición dada.
 * @param {object} carta     — objeto de cartas.json (con base.apertura/desarrollo/riesgo)
 * @param {string} posicion  — "pasado" | "presente" | "futuro"
 * @param {object} estructura — objeto de estructuras/<id>.json (con contexto por posición)
 * @returns {string}
 */
export function interpretarCarta(carta, posicion, estructura) {
  const ctx = estructura.contexto[posicion];
  const base = carta.base;

  const intro      = random(ctx.intro);
  const apertura   = random(base.apertura);
  const desarrollo = random(base.desarrollo);
  const riesgo     = random(base.riesgo);
  const cierre     = random(ctx.cierre);

  return `${intro} ${apertura}, ${desarrollo}, ${riesgo}. ${cierre}`;
}

/**
 * Genera las interpretaciones para las 3 cartas de una tirada.
 * @param {string[]} selecciones  — array de ids de carta [posicion0, posicion1, posicion2]
 * @param {object}   estructura   — objeto completo de la estructura
 * @param {object}   cartasData   — objeto completo de cartas.json (.cartas)
 * @returns {Array<{posicion, carta, texto}>}
 */
export function interpretarTirada(selecciones, estructura, cartasData) {
  return selecciones.map((cartaId, i) => {
    const posicion = estructura.posiciones[i];
    const carta    = cartasData[cartaId];
    const texto    = interpretarCarta(carta, posicion, estructura);

    return {
      posicion,
      carta: {
        id:     carta.id,
        nombre: carta.nombre,
        slug:   carta.slug,
      },
      texto,
    };
  });
}
