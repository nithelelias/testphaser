import { CURSOR, PLAYERS, WORLD } from "../constants/data.js";
const localKey = "DNDSession1";
export function saveToLocal() {
  const storage = {
    PLAYERS,
    CURSOR,
    WORLD,
  };
  console.log(storage);
  localStorage.setItem(localKey, JSON.stringify(storage));
}

export function restoreFromLocal() {
  const found = localStorage.getItem(localKey);
  if (!found) return;
  const storage = JSON.parse(found);

  fillCursor(storage.CURSOR);
  fillPlayersFromLocal(storage.PLAYERS);
  fillWorld(storage.WORLD || {});
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
