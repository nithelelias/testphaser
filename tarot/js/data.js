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
      id: 'ciclo_mujer',
      nombre: 'Ciclo Mujer',
      descripcion: 'Lectura sobre las fases del ciclo femenino: menstruación, folicular, ovulación y lútea',
      icono: '🌙',
      subSeleccion: true,
    },
    {
      id: 'tiempo',
      nombre: 'Pasado · Presente · Futuro',
      descripcion: 'Línea temporal: origen, momento actual y lo que se aproxima',
      icono: '🕰️',
    },
    {
      id: 'amor',
      nombre: 'Tirada del Amor',
      descripcion: 'Explora los sentimientos, la conexión y el destino de una relación',
      icono: '❤️',
    },
  ];
}

/**
 * Fases del ciclo menstrual para la sub-selección de "Ciclo Mujer".
 */
export function getFasesCicloMujer() {
  return [
    {
      id: 'ciclo_mujer_menstruacion',
      nombre: 'Menstruación',
      icono: '🩸',
      descripcion: 'Fase de soltar, descansar y reconectar',
      pregunta: '¿Estás sangrando actualmente o acabas de empezar tu periodo?',
    },
    {
      id: 'ciclo_mujer_folicular',
      nombre: 'Fase Folicular',
      icono: '🌱',
      descripcion: 'Fase de renacimiento y creatividad',
      pregunta: '¿Tu periodo terminó hace poco y sientes que tu energía empieza a subir?',
    },
    {
      id: 'ciclo_mujer_ovulacion',
      nombre: 'Ovulación',
      icono: '🌕',
      descripcion: 'Fase de plenitud y máxima expresión',
      pregunta: '¿Estás a mitad de tu ciclo y te sientes con mucha energía, sociable o creativa?',
    },
    {
      id: 'ciclo_mujer_lutea',
      nombre: 'Fase Lútea',
      icono: '🍂',
      descripcion: 'Fase de introspección y sensibilidad',
      pregunta: '¿Sientes que tu energía baja, estás más sensible o con antojos? ¿Falta poco para tu periodo?',
    },
  ];
}
