/**
 * data.js — Carga y acceso a los datos JSON del juego
 */

const BASE = '.';

/** Carga y devuelve el listado de todas las cartas */
export async function loadCartas() {
  const res = await fetch(`${BASE}/data/cartas.json`);
  if (!res.ok) throw new Error('No se pudo cargar data/cartas.json');
  const json = await res.json();
  return json.cartas; // { el_loco: {...}, el_mago: {...}, ... }
}

/** Carga y devuelve la estructura de una tirada por id */
export async function loadEstructura(id) {
  const res = await fetch(`${BASE}/data/estructuras/${id}.json`);
  if (!res.ok) throw new Error(`No se pudo cargar data/estructuras/${id}.json`);
  return res.json();
}

/**
 * Lista estática de estructuras disponibles para la pantalla de selección.
 * Ampliar aquí cuando se agreguen nuevas estructuras.
 */
export function getEstructurasDisponibles() {
  return [
    {
      id: 'tiempo',
      nombre: 'Pasado · Presente · Futuro',
      descripcion: 'Línea temporal: origen, momento actual y lo que se aproxima',
      icono: '🕰️',
    },
  ];
}
