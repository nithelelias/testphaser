import MapLayer from "./mapLayer.js";

const DIRECTIONS = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
};
function getGridSize() {
  return MapLayer.getGridSize();
}
function getNewRoom(currentPartyRoom, dungeon, dir) {
  const dirVel = DIRECTIONS[dir] || [0, 0];
  let col = currentPartyRoom.position.col + dirVel[0];
  let row = currentPartyRoom.position.row + dirVel[1];
  // limit
  if (
    row < 0 ||
    col < 0 ||
    row > dungeon.map.length - 1 ||
    col > dungeon.map[0].length - 1
  ) {
    return;
  }
  let newRoomNumber = dungeon.map[row][col];
  if (newRoomNumber !== 0) {
    return newRoomNumber;
  }
  return null;
}

function movePartyToRoomCoords(partyList, coords) {
  //partyList[0].setPosition(coords.x, coords.y);
  return partyList[0].doWalkAnim(coords);
}

async function changeRoom(dir, partyRoom) {
  let roomNumber = getNewRoom(partyRoom, this.dungeon, dir);
  if (roomNumber) {
    // SET THE NEW PARTY ROOM
    partyRoom = this.dungeon.getRoom(roomNumber);
    // MOVE PARTY TO THAT NEW ROOM
    await movePartyToRoomCoords(
      this.party,
      this.getDungeonRoomPosition(roomNumber)
    );
  }
  return partyRoom;
}

function movePartyInRoom(partyList, dir) {
  const dirVel = DIRECTIONS[dir] || [0, 0];
  const dist = getGridSize();
  let x = partyList[0].x + dirVel[0] * dist;
  let y = partyList[0].y + dirVel[1] * dist;

  let canWalk = MapLayer.isCellWall(parseInt(x / dist), parseInt(y / dist));
  if (!canWalk) {
    return;
  }
  return partyList[0].doWalkAnim({ x, y });
}
export function movementOnDungeon(roomNumberStart) {
  var busy = false;
  // KEYBOARD
  const dirByKeys = {
    ArrowRight: "right",
    ArrowLeft: "left",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  // this=scene
  const keyBoardListener = async (keyboardEvent) => {
    if (busy) {
      return;
    }

    let dir = dirByKeys[keyboardEvent.key];
    if (!dir) {
      return;
    }
    busy = true;
    await movePartyInRoom(this.party, dir);
    busy = false;
  };
  this.input.keyboard.on("keydown", keyBoardListener);
  return () => {
    // UNBIND
    this.input.keyboard.removeListener("keydown", keyBoardListener);
  };
}
