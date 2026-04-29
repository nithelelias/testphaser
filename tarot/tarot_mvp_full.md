# MVP Tarot — Sistema de Interpretación (Base + Contexto)

## 🎯 Objetivo del MVP
Construir un sistema capaz de generar interpretaciones dinámicas de tarot usando:
- 3 cartas
- 1 estructura base (pasado / presente / futuro)
- Composición modular de texto (base + contexto)

---

## 🧩 Concepto Central

El sistema separa:

- **Carta (base)** → significado semántico
- **Posición (contexto)** → rol narrativo
- **Resultado** → combinación de ambos

---

## 🏗️ Estructura de Tirada

```ts
type Tirada = {
  cartas: [string, string, string]; // pasado, presente, futuro
};
```

---

## 📦 Modelo de Datos (JSON)

```json
{
  "meta": {
    "estructura": "tiempo",
    "posiciones": ["pasado", "presente", "futuro"],
    "descripcion": "Interpretación basada en línea temporal"
  },
  "contexto": {
    "pasado": {
      "intro": [
        "En el pasado,",
        "Esto tiene su origen en"
      ],
      "cierre": [
        "y marcó el rumbo de la situación actual.",
        "dejando una huella que aún influye."
      ]
    },
    "presente": {
      "intro": [
        "Actualmente,",
        "En este momento,"
      ],
      "cierre": [
        "conviene observarlo con claridad.",
        "es importante no asumir demasiado."
      ]
    },
    "futuro": {
      "intro": [
        "Hacia adelante,",
        "En el futuro cercano,"
      ],
      "cierre": [
        "esto podría desarrollarse más.",
        "todo dependerá de cómo se maneje."
      ]
    }
  },
  "cartas": {
    "luna": {
      "nombre": "La Luna",
      "base": {
        "apertura": [
          "hay una sensación de confusión en esta relación",
          "algo no se percibe con total claridad"
        ],
        "desarrollo": [
          "puede haber cosas que no se están diciendo directamente",
          "es posible que existan interpretaciones equivocadas"
        ],
        "riesgo": [
          "lo que puede llevar a malentendidos",
          "generando dudas innecesarias"
        ]
      }
    }
  }
}
```

---

## ⚙️ Lógica de Generación

### Fórmula

```
resultado =
  contexto.intro +
  carta.base.apertura +
  carta.base.desarrollo +
  carta.base.riesgo +
  contexto.cierre
```

---

## 🔁 Flujo

1. Recibir 3 cartas
2. Asignar posiciones:
   - 0 → pasado
   - 1 → presente
   - 2 → futuro
3. Para cada carta:
   - obtener base
   - obtener contexto
   - seleccionar fragmentos aleatorios
   - construir frase
4. Retornar 3 resultados

---

## 🧠 Función en TypeScript

```ts
type Posicion = "pasado" | "presente" | "futuro";

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function interpretarCarta(data: any, cartaId: string, posicion: Posicion): string {
  const carta = data.cartas[cartaId];
  const contexto = data.contexto[posicion];

  return `${random(contexto.intro)} ${random(carta.base.apertura)}, ${random(carta.base.desarrollo)}, ${random(carta.base.riesgo)}. ${random(contexto.cierre)}`;
}

function interpretarTirada(data: any, cartas: [string, string, string]): string[] {
  const posiciones: Posicion[] = ["pasado", "presente", "futuro"];

  return cartas.map((cartaId, i) =>
    interpretarCarta(data, cartaId, posiciones[i])
  );
}
```

---

## 📏 Reglas del MVP

### Cartas
- ≥ 2 aperturas
- ≥ 2 desarrollos
- ≥ 2 riesgos

### Contexto
- ≥ 2 intros por posición
- ≥ 2 cierres por posición

---

## 🚫 Problemas a evitar

- Repetición excesiva
- Redundancia semántica
- Frases poco naturales

---

## 📈 Escalabilidad

- Nuevas estructuras (ej: problema / acción / resultado)
- Nuevos contextos (amor, trabajo, etc.)
- Pesos probabilísticos
- Variaciones gramaticales

---

## 🎯 Resultado esperado

Sistema:
- modular
- escalable
- coherente
- con alta variabilidad sin escribir cientos de textos únicos
