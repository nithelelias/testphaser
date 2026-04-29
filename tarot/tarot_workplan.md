# Tarot App — Plan de Trabajo (MVP)

> Estado: 🔴 No iniciado  
> Última actualización: 2026-04-29  
> Referencia de diseño: `tarot_design.md`

---

## FASE 1 — Datos

- [ ] Crear `data/cartas.json` con los 22 arcanos mayores
  - Campos por carta: `id`, `nombre`, `slug`, `base.apertura` (×2), `base.desarrollo` (×2), `base.riesgo` (×2)
- [ ] Crear `data/estructuras/tiempo.json`
  - Campos: `id`, `nombre`, `descripcion`, `posiciones[]`, y por posición: `intro` (×2), `cierre` (×2)
- [ ] Definir y documentar convención de nombres de imágenes (`assets/cards/<slug>.jpg`)

---

## FASE 2 — Lógica JS

- [ ] **`js/data.js`**
  - `loadCartas()` — fetch de `data/cartas.json`
  - `loadEstructura(id)` — fetch de `data/estructuras/<id>.json`
  - `loadEstructurasDisponibles()` — lista de estructuras para P1

- [ ] **`js/engine.js`**
  - `random(array)` — selección aleatoria de un elemento
  - `interpretarCarta(carta, posicion, estructuraData)` — genera texto para una carta
  - `interpretarTirada(selecciones, estructuraData, cartasData)` — retorna array `resultado[]`

- [ ] **`js/app.js`**
  - Definir objeto `state` con campos: `pantalla`, `estructuraId`, `estructura`, `selecciones`, `posicionActual`, `resultado`
  - `init()` — carga datos iniciales, muestra P0
  - `navigate(pantalla)` — actualiza `state.pantalla` y llama render correspondiente
  - Delegación de eventos desde `#app`
  - `resetState()` — limpia selecciones y resultado para nueva tirada

- [ ] **`js/ui.js`**
  - `renderSplash()` — Pantalla 0: logo, título, fade-in
  - `renderEstructuras(lista)` — Pantalla 1: scroll horizontal de cards
  - `renderSeleccionCartas(cartas, posicion, selecciones)` — Pantalla 2: grid + estados
  - `renderConfirmacion(selecciones, estructura)` — Pantalla 3: resumen + botón revelar
  - `renderRevelacion(selecciones)` — Pantalla 4: flip 3D escalonado
  - `renderInterpretacion(resultado)` — Pantalla 5: scroll vertical con textos

---

## FASE 3 — HTML

- [ ] Refactorizar `index.html`
  - `<meta viewport>` correcto
  - Google Fonts: `Cinzel` + `Lato`
  - `<link rel="stylesheet" href="index.css">`
  - `<main id="app"></main>` como único punto de montaje
  - `<script type="module" src="index.js">` (index.js importa js/app.js)

---

## FASE 4 — CSS / UI

- [ ] **Variables CSS en `:root`**
  - Colores: `--color-bg`, `--color-surface`, `--color-border`, `--color-gold`, `--color-gold-light`, `--color-purple`, `--color-purple-light`, `--color-text`, `--color-text-muted`
  - Tipografías: `--font-title`, `--font-body`
  - Espaciados: `--space-sm`, `--space-md`, `--space-lg`

- [ ] **Layout base mobile**
  - `max-width: 430px`, centrado, `min-height: 100dvh`, fondo `--color-bg`
  - Transición de entrada/salida entre pantallas (slide horizontal)
  - Clase `.screen` para cada pantalla, `.screen--active` para visible

- [ ] **Pantalla Splash (P0)**
  - Animación `@keyframes fadeInScale` al cargar
  - Título con `text-shadow` glow dorado
  - Gradiente radial en fondo

- [ ] **Pantalla Estructuras (P1)**
  - `overflow-x: auto`, `display: flex`, `gap`, `scroll-snap-type: x mandatory`
  - Cards con estado hover/active y borde dorado al seleccionar

- [ ] **Pantalla Selección de Cartas (P2)**
  - Grid 2–3 columnas con `aspect-ratio: 2/3` en imágenes
  - `.card--selected`: overlay semitransparente + ícono ✓
  - `.card--disabled`: `pointer-events: none`, `opacity: 0.4`
  - Micro-animación de tap: `@keyframes tapFeedback` con scale

- [ ] **Pantalla Confirmación (P3)**
  - Layout central con 3 cartas + badges de posición
  - Botón "Revelar" grande, dorado, con efecto pulse/glow

- [ ] **Pantalla Revelación (P4)**
  - `.card-flip` con `perspective: 800px`
  - `.card-inner` con `transform-style: preserve-3d`
  - `.card-front`, `.card-back` con `backface-visibility: hidden`
  - `.card-flip.flipped .card-inner` → `rotateY(180deg)`, duración 600ms

- [ ] **Pantalla Interpretación (P5)**
  - Scroll vertical con `overflow-y: auto`
  - Imagen de carta con `max-width: 140px`, centrada
  - Badge de posición con color temático (`--color-purple-light`)
  - Interlineado generoso para el texto interpretativo (`line-height: 1.8`)
  - Separador visual entre cartas (`border-top` o `<hr>` estilizada)

---

## FASE 5 — Assets

- [ ] Crear carpeta `assets/cards/`
- [ ] Conseguir/preparar imágenes de los 22 arcanos (responsabilidad del usuario)
  - Formato: `.jpg` o `.webp`
  - Relación de aspecto: `2:3` (portrait)
  - Resolución mínima: 300px de ancho
  - Nombres según slugs definidos en `tarot_design.md` (sección 5)
- [ ] Añadir imagen de fallback en `assets/cards/fallback.jpg`

---

## FASE 6 — Testing y Ajuste

- [ ] Probar flujo completo en Chrome DevTools (viewport: iPhone 12/14)
- [ ] Verificar transiciones y animaciones sin jank ni flashes
- [ ] Revisar legibilidad de todos los textos en pantalla pequeña
- [ ] Verificar que las cartas ya seleccionadas no se pueden volver a elegir
- [ ] Probar con imágenes faltantes → debe mostrar `fallback.jpg`
- [ ] Verificar que "Nueva tirada" resetea el estado completamente
- [ ] Revisión de tap targets ≥ 44px (accesibilidad básica táctil)
- [ ] Revisión de contraste de texto sobre fondos oscuros

---

## Decisiones de diseño registradas

| Decisión | Justificación |
|---|---|
| Un JSON por estructura | Escalabilidad — fácil agregar amor, trabajo, etc. |
| Módulos JS separados por responsabilidad | Mantenibilidad — data / engine / ui / app |
| `index.js` como entry point → importa `js/app.js` | Compatibilidad con estructura HTML existente |
| Imágenes aportadas por el usuario | Libertad de estilo artístico |
| Mobile-first, max 430px | UX prioritaria en móvil |
| Google Fonts: Cinzel + Lato | Estética mística + legibilidad |
