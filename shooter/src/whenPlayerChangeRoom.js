import Main from "../scenes/main.js";
import {
  addChestAtRoom,
  getCoordsOfRoomWithPosition,
  getRndColRoom,
  getRndRowRoom,
} from "./addStuffsToDungeonRoom.js";
import { dungeon_roomCols, dungeon_roomRows } from "./constants.js";
import { addBullets, addKeys, onRoomChange } from "./context/data.js";
import Enemy from "./enemy.js";
import iterate from "./iterate.js";
import RESOURCES from "./resources.js";
const roomVisited = {};
var totalVisited = 0;
const LOOT_TEMPLATE = {
  key: {
    name: "key",
    quantity: 1,
    frame: RESOURCES.frames.key,
    pickUpEvent: function () {
      addKeys(this.quantity);
    },
  },
  bullet: {
    name: "bullets",
    quantity: 1,
    frame: RESOURCES.frames.bullet_box,
    pickUpEvent: function () {
      addBullets(this.quantity);
    },
  },
};
export default function whenPlayerChangeRoom() {
  onRoomChange((room) => {
    console.log("room change", room);
    // enemys?
    if (roomVisited[room]) {
      return;
    }

    roomVisited[room] = 1;
    totalVisited++;

    if (room === 1) {
      firstRoom();
      return;
    }

    addEventAtRoom.call(this, room);
  });
}

function firstRoom() {
  let initalChest = addChestAtRoom(
    1,
    {
      col: parseInt(dungeon_roomCols / 2),
      row: parseInt(dungeon_roomRows / 2) - 2,
    },
    [
      {
        ...LOOT_TEMPLATE.key,
        quantity: 1,
      },
      {
        ...LOOT_TEMPLATE.bullet,
        quantity: 18,
      },
    ]
  );
}

function spawnMobs(roomNumber, total = 1) {
  iterate(total, () => {
    const coords = getCoordsOfRoomWithPosition(
      roomNumber,
      getRndColRoom(),
      getRndRowRoom()
    );

    let enemy = Enemy.create(Main.current, coords.x, coords.y);
    enemy.setTarget(Main.current.player);
    Main.current.addToStage(enemy);
  });
}
function addEventAtRoom(roomNumber) {
  spawnMobs(roomNumber, 4);
}
