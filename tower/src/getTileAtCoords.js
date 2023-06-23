import { GRIDSIZE, HALF_GRIDSIZE } from "./constants.js";
export default function getTileAtCoords(x, y) {
  return {
    x: parseInt(x / GRIDSIZE) * GRIDSIZE + HALF_GRIDSIZE,
    y: parseInt(y / GRIDSIZE) * GRIDSIZE + HALF_GRIDSIZE,
  };
}
