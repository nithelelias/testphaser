import Main from "../scenes/main.js";
import {
  addChestAtRoom,
  getCoordsOfRoomWithPosition,
  getRndColRoom,
  getRndRowRoom,
} from "./addStuffsToDungeonRoom.js";
import jumpDropAwayAnimation from "./animations/jumpDropAwayAnimation.js";
import { dungeon_roomCols, dungeon_roomRows } from "./constants.js";
import { addBullets, addGold, addKeys, onRoomChange } from "./context/data.js";
import dropItemsAt from "./dropItemsAt.js";
import Enemy from "./enemy.js";
import iterate from "./iterate.js";
import MobSpawner from "./mobSpawner.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
const roomVisited = {};
var totalVisited = 0;
const LOOT_TEMPLATE = {
  gold: {
    name: "gold",
    quantity: 1,
    frame: RESOURCES.frames.coin,
    pickUpEvent: function () {
      addGold(this.quantity);
    },
  },
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
function getRndEnemyLoot(enemy) {
  return [
    {
      ...LOOT_TEMPLATE.gold,
      quantity: random(5, 10),
    },
    {
      ...LOOT_TEMPLATE.bullet,
      quantity: random(4, 8),
    },
  ];
}
function validate_rndReceiveLoot() {
  return random(1, 500) < 120;
}
function addCentralChest(roomNumber, loot) { 
  return addChestAtRoom(
    roomNumber,
    {
      col: parseInt(dungeon_roomCols / 2),
      row: parseInt(dungeon_roomRows / 2),
    },
    loot
  );
}
function firstRoom() {
  let initalChest = addCentralChest(1, [
    {
      ...LOOT_TEMPLATE.key,
      quantity: 1,
    },
    {
      ...LOOT_TEMPLATE.gold,
      quantity: 5,
    },
  ]);
}

function spawnMobs(roomNumber) {
  // FIRST ADD SPAWNERS THAT TICK IN 30 seconds
  var times = 3;
  const totalSpawns = 1; // random(1, 5);
  const totalMobsToSpawn = totalSpawns * times;
  var totalMobsKilled = 0;

  const spawners = [];
  const removeSpawns = () => {
    spawners.forEach((spawn) => spawn.remove());
    timeEvent.destroy();
  };
  const onEnemyKilled = (enemy) => {
    totalMobsKilled++;
    if (validate_rndReceiveLoot()) {
      dropItemsAt(enemy.x, enemy.y, getRndEnemyLoot(enemy));
    } 
    if (totalMobsKilled >= totalMobsToSpawn) {
    
      removeSpawns();
      let chest = addCentralChest(roomNumber, [
        {
          ...LOOT_TEMPLATE.key,
          quantity: 1,
        },
        {
          ...LOOT_TEMPLATE.bullet,
          quantity: random(6, 18),
        },
        {
          ...LOOT_TEMPLATE.gold,
          quantity: random(4, 20),
        },
      ]);
      jumpDropAwayAnimation(Main.current, chest, chest.x, chest.y);
    }
  };

  const doWave = () => {
    times--;
    if (times < 0) {
      return;
    }

    spawners.forEach((spawn) => {
      let enemy = Enemy.create(Main.current, spawn.x, spawn.y);
      enemy.setTarget(Main.current.player);

      enemy.onKill = () => {
        console.log("KILLED", enemy.__id);
        onEnemyKilled(enemy);
      };

      Main.current.addToStage(enemy);
    });
  };

  let coords = getCoordsOfRoomWithPosition(
    roomNumber,
    parseInt(dungeon_roomCols / 2),
    parseInt(dungeon_roomRows / 2)
  );

  iterate(totalSpawns, () => {
    let spawner = MobSpawner.create(Main.current, coords.x, coords.y);
    spawners.push(spawner);
  });

  const timeEvent = Main.current.time.addEvent({
    delay: 3000,
    loop: true,
    callback: () => doWave(),
    onComplete: () => {
      console.log("waves-complete");
    },
  });
  doWave();
}
function addEventAtRoom(roomNumber) {
  spawnMobs(roomNumber, 4);
}
