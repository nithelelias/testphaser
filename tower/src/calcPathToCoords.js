import pathFind from "./pathFind.js";
import WORLD from "./world.js";

export default function calcPathToCoords(fromCoords, toCoords) {
  
  const from = WORLD.getColRowFromCoords(fromCoords.x, fromCoords.y);
  const to = WORLD.getColRowFromCoords(toCoords.x, toCoords.y);
  const path = pathFind(from, to, (col, row) => {
    return (
      col > 0 && row > 0 && col < 100 && row < 100 && WORLD.emptyAt(col, row)
    );
  });
  return path;
}
