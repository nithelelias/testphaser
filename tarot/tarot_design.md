# Tarot App — Documento de Diseño UX/UI (MVP)

## Contexto

- App de tarot web, **mobile-first**
- Tecnología: JS puro + HTML/CSS (sin frameworks)
- 22 arcanos mayores con imágenes propias del usuario
- Sistema de interpretación modular basado en archivos JSON por estructura

---

## 1. Flujo de Usuario

```
[PANTALLA 0: Splash/Intro]
         ↓ (tap o timeout 2.5s)
[PANTALLA 1: Selección de Estructura]
         ↓ (tap en estructura)
[PANTALLA 2: Selección de Cartas — posición 1: Pasado]
         ↓ (tap en carta)
[PANTALLA 2: Selección de Cartas — posición 2: Presente]
         ↓ (tap en carta)
[PANTALLA 2: Selección de Cartas — posición 3: Futuro]
         ↓ (tap en carta → auto-avanza)
[PANTALLA 3: Confirmación]
         ↓ (tap "Revelar")
[PANTALLA 4: Revelación animada]
         ↓ (animación completa → auto-avanza)
[PANTALLA 5: Interpretación]
         ↓ (tap "Nueva tirada")
[PANTALLA 1: Selección de Estructura]  ← loop
```

---

## 2. Mapa de Pantallas

### PANTALLA 0 — Splash / Intro

- Fondo negro con gradiente radial central (negro → púrpura oscuro)
- Logo o símbolo central (img/svg) con animación `fade-in` + leve `scale` al entrar
- Título de la app centrado con tipografía mística y efecto glow dorado
- Subtítulo o tagline breve
- Transición automática a los 2.5s o al primer tap del usuario

---

### PANTALLA 1 — Selección de Estructura

- Encabezado: "¿Qué deseas explorar?"
- Scroll horizontal de cards de estructura
- Cada card muestra:
  - Ícono representativo (emoji o svg)
  - Nombre de la estructura (ej: "Tiempo", "Amor", "Trabajo")
  - Descripción breve de 1 línea
- Al seleccionar: feedback visual (borde dorado + escala) → navega a P2

---

### PANTALLA 2 — Selección de Cartas

- Encabezado con nombre de la posición actual (ej: **"PASADO"**, **"PRESENTE"**, **"FUTURO"**)
- Indicador de progreso (ej: "Carta 1 de 3") como pills o barra
- Grid de las 22 cartas (2–3 columnas):
  - Imagen de la carta (`assets/cards/<slug>.jpg`)
  - Nombre del arcano centrado bajo la imagen
- **Estado seleccionada/usada:** overlay semitransparente + ícono ✓, `pointer-events: none`
- Al tocar una carta disponible: micro-animación de tap (scale) → avanza a siguiente posición o P3

---

### PANTALLA 3 — Confirmación

- Título: "Tu tirada"
- Las 3 cartas elegidas en fila o columna vertical:
  - Imagen de la carta
  - Nombre del arcano
  - Badge de posición (Pasado / Presente / Futuro)
- Botón CTA centrado: **"Revelar"** — dorado, tamaño grande
- Botón secundario: "Volver a elegir" (resetea selecciones, vuelve a P2 pos. 1)

---

### PANTALLA 4 — Revelación

- Fondo oscuro con efecto sutil (gradiente, partículas opcionales)
- Las 3 cartas se revelan **una a una** con delay de ~800ms entre cada una:
  - Animación **flip 3D** (rotateY 180°): cara trasera genérica → imagen del arcano
  - Duración del flip: 600ms con `cubic-bezier`
- Al completar las 3 revelaciones: transición automática a P5

---

### PANTALLA 5 — Interpretación

- Scroll vertical largo
- Por cada carta (pasado → presente → futuro):
  - Imagen de la carta (centrada, aspect-ratio 2/3)
  - Badge de posición con color temático
  - Nombre del arcano (h2, tipografía Cinzel)
  - Texto interpretativo completo generado por el engine
  - Separador visual entre cartas
- Botón **"Nueva tirada"** al final (resetea estado → vuelve a P1)

---

## 3. Interacciones y Transiciones

| Transición / Interacción | Descripción |
|---|---|
| Splash → Estructuras | Fade-out de splash + fade-in de P1 |
| Entre pantallas generales | Slide horizontal (`translateX`) con ease-out, ~300ms |
| Tap en carta (selección) | Scale breve (0.95 → 1.05 → 1.0) + overlay inmediato |
| Carta seleccionada (usada) | Overlay semitransparente + ícono ✓, `pointer-events: none` |
| Flip de carta en revelación | `rotateY(180deg)` en `.card-inner`, duración 600ms cubic-bezier |
| Delay entre cartas reveladas | 800ms de separación entre cada flip (`setTimeout` escalonado) |
| Botón "Revelar" | Pulse / glow dorado al hover/tap |
| Botón "Nueva tirada" | Fade-out P5 → fade-in P1 con reset de estado |

---

## 4. Sistema Visual

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
- `border-radius: 12px` para cards de arcanos
- `border-radius: 8px` para cards de estructura
- Sombras con color dorado o púrpura suave (`box-shadow`)
- Imágenes de cartas con `aspect-ratio: 2 / 3`, `object-fit: cover`

---

## 5. Estructura de Imágenes

### Convención de nombres

Las imágenes deben ubicarse en `assets/cards/` con el slug en minúsculas y sin tildes:

```
assets/cards/el_loco.jpg
assets/cards/el_mago.jpg
assets/cards/la_sacerdotisa.jpg
... (un archivo por arcano)
assets/cards/fallback.jpg   ← imagen de respaldo si falta la original
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
