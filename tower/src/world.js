import { GRIDSIZE } from "./constants.js";

const dicWorld = {};
const WORLD = {
  setAt,
  unsetAt,
  getAt,
  getAll,
  emptyAt,
  getColRowFromCoords,
  unsetFromCoords,
  setEntity,
  emptyAtCoords,
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
function setEntity(entity) {
  let position = WORLD.getColRowFromCoords(entity.x, entity.y);
  setAt(position.col, position.row, entity);
}
function emptyAtCoords(coords) {
  let position = WORLD.getColRowFromCoords(coords.x, coords.y);
  return emptyAt(position.col, position.row);
}
export default WORLD;
