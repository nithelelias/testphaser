# Tarot App — Documento de Diseño UX/UI (MVP)

## Contexto

- App de tarot web, **mobile-first**
- Tecnología: JS puro + HTML/CSS (sin frameworks)
- 22 arcanos mayores con imágenes propias del usuario
- Sistema de interpretación modular basado en archivos JSON por estructura
- Lectura con voz (TTS) automática en español

---

## 1. Flujo de Usuario

```
[PANTALLA 0: Splash/Intro]
         ↓ (timeout 2.5s)
[PANTALLA 1: Selección de Estructura]
         ↓ (tap en estructura)
         ├── Si estructura normal → PANTALLA 2
         └── Si estructura con sub-selección (Ciclo Mujer) ↓
             [PANTALLA 1.5: Selección de Fase]
                ├── Elige fase directamente → PANTALLA 2
                └── "No sé" → muestra guía → elige fase → PANTALLA 2
[PANTALLA 2: Selección de Cartas (drag & drop)]
         ↓ (todos los slots llenos → tap "Revelar")
[PANTALLA 4: Revelación animada]
         ↓ (animación completa → auto-avanza)
[PANTALLA 5: Interpretación (slides + TTS)]
         ↓ (tap "Nueva tirada")
[PANTALLA 1: Selección de Estructura]  ← loop
```

---

## 2. Estructuras Disponibles

| Estructura | Posiciones | Archivo JSON |
|---|---|---|
| 🌙 Ciclo Mujer (sub-selección) | — | Redirige a P1.5 |
| ├── 🩸 Menstruación | energía actual · qué necesitas hoy · consejo para fluir | `ciclo_mujer_menstruacion.json` |
| ├── 🌱 Fase Folicular | energía actual · qué necesitas hoy · consejo para fluir | `ciclo_mujer_folicular.json` |
| ├── 🌕 Ovulación | energía actual · qué necesitas hoy · consejo para fluir | `ciclo_mujer_ovulacion.json` |
| └── 🍂 Fase Lútea | energía actual · qué necesitas hoy · consejo para fluir | `ciclo_mujer_lutea.json` |
| 🕰️ Pasado · Presente · Futuro | pasado · presente · futuro | `tiempo.json` |
| ❤️ Tirada del Amor | tú · la otra persona · la conexión · el obstáculo · el consejo | `amor.json` |

---

## 3. Mapa de Pantallas

### PANTALLA 0 — Splash / Intro

- Fondo negro con gradiente radial central (negro → púrpura oscuro)
- Símbolo central ✦ con efecto glow dorado
- Título "Tarot" centrado con tipografía Cinzel
- Subtítulo: "Descubre lo que las cartas revelan"
- Transición automática a P1 a los 2.5s

---

### PANTALLA 1 — Selección de Estructura

- Encabezado: "¿Qué deseas explorar?"
- Lista vertical de cards de estructura (`.estructura-card`)
- Cada card muestra:
  - Ícono representativo (emoji)
  - Nombre de la estructura
  - Descripción breve de 1 línea
- **Si la estructura tiene `subSeleccion: true`** (Ciclo Mujer): navega a P1.5
- **Si no**: carga la estructura JSON, inicializa selecciones dinámicas y navega a P2

---

### PANTALLA 1.5 — Selección de Fase (exclusiva Ciclo Mujer)

- Encabezado: "¿En qué fase estás?"
- Subtítulo: "Elige tu fase actual del ciclo"
- 4 botones de fase (`.fase-card`), cada uno con:
  - Ícono (🩸 🌱 🌕 🍂)
  - Nombre de la fase
  - Descripción breve
- Botón "🤔 No sé en qué fase estoy":
  - Toggle: muestra/oculta panel `.guia-fases`
  - Panel con 4 preguntas numeradas, una por fase
  - Cada pregunta incluye botón "Sí, es mi fase → [nombre]" que selecciona esa fase
- Botón "← Volver" regresa a P1
- Al elegir fase → carga la sub-estructura correspondiente y navega a P2

---

### PANTALLA 2 — Selección de Cartas (Drag & Drop)

- Encabezado: "Elige tus cartas"
- Instrucción: "Arrastra la carta a su posición"
- **Zona superior**: slots vacíos (`.slots-area`) según las posiciones de la estructura
  - Cada slot muestra el nombre de la posición y un icono ✦
  - Atributo `data-slot-count` para estilos responsive según cantidad de slots
  - Al recibir carta: muestra imagen (dorso) + nombre, borde dorado sólido
- **Zona inferior**: mazo apilado (`.deck-area`)
  - Hasta 3 sombras decorativas bajo la carta superior
  - Carta superior visible con dorso, arrastrable (`pointer events`)
  - Contador: "N cartas en el mazo"
- **Mecánica de drag**:
  - `pointerdown`: crea ghost semi-transparente que sigue al cursor/dedo
  - `pointermove`: detecta hover sobre slots vacíos (borde dorado + fondo sutil)
  - `pointerup`:
    - **Sobre slot vacío** → carta se deposita, `playPut()`, mazo se actualiza
    - **Sobre el mazo** → snap back con animación, carta no se mueve
    - **Fuera** → carta vuela al centro del mazo, se reordena al fondo (skip)
- **Cuando todos los slots están llenos**: el mazo se reemplaza por:
  - Botón "Revelar" (dorado, primario)
  - Botón "Volver a empezar" (ghost)

---

### PANTALLA 4 — Revelación

- Fondo oscuro con gradiente radial púrpura
- Las cartas seleccionadas se muestran en fila horizontal (`.flip-card`)
- Cada carta se revela con animación **flip 3D** (`rotateY(180deg)`):
  - Dorso genérico → imagen del arcano
  - Duración: 600ms con cubic-bezier
  - Delay escalonado: 900ms entre cada carta
- Al completar todas las revelaciones → transición automática a P5

---

### PANTALLA 5 — Interpretación (Slides + TTS)

- Pantalla fullscreen con slides verticales (`.lectura-slide`)
- Cada slide muestra la imagen de la carta centrada
- **Panel inferior fijo** (`.lectura-panel`) con gradiente fade-to-black:
  - Badge de posición (color púrpura)
  - Nombre del arcano (Cinzel, dorado)
  - Texto interpretativo completo (itálica, ligero)
- **Navegación entre slides**:
  - Desktop: scroll wheel (deltaY)
  - Mobile: touch swipe vertical (threshold 40px o velocidad 0.3)
  - Transición: `translateY` con ease-out + fade de opacity
- **TTS automático**: lee el texto de cada slide en voz femenina español
  - Botón mute flotante (esquina superior derecha)
  - Al cambiar de slide: pausa speech actual, fade out panel, reposiciona, fade in, speak
- Botón "Nueva tirada" en el último slide → resetea estado → P1

---

## 4. Interacciones y Transiciones

| Transición / Interacción | Descripción |
|---|---|
| Splash → Estructuras | Auto-avance 2.5s, animación `slideIn` |
| Entre pantallas | Slide horizontal (`translateX(28px)`) con ease-out, 320ms |
| Tap en estructura | Feedback active: `scale(0.97)` + borde dorado |
| Selección de fase | Misma interacción que estructura |
| "No sé" toggle | Muestra/oculta panel con `hidden` attribute |
| Drag carta (inicio) | Ghost clone escala 1.08 + rotación 3° + sombra intensa |
| Drag carta (hover slot) | Slot: borde dorado + fondo `rgba(gold, 0.08)` + glow |
| Drop en slot | Animación `slotFill` (scale 0.82→1, opacity 0→1), 320ms |
| Drop fuera (skip) | Ghost vuela al centro del mazo con ease-in-out, 350ms |
| Snap back al mazo | Ghost regresa al origen con cubic-bezier, 280ms |
| Nueva carta en mazo | Animación `deckCardIn` (translateY -10px, scale 0.96), 280ms |
| Flip revelación | `rotateY(180deg)` en `.flip-card__inner`, 650ms cubic-bezier |
| Delay entre flips | 900ms escalonado entre cada carta |
| Slides lectura | `translateY(±100%)` + opacity 0↔1, 500ms ease |
| Panel lectura | Opacity 0→1 con transición 400ms |
| Botón mute | `scale(0.9)` al tap |

---

## 5. Sistema Visual

### Paleta de Colores

| Token CSS | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0a0a0f` | Fondo base (negro cósmico) |
| `--color-surface` | `#12121a` | Superficies / cards |
| `--color-border` | `#2a2a3a` | Bordes sutiles |
| `--color-gold` | `#c9a227` | Acentos, bordes activos, CTAs |
| `--color-gold-light` | `#f0d060` | Glows, texto destacado |
| `--color-purple` | `#5c2d91` | Gradientes, detalles |
| `--color-purple-light` | `#9b59b6` | Badges, ilustraciones |
| `--color-text` | `#e8e0d5` | Texto principal |
| `--color-text-muted` | `#8a807a` | Texto secundario / placeholders |

### Tipografías (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
```

| Variable CSS | Fuente | Uso |
|---|---|---|
| `--font-title` | `'Cinzel', serif` | Títulos, nombres de arcanos, posiciones |
| `--font-body` | `'Lato', sans-serif` | Textos interpretativos, UI general |

### Estilo General

- Mobile-first, `max-width: 430px`, centrado con `margin: 0 auto`
- `border-radius: 12px` para cards de arcanos y slots
- `border-radius: 8px` para cards de estructura y fase
- Sombras con color dorado o púrpura suave (`box-shadow`)
- Imágenes de cartas con `aspect-ratio: 2 / 3`, `object-fit: cover`
- Slots adaptativos: `data-slot-count` controla tamaño para tiradas de 5+ cartas

---

## 6. Estructura de Datos

### Estructura JSON de tirada

```json
{
  "id": "ciclo_mujer_menstruacion",
  "nombre": "Ciclo Mujer · Menstruación",
  "descripcion": "Fase de soltar, descansar y reconectar con tu interior",
  "icono": "🩸",
  "posiciones": ["energía actual", "qué necesitas hoy", "consejo para fluir"],
  "contexto": {
    "energía actual": {
      "intro": ["Frase de apertura 1,", "Frase de apertura 2,"],
      "cierre": ["Frase de cierre 1.", "Frase de cierre 2."]
    }
  }
}
```

### Estado global (app.js)

```javascript
state = {
  pantalla: 0,
  estructuraId: null,    // id de la estructura cargada
  estructura: null,      // objeto JSON de la estructura
  cartasData: null,      // { el_loco: {...}, el_mago: {...}, ... }
  selecciones: [],       // array dinámico según posiciones (N nulls → N cartas)
  deck: [],              // cartas restantes (shuffled)
  resultado: [],         // [{posicion, carta, texto}] generado por engine
}
```

---

## 7. Estructura de Imágenes

### Convención de nombres

Las imágenes se ubican en `cards/` con el slug en minúsculas y sin tildes:

```
cards/el_loco.jpg
cards/el_mago.jpg
cards/la_sacerdotisa.jpg
... (un archivo por arcano)
cards/back.jpg   ← dorso genérico
```

### Tabla de los 22 Arcanos Mayores

| # | Nombre ES | Nombre EN | Slug |
|---|---|---|---|
| 0 | El Loco | The Fool | `el_loco` |
| I | El Mago | The Magician | `el_mago` |
| II | La Sacerdotisa | The High Priestess | `la_sacerdotisa` |
| III | La Emperatriz | The Empress | `la_emperatriz` |
| IV | El Emperador | The Emperor | `el_emperador` |
| V | El Hierofante | The Hierophant | `el_hierofante` |
| VI | Los Enamorados | The Lovers | `los_enamorados` |
| VII | El Carro | The Chariot | `el_carro` |
| VIII | La Fuerza | Strength | `la_fuerza` |
| IX | El Ermitaño | The Hermit | `el_ermitano` |
| X | La Rueda de la Fortuna | Wheel of Fortune | `la_rueda` |
| XI | La Justicia | Justice | `la_justicia` |
| XII | El Colgado | The Hanged Man | `el_colgado` |
| XIII | La Muerte | Death | `la_muerte` |
| XIV | La Templanza | Temperance | `la_templanza` |
| XV | El Diablo | The Devil | `el_diablo` |
| XVI | La Torre | The Tower | `la_torre` |
| XVII | La Estrella | The Star | `la_estrella` |
| XVIII | La Luna | The Moon | `la_luna` |
| XIX | El Sol | The Sun | `el_sol` |
| XX | El Juicio | Judgement | `el_juicio` |
| XXI | El Mundo | The World | `el_mundo` |

---

## 8. Archivos del Proyecto

```
index.html
index.css
index.js
js/
  app.js          — Estado global, navegación, delegación de eventos
  ui.js           — Renderizado de cada pantalla
  engine.js       — Lógica de interpretación de tirada
  data.js         — Carga de JSON, estructuras disponibles, fases del ciclo
  cards-map.js    — Mapeo de slugs a rutas de imagen
  sfx.js          — Sonidos (click, flip, put, return, melodía)
  cosmic-bg.js    — Fondo animado (canvas)
data/
  cartas.json     — Definición de los 22 arcanos
  estructuras/
    tiempo.json
    amor.json
    ciclo_mujer_menstruacion.json
    ciclo_mujer_folicular.json
    ciclo_mujer_ovulacion.json
    ciclo_mujer_lutea.json
cards/              — Imágenes de las cartas
sounds/             — Archivos de audio
```

## 6. Estructura de Archivos del Proyecto

```
tarot/
├── index.html                    ← entry point, Google Fonts, <main id="app">
├── index.css                     ← estilos globales y por pantalla
├── index.js                      ← entry point JS, importa js/app.js
├── tarot_design.md               ← este archivo
├── tarot_workplan.md             ← plan de trabajo
├── assets/
│   └── cards/
│       ├── el_loco.jpg
│       ├── el_mago.jpg
│       ├── ...                   ← 22 arcanos (aportados por usuario)
│       └── fallback.jpg
├── data/
│   ├── cartas.json               ← textos base de los 22 arcanos
│   └── estructuras/
│       ├── tiempo.json           ← pasado / presente / futuro
│       └── amor.json             ← (futuro)
└── js/
    ├── data.js                   ← fetch y acceso a datos
    ├── engine.js                 ← lógica de interpretación
    ├── ui.js                     ← render de pantallas
    └── app.js                    ← estado global, navigate(), init()
```

---

## 7. Estado Global (app state)

```js
const state = {
  pantalla: 0,                       // pantalla actualmente visible (0–5)
  estructuraId: null,                // id del JSON de estructura (ej: "tiempo")
  estructura: null,                  // objeto completo de la estructura cargada
  selecciones: [null, null, null],   // cartas elegidas: [posicion0, posicion1, posicion2]
  posicionActual: 0,                 // qué posición se está eligiendo ahora (0, 1, 2)
  resultado: []                      // array de objetos de interpretación final
};
```

### Forma de un objeto en `resultado[]`

```js
{
  posicion: "pasado",           // nombre de la posición
  carta: {
    id: "la_luna",
    nombre: "La Luna",
    slug: "la_luna"
  },
  texto: "En el pasado, hay una sensación de confusión..."
}
```
