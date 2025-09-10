import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// 🔹 Pega aquí tu configuración de Firebase (la que sacaste de la consola)
const firebaseConfig = {
  apiKey: "AIzaSyDaOMN5FLpOJg2-ZArnSEosnOzRwkyqtPs",
  authDomain: "dnd-session-group.firebaseapp.com",
  databaseURL: "https://dnd-session-group-default-rtdb.firebaseio.com",
  projectId: "dnd-session-group",
  storageBucket: "dnd-session-group.firebasestorage.app",
  messagingSenderId: "940240758386",
  appId: "1:940240758386:web:0bf869a17c4337f14784eb",
};

const EventHolder = {
  listen: [],
};
const storage = { data: {} };
// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referencia al nodo principal
const dataRef = ref(db, "mainJSON");

// 🔹 Escuchar cambios en tiempo real
onValue(dataRef, (snapshot) => {
  const json = snapshot.val();
  storage.data = { ...json };
  EventHolder.listen.forEach((e) => {
    if (e.active) e.callback(json);
  });
});

////
export function onListen(callback) {
  const holder = { active: true, callback };
  EventHolder.listen.push(holder);
  callback(storage.data);
  return () => {
    holder.active = false;
    EventHolder.listen = EventHolder.listen.filter((_holder) => _holder.active);
  };
}

export function update(json) {
  set(dataRef, { ...json, versiondate: new Date().toISOString() });
}
