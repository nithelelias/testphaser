import Deffered from "./deferred.js";
import Enemy from "./enemy.js";
import getTileFromRowCol from "./getTileFromRowCol.js";
import iterate from "./iterate.js";
import MobSpawner from "./mobSpawner.js";
import random from "./random.js";
import TickManager from "./tickManager.js";

export default class MobSpawnController {
  constructor(scene) {
    this.scene = scene;
    this.spawners = [];
    let tickCount = 0;
    let spawnTimeDelay = 30;
    TickManager.onTick(() => {
      tickCount++;

      this.addMoreMobsToSpawn();

      // EVERY 60 TICKS 
      if (tickCount >= spawnTimeDelay) {
        spawnTimeDelay = 60;
        this.createSpawns(1);
        tickCount = 0;
      }
    });
    this.createSpawns(1);
  }
  getSpawners(totalSpawns = 1) {
    let center = [22, 15];
    let min = 4;
    let max = [center[0] * 2 - min, center[1] * 2 - min];

    const spawnerList = [];

    let dictem = {};
    const getRnd = () => {
      switch (random(1, 4)) {
        case 1:
          return { col: min, row: random(min, max[1]) };

        case 2:
          return { col: max[0], row: random(min, max[1]) };
        case 3:
          return { col: random(min, max[0]), row: min };
        case 4:
          return { col: random(min, max[0]), row: max[1] };
      }
    };
    const getRndPosition = () => {
      let position = getRnd();
      let key = position.col + "_" + position.row;
      if (dictem.hasOwnProperty(key)) {
        return getRndPosition();
      }
      dictem[key] = 1;
      return position;
    };
    iterate(totalSpawns, () => {
      const position = getRndPosition();
      let coords = getTileFromRowCol(position.col, position.row);
      let spawner = MobSpawner.create(this.scene, coords.x, coords.y);
      spawnerList.push(spawner);
    });

    return spawnerList;
  }
  addMoreMobsToSpawn() {
    this.spawners.forEach((spawner) => {
      spawner.tickToAddMore( );
    });
  }
  createSpawns(totalSpawns = 1) {
    let spawners = this.getSpawners(totalSpawns);
    this.spawners = this.spawners.concat(spawners);

    return spawners;
  }
}
