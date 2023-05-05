const STATE = {
  gold: 0,
  food: 0,
  wood: 0,
  stone: 0, 
};
export default STATE;

function updateProp(prop, n) {
  STATE[prop] += n;
}
export function addGold(n) {
  updateProp("gold", n);
}

export function addFood(n) {
  updateProp("food", n);
}

export function addWood(n) {
  updateProp("wood", n);
}

export function addStone(n) {
  updateProp("stone", n);
}
