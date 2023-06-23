import BottomUIComponent from "../src/BottomUIComponent.js";
import Bullet from "../src/bullet.js"; 
import calcDistance from "../src/calcDistance.js";
import { GRIDSIZE, HALF_GRIDSIZE } from "../src/constants.js";
import cursorMovement from "../src/cursor.movement.js";
import { getAliveEnemies } from "../src/enemy.js";
import generateCircleTexture from "../src/generateCircleTexture.js";
import generateRectTextures from "../src/generateRectTextures.js";
import getTileAtCoords from "../src/getTileAtCoords.js";
import MobSpawnController from "../src/mobSpawnController.js";

import RESOURCES from "../src/resources.js";
import shotBullet from "../src/shotBullet.js";
import StageControl from "../src/stagesControl.js";
import TopUIComponent from "../src/topUIComponent.js";
import Tower from "../src/tower.js";
import Wall from "../src/wall.js";
import WORLD from "../src/world.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
  }
  preload() {
    generateRectTextures(this)
    generateCircleTexture(this)
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
        enemy.kill();
      }
    );
    //
    //
    this.drawGrid(center);
    //
    let pos = getTileAtCoords(center.x, center.y);
    this.addTower(pos.x, pos.y);
    //
    this.mobSpawnController = new MobSpawnController(this);

    //
    this.clickevent = {
      type: 0,
      events: [
        () => {
          // DO NOTHING
        },
        (pos) => {
          if (WORLD.emptyAtCoords(pos)) {
            this.addWall(pos.x, pos.y);
          }
        },
        (pos) => {
          this.bulletGroup.shot(this.tower, pos, 0);
        },
        (pos) => {
          this.bulletGroup.shot(this.tower, pos, 1);
        },
      ],
      run: (pos) => {
        let dist = parseInt((calcDistance(pos, this.tower) || 0) / GRIDSIZE);
        this.clickevent.events[this.clickevent.type](pos, dist);
        /* 
    let maxDistPerLevel = 6; if (dist <= maxDistPerLevel && WORLD.emptyAtCoords(pos)) {
          //this.addWall(pos.x, pos.y);
        } */
      },
    };
    this.cursor = cursorMovement(this, {
      onPointerDown: this.clickevent.run,
    });
    ///

    this.stageControl = new StageControl(this, this.mobSpawnController);
    this.topUI = new TopUIComponent(this, this.cursor, {
      onNextStage: () => {
        //
        this.stageControl.run();
      },
    });
    this.botUI = new BottomUIComponent(this, this.cursor, {});
  }

  addWall(x, y) {
    let wall = Wall.create(this, x, y);
    return wall;
  }
  addTower(initX, initY) {
    let tower = Tower.create(this, initX, initY, {
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
    });
    this.tower = tower;
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
  drawGrid(center) {
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

    //this.grid.setVisible(false);
  }
}
