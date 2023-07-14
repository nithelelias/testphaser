import Building from "../src/building.js";
import { BUILDING_TYPES } from "../src/building_types.js";
import calcDistance from "../src/calcDistance.js";
import {
  COLORS,
  GRIDSIZE,
  HALF_GRIDSIZE,
  MAX_DIST_PER_LEVEL,
} from "../src/constants.js";
import { DATA_STORES, getData, getMaxData } from "../src/context/data.js";
import Enemy, { getAliveEnemies } from "../src/enemy.js";

import generateCircleTexture from "../src/generateCircleTexture.js";
import generateRectTextures from "../src/generateRectTextures.js";
import getTileAtCoords from "../src/getTileAtCoords.js";
import iterate from "../src/iterate.js";
import MobSpawnController from "../src/mobSpawnController.js";
import PopMessage from "../src/popMessage.js";
import random from "../src/random.js";

import RESOURCES from "../src/resources.js";
import shotBullet from "../src/shotBullet.js";
import TickManager from "../src/tickManager.js";
import Wall from "../src/wall.js";
import WORLD from "../src/world.js";

export default class Main extends Phaser.Scene {
  static current = null;
  constructor() {
    super("main");
    window.main = this;
    Main.current = this;
  }
  preload() {
    generateRectTextures(this);
    generateCircleTexture(this);
    this.load.spritesheet(RESOURCES.name, "./assets/" + RESOURCES.file, {
      frameWidth: RESOURCES.tilesize,
      frameHeight: RESOURCES.tilesize,
    });
  }

  create() {
    let center = {
      x: parseInt(this.game.scale.width / 2),
      y: parseInt(this.game.scale.height / 2),
    };
    this.center = center;
    this.groupEnemy = this.physics.add.group({
      runChildUpdate: true,
    });
    this.bulletGroup = this.physics.add.group({
      runChildUpdate: true,
    });
    this.bulletGroup.shot = shotBullet;
    this.wallGroup = this.physics.add.group({});
    this.physics.add.collider(this.groupEnemy, this.wallGroup);
    this.physics.add.collider(
      this.bulletGroup,
      this.groupEnemy,
      (bullet, enemy) => {
        if (!enemy.isAlive() || !bullet.isAlive()) {
          return;
        }
        bullet.explode();
        enemy.hit(1);
      }
    );
    //
    //
    //
    let pos = getTileAtCoords(center.x, center.y);
    this.HQ = Building.create(this, pos.x, pos.y, BUILDING_TYPES.hq);
    this.HQ.level = 1;
    //

    this.__drawGrid(center);
    //
    this.mobSpawnController = new MobSpawnController(this);
    //
    TickManager.start(this);
    TickManager.onTick(this.__everyTick.bind(this));
  }
  __addToStore(key, value) {
    let maxStore = getMaxData(key);
    let newValue = Math.min(maxStore, DATA_STORES[key].get() + value);
    DATA_STORES[key].set(newValue);
  }
  __drawGrid(center) {
    let offsetX = center.x - HALF_GRIDSIZE,
      offsetY = center.y - HALF_GRIDSIZE,
      color1 = 0x111111,
      color2 = 0xfffaba;
    this.grid = this.add
      .grid(
        offsetX,
        offsetY,
        this.scale.width + GRIDSIZE,
        this.scale.height + GRIDSIZE,
        GRIDSIZE,
        GRIDSIZE,
        color1,
        0,
        color2,
        0.1
      )
      .setAlpha(0.2)
      .setOrigin(0.5);

    this.grid.setVisible(false);

    this.valid_area = this.add.container(this.HQ.x, this.HQ.y, []);
    this.valid_area.setVisible(false);
  }
  __everyTick(tick) {
    this.depurateWorld();

    const wold = WORLD.getAll();
    const tempData = { ...getData() };
    var dir = tick % 2 === 0 ? 1 : -1;
    const mayorTick = tick % 5 === 0;
    const addToStore = this.__addToStore.bind(this);
    const handler = { addToStore };
    for (let key in wold) {
      let entity = wold[key];
      if (entity.everyTick) {
        entity.everyTick();
      }
      if (mayorTick && entity.everyMayorTick) {
        entity.everyMayorTick(handler);
      }
    }
    const data = { ...getData() };

    for (let prop in data) {
      const preValue = tempData[prop];
      const newValue = data[prop];
      const dif = newValue - preValue;
      if (dif > 0) {
        PopMessage.create(
          this.HQ.x + random(-8, 8),
          this.HQ.y - random(2, 8),
          [dif > 0 ? "+" + dif : dif],
          false,
          { fontSize: 16 },
          {
            duration: 200,
            scale: { from: 0.1, to: 1 },
            y: this.HQ.y - random(GRIDSIZE, GRIDSIZE * 3),
            x: this.HQ.x + random(GRIDSIZE, GRIDSIZE * 3) * dir,
          },
          { iconRight: RESOURCES.frames.resource_icons[prop] }
        );
        dir *= -1;
      }
    }
    //
    if (this.valid_area.visible) {
      this.hideValidBuildArea();
      this.showValidBuildArea();
    }
  }

  addWall(x, y) {
    let wall = Wall.create(this, x, y);
    return wall;
  }
  getCurrentMaxDist() {
    return MAX_DIST_PER_LEVEL * this.HQ.level;
  }
  static addBuilding(x, y, type) {
    return Main.current.addBuilding(x, y, type);
  }

  addBuilding(initX, initY, buildtype) {
    const building = Building.create(this, initX, initY, buildtype);

    return building;
    /**
     * , {
      onShotEventxxx: () => {
        // get closest enemy
        let closestEnemyList = getAliveEnemies()
          .map((target) => {
            return { target, d: calcDistance(this.tower, target) };
          })
          .sort((a, b) => {
            return b.d - a.d;
          });

        if (closestEnemyList.length === 0) {
          return;
        }
        let closestEnemy = closestEnemyList[0]; //{ target: this.input.mousePointer }; //
        let bullet = Bullet.shot(
          this,
          this.tower.x,
          this.tower.y,
          this.tower,
          closestEnemy.target,
          GRIDSIZE * 4
        );
        bullet.setTint(0xffff00);
        this.bulletGroup.add(bullet);
      },
    }
     */
    // this.tower = tower;
    /*  // ADD WALLS AROUND
    let dist = 3 * GRIDSIZE;
    iterate(7, (num) => {
      this.addWall(tower.x - dist + num * GRIDSIZE, tower.y - dist);
      this.addWall(tower.x - dist + num * GRIDSIZE, tower.y + dist);
      if (num > 0 && num < 6) {
        this.addWall(tower.x - dist, tower.y + dist - num * GRIDSIZE);
        this.addWall(tower.x + dist, tower.y + dist - num * GRIDSIZE);
      }
    }); */
  }
  calcPopulation() {}
  static spawnMob(x, y, enemyInfo) {
    let enemy = Enemy.spawn(Main.current, x, y);
    // WORLD.setEntity(enemy);
    Main.current.groupEnemy.add(enemy);
  }
  static showGrid() {
    Main.current.grid.setVisible(true);
  }
  static hideGrid() {
    if (!Main.current.grid) {
      return;
    }
    Main.current.grid.setVisible(false);
  }
  static isValidBuildDistance(pos) {
    return Main.current.isValidBuildDistance(pos);
  }
  isValidBuildDistance(pos = { x, y }) {
    let dist = parseInt((calcDistance(pos, this.HQ) || 0) / GRIDSIZE);

    let valid = dist <= this.getCurrentMaxDist() && WORLD.emptyAtCoords(pos);

    return valid;
  }
  static showValidBuildArea() {
    return Main.current.showValidBuildArea();
  }
  static hideValidBuildArea() {
    return Main.current.hideValidBuildArea();
  }
  showValidBuildArea() {
    let dist = this.getCurrentMaxDist();
    let totalDist = dist * 2 + 1;
    let rects = [];
    iterate(totalDist, (numX) => {
      iterate(totalDist, (numY) => {
        let coords = {
          x: (dist - numX) * GRIDSIZE,
          y: (dist - numY) * GRIDSIZE,
        };
        if (
          this.isValidBuildDistance({
            x: this.valid_area.x + coords.x,
            y: this.valid_area.y + coords.y,
          })
        ) {
          let rect = this.add.rectangle(
            coords.x,
            coords.y,
            GRIDSIZE,
            GRIDSIZE,
            COLORS.yellow,
            0.1
          );
          rects.push(rect);
        }
      });
    });
    this.valid_area.add(rects);
    this.valid_area.setVisible(true);
    return this.valid_area;
  }
  hideValidBuildArea() {
    if (!this.valid_area) {
      return;
    }
    this.valid_area.setVisible(false);
    while (this.valid_area.list.length > 0) {
      this.valid_area.list[0].destroy();
    }
  }
  depurateWorld() {
    let all = WORLD.getAll();
    let population = 0;
    for (let key in all) {
      let entity = all[key];

      // REMOVE ENEMY
      if (entity.iamEnemyMob && !entity.isAlive()) {
        WORLD.unSetAtTemp(key);
      }
      //
      if (entity.isBuilding) {
        if (entity.buildType.add?.population) {
          population += entity.buildType.add.population;
        }
        if (entity.buildType.cost?.population) {
          population -= entity.buildType.cost.population;
        }
      }
    }
    DATA_STORES.population.set(population);
  }
  static getHQ() {
    return Main.current.HQ;
  }
}
