var game = null;
var DATACHANGE_EVENT = "on-store-data-change";
const STORE = {
  data: {
    food: 0,
    gold: 1,
    population: 2,
    max: {
      food: 16,
      gold: 32,
    },
  },
};
class StoreDataHandler {
  constructor(datakey) {
    this.datakey = datakey;
    this.get = () => {
      return STORE.data[datakey];
    };
    this.set = (value) => {
      STORE.data[datakey] = Math.max(0, value);
      game.events.emit(DATACHANGE_EVENT, STORE.data);
      game.events.emit(DATACHANGE_EVENT + "-" + datakey, STORE.data[datakey]);
    };
    this.onChange = (callback) => {
      return game.events.on(DATACHANGE_EVENT + "-" + datakey, callback);
    };
  }
}

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
///
export const dataFood = new StoreDataHandler("food");
export const dataGold = new StoreDataHandler("gold");
export const dataPopulation = new StoreDataHandler("population");
///
export const DATA_STORES = {
  gold: dataGold,
  food: dataFood,
  population: dataPopulation,
};

export const getMaxData = (key) => {
  return STORE.data.max.hasOwnProperty(key) ? STORE.data.max[key] : 999;
};
