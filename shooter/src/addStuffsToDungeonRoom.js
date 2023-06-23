import Main from "../scenes/main.js";
import { dungeon_roomCols, dungeon_roomRows } from "./constants.js";
import Chest from "./enviroments/chest.js";
import MapLayer from "./mapLayer.js";
import random from "./random.js";
const gridSize = MapLayer.getGridSize();

export const getCoordsOfRoomWithPosition = (roomNumber, col, row) => {
  let roomCoordenates = Main.current.getDungeonRoomPosition(roomNumber);
  let coords = {
    x: roomCoordenates.x + gridSize * Math.min(dungeon_roomCols, col),
    y: roomCoordenates.y + gridSize * Math.min(dungeon_roomRows, row),
  };
  return coords;
};
export const addChestAtRoom = (roomNumber, { col, row }, loot = []) => {
  const coords = getCoordsOfRoomWithPosition(roomNumber, col, row);
  // lets create for now just an sprite.
  const chest = new Chest(Main.current, coords.x, coords.y, gridSize, loot);
  Main.current.addToStage(chest, true);
  return chest;
};

export const getRndRowRoom = () => {
  return random(1, dungeon_roomRows - 1);
};
export const getRndColRoom = () => {
  return random(1, dungeon_roomCols - 1);
};
