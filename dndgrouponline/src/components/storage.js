import { onListen, update } from "../../connect.js";
import { CURSOR, PLAYERS, WORLD } from "../constants/data.js";

export function init() {
  onListen((json) => {});
}
function updateStorage(json) {
  fillCursor(json.CURSOR || {});
  fillPlayersFromLocal(json.PLAYERS || {});
  fillWorld(json.WORLD || {});
}
export function restoreFromLocal(callback) {
  const unbind = onListen((json) => {
    updateStorage(json);
    callback();
    setTimeout(() => {
      unbind();
    }, 1);
  });
}

export function saveToLocal() {
  const storage = {
    PLAYERS,
    CURSOR,
    WORLD,
  };
  /* console.log(storage); */
  /* localStorage.setItem(localKey, JSON.stringify(storage)); */
  update(storage);
}

export function onUpdate(callback) {
  onListen((json) => {
    updateStorage(json);
    callback(json);
  });
}

function fillPlayersFromLocal(PLOCAL) {
  PLOCAL.forEach((p) => {
    const player_index = PLAYERS.findIndex((p2) => p2.name == p.name);
    if (player_index > -1) {
      PLAYERS[player_index] = { ...PLAYERS[player_index], ...p };
    } else {
      PLAYERS.push(p);
    }
  });
}

function fillCursor(cursor) {
  CURSOR.x = cursor.x;
  CURSOR.y = cursor.y;
  CURSOR.zoom = cursor.zoom;
}

function fillWorld(newWorld) {
  for (const key in WORLD) {
    delete WORLD[key];
  }
  for (const key in newWorld) {
    WORLD[key] = newWorld[key];
  }
  console.log(WORLD);
}
