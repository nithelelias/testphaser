import Deffered from "./deferred.js";
import Enemy from "./enemy.js";
import getTileFromRowCol from "./getTileFromRowCol.js";
import iterate from "./iterate.js";
import MobSpawner from "./mobSpawner.js";
import random from "./random.js";

export default class MobSpawnController {
  constructor(scene) {
    this.scene = scene;
  }
  getSpawners(totalSpawns = 1) {
    let center = [22, 15];
    let max = [center[0] * 2 - 2, center[1] * 2 - 2];

    const spawnerList = [];

    let dictem = {};
    const getRnd = () => {
      switch (random(1, 4)) {
        case 1:
          return { col: 1, row: random(1, max[1]) };

        case 2:
          return { col: max[0], row: random(1, max[1]) };
        case 3:
          return { col: random(1, max[0]), row: 1 };
        case 4:
          return { col: random(1, max[0]), row: max[1] };
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

    return {
      list: spawnerList,
      clear: () => {
        spawnerList.forEach((spawner) => {
          spawner.kill();
        });
      },
    };
  }
  initSpawns(totalSpawns = 1, iterationCount = 1, delay = 500) {
    const deferred = new Deffered();

    let count = 0;
    let spawners = this.getSpawners(totalSpawns);
    const doSpawns = () => {
      spawners.list.forEach((position) => {
        this.spawnMob(position.x, position.y);
      });
    };
    // EVERY TIME SPAWN
    let timerEvent = this.scene.time.addEvent({
      delay,
      loop: true,
      callback: () => {
        count++;
        if (count <= iterationCount) {
          doSpawns();
        } else {
          timerEvent.destroy();
          deferred.resolve();
          spawners.clear();
        }
      },
    });

    return deferred.promise;
  }
  spawnMob(x, y) {
    let enemy = Enemy.spawn(this.scene, x, y);
    this.scene.groupEnemy.add(enemy);
  }
}
