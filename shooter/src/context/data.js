var game = null;
var DATACHANGE_EVENT = "on-store-data-change";
const STORE = {
  data: {
    keys: 0,
    lives: 1,
    gold: 0,
    room: 0,
    bullets: {
      max: 12,
      total: Infinity,
    },
  },
};

export function initDataStore(_game) {
  game = _game;
}
window.$store = STORE;

export function setData(_data) {
  // UPDATE DATA
  STORE.data = { ...STORE.data, ..._data };
  game.events.emit(DATACHANGE_EVENT, STORE.data);
}

export function getData() {
  return STORE.data;
}

export function onDataChange(callback) {
  return game.events.on(DATACHANGE_EVENT, callback);
}
/// ACTIONS
export function getKeys() {
  return STORE.data.keys;
}
export function addKeys(numkeys = 1) {
  setData({ keys: STORE.data.keys + numkeys });
  game.events.emit(DATACHANGE_EVENT + "-keys", STORE.data.keys);
}
export function removeKeys(numkeys = 1) {
  addKeys(-Math.abs(numkeys));
}
export function onKeysChange(callback) {
  game.events.on(DATACHANGE_EVENT + "-keys", callback);
}
//// ---
export function getBullets() {
  return STORE.data.bullets;
}
export function setMaxBullets() {
  setData({
    bullets: {
      ...STORE.data.bullets,
      max: STORE.data.bullets.max + numbullets,
    },
  });
  game.events.emit(DATACHANGE_EVENT + "-bullets", STORE.data.bullets);
}
export function addBullets(numbullets = 1) {
  setData({
    bullets: {
      ...STORE.data.bullets,
      total: STORE.data.bullets.total + numbullets,
    },
  });
  game.events.emit(DATACHANGE_EVENT + "-bullets", STORE.data.bullets);
}
export function removeBullets(numbullets = 1) {
  addBullets(-Math.abs(numbullets));
}
export function onBulletsChange(callback) {
  game.events.on(DATACHANGE_EVENT + "-bullets", callback);
}
///
export function updateRoomNumber(roomNumber) {
  if (STORE.data.room !== roomNumber) {
    setData({ room: roomNumber });
    game.events.emit(DATACHANGE_EVENT + "-room", STORE.data.room);
  }
}
export function onRoomChange(callback) {
  game.events.on(DATACHANGE_EVENT + "-room", callback);
}
///
export function getGold() {
  return STORE.data.gold;
}

export function addGold(value = 1) {
  setData({ gold: STORE.data.gold + value });
  game.events.emit(DATACHANGE_EVENT + "-gold", STORE.data.gold);
}
export function removeGold(value = 1) {
  addGold(-Math.abs(value));
}
export function onGoldChange(callback) {
  game.events.on(DATACHANGE_EVENT + "-gold", callback);
}
///
