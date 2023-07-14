import Main from "../scenes/main.js";
import MapLayer from "./mapLayer.js";
import random from "./random.js";

const gridSize = MapLayer.getGridSize();
const getRndJmp = () => random(gridSize, gridSize * 3) * [1, -1][random(0, 1)];
export default function dropItemsAt(x, y, loot) {
  console.log("LOOT", loot);
  loot.forEach((dataItem) => {
    let item = Main.current.addItem(x, y, dataItem);
    item.jumpTo(x + getRndJmp(), y + getRndJmp());
  });
}
