function getNewRoom(currentPartyRoom, dungeon, dir) {
  const dirVel = {
    right: [1, 0],
    left: [-1, 0],
    up: [0, -1],
    down: [0, 1],
  }[dir] || [0, 0];
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
    //this.putPartyAtRoom(newRoomNumber);
    return newRoomNumber;
    // animate movement towards roomm coords.
  }
  return null;
}
function movePartyToRoomCoords(partyList, coords) {
  //partyList[0].setPosition(coords.x, coords.y);
  return partyList[0].doWalkAnim(coords);
}

export function movementOnDungeon(roomNumberStart) {
  var partyRoom = this.dungeon.getRoom(roomNumberStart);
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
    let roomNumber = getNewRoom(partyRoom, this.dungeon, dir);
    if (roomNumber) {
      busy = true;
      // SET THE NEW PARTY ROOM
      partyRoom = this.dungeon.getRoom(roomNumber);
      // MOVE PARTY TO THAT NEW ROOM
      await movePartyToRoomCoords(
        this.party,
        this.getDungeonRoomPosition(roomNumber)
      );
      busy = false;
    }
  };
  this.input.keyboard.on("keydown", keyBoardListener);
  return () => {
    // UNBIND
    this.input.keyboard.removeListener("keydown", keyBoardListener);
  };
}
