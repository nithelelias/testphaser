import { onListen, update } from "../connect.js";

const dataEl = document.getElementById("data");
const btn = document.getElementById("updateBtn");

onListen((json) => {
  dataEl.textContent = JSON.stringify(json, null, 2);
});

// 🔹 Simular que el admin actualiza el JSON
btn.onclick = () => {
  const nuevo = {
    mensaje: "Hola desde admin",
    fecha: new Date().toISOString(),
  };

  update(nuevo);
};
