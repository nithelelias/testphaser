/**
 * Diccionario: id de carta (español) → ruta de imagen
 * Las imágenes se encuentran en /cards/ con nombres en inglés.
 */
export const CARDS_IMAGE_MAP = {
  el_loco:         'cards/fool.png',
  el_mago:         'cards/magician.png',
  la_sacerdotisa:  'cards/high-priestess.png',
  la_emperatriz:   'cards/empress.png',
  el_emperador:    'cards/emperor.png',
  el_hierofante:   'cards/hierophant.png',
  los_enamorados:  'cards/lovers.png',
  el_carro:        'cards/chariot.png',
  la_fuerza:       'cards/strength.png',
  el_ermitano:     'cards/hermit.png',
  la_rueda:        'cards/wheel-of-fortune.png',
  la_justicia:     'cards/justice.png',
  el_colgado:      'cards/hanged-man.png',
  la_muerte:       'cards/death.png',
  la_templanza:    'cards/temperance.png',
  el_diablo:       'cards/devil.png',
  la_torre:        'cards/tower.png',
  la_estrella:     'cards/star.png',
  la_luna:         'cards/moon.png',
  el_sol:          'cards/sun.png',
  el_juicio:       'cards/judgement.png',
  el_mundo:        'cards/world.png',
};

/** Reverso genérico de carta */
export const CARD_BACK = 'cards/back.png';

/**
 * Devuelve la ruta de imagen de una carta por su id.
 * Si no existe, retorna el fallback (reverso).
 * @param {string} id
 * @returns {string}
 */
export function getCardImage(id) {
  return CARDS_IMAGE_MAP[id] ?? CARD_BACK;
}
