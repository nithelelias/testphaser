import { GRIDSIZE } from "./constants.js";

const dicWorld = {};
const WORLD = {
  setAt,
  unsetAt,
  getAt,
  getAll,
  emptyAt,
  removeEntity: unsetFromCoords,
  getColRowFromCoords,
  unsetFromCoords,
  setEntity,
  emptyAtCoords,
  setAtTemp,
  unSetAtTemp,
  parseKey,
  getEntityAt,
};
function parseKey(col, row) {
  return `${col}_${row}`;
}
function getColRowFromCoords(x, y) {
  return {
    col: parseInt(x / GRIDSIZE),
    row: parseInt(y / GRIDSIZE),
  };
}
function setAt(col, row, entity) {
  dicWorld[parseKey(col, row)] = entity;
}
function setAtTemp(temp, entity) {
  dicWorld[temp] = entity;
}
function unSetAtTemp(temp) {
  delete dicWorld[temp];
}
function getAt(col, row) {
  let key = parseKey(col, row);
  if (dicWorld.hasOwnProperty(key)) {
    return dicWorld[key];
  }
  return null;
}
function unsetAt(col, row) {
  delete dicWorld[parseKey(col, row)];
}
function emptyAt(col, row) {
  return getAt(col, row) === null;
}
function getAll() {
  return { ...dicWorld };
}
function unsetFromCoords(coords) {
  let position = WORLD.getColRowFromCoords(coords.x, coords.y);
  unsetAt(position.col, position.row);
}
function setEntity(coords, entity = null) {
  if (!entity) {
    entity = coords;
  }
  let position = WORLD.getColRowFromCoords(coords.x, coords.y);
  setAt(position.col, position.row, entity);
}
function emptyAtCoords(coords) {
  let position = WORLD.getColRowFromCoords(coords.x, coords.y);
  return emptyAt(position.col, position.row);
}
function getEntityAt(coords) {
  let { col, row } = WORLD.getColRowFromCoords(coords.x, coords.y);
  return getAt(col, row);
}
window.$w = WORLD;
export default WORLD;
