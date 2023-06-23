import { GRIDSIZE, HALF_GRIDSIZE } from "./constants.js";

export default function getTileFromRowCol(col, row) {
  return {
    x: col * GRIDSIZE + HALF_GRIDSIZE,
    y: row * GRIDSIZE + HALF_GRIDSIZE,
  };
}
