const directions = {
  center: [0, 0],
  left: [-1, 0],
  right: [1, 0],
  top: [0, -1],
  bottom: [0, 1],
};
export default function dungeonOpenDoor(
  dungeon,
  mapLayer,
  room,
  doorPositionName = "left" || "right" || "top" || "bottom"
) {
  let doorCell = room.doors[doorPositionName];
  let opendoorframe = dungeon.dungeonFRAMES.door.open;
  mapLayer.putTileAt(opendoorframe, doorCell.col, doorCell.row);
  if (doorPositionName === "left") {
    mapLayer.putTileAt(opendoorframe, doorCell.col - 1, doorCell.row);
  }
  if (doorPositionName === "right") {
    mapLayer.putTileAt(opendoorframe, doorCell.col + 1, doorCell.row);
  }
  if (doorPositionName === "top") {
    mapLayer.putTileAt(opendoorframe, doorCell.col, doorCell.row - 1);
  }
  if (doorPositionName === "bottom") {
    mapLayer.putTileAt(opendoorframe, doorCell.col, doorCell.row + 1);
  }
}

export function dungeonGetDoorNearCoords(
  coords,
  dungeon,
  mapLayer,
  doCenter = true
) {
  let gridSize = mapLayer.getGridSize();
  let found = []; 
  for (let at in directions) {
    if (at === "center" && !doCenter) {
      // none
    } else {
      let vel = directions[at];
      let frameIndex = mapLayer.getTileAtWorldXY(
        coords.x + vel[0] * gridSize,
        coords.y + vel[1] * gridSize
      )[0].index;
      if (frameIndex === dungeon.dungeonFRAMES.door.close) {
        found.push(at);
      }
    }
  }

  return found;
}
