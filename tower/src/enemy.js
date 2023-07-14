import Main from "../scenes/main.js";
import calcDistance, { calcDirection } from "./calcDistance.js";
import calcPathToCoords from "./calcPathToCoords.js";
import { COLORS, GRIDSIZE } from "./constants.js";
import getTileFromRowCol from "./getTileFromRowCol.js";
import PoolAliveManager from "./poolAliveManager.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
import shakeObject from "./shakeObject.js";
import tintAnimation from "./tintAnimation.js";
import tweenDoTweenAttackMove from "./tween.doTweenAttackMove.js";
import tweenPromise from "./tweenPromise.js";
import wait from "./wait.js";
import WORLD from "./world.js";

const poolManager = new PoolAliveManager();
export function getAliveEnemies() {
  return poolManager.getAlive();
}

export default class Enemy extends Phaser.GameObjects.Container {
  __damage = 1;
  iamEnemyMob = true;
  life = 1;
  constructor(scene, x, y) {
    super(scene, parseInt(x), parseInt(y), [
      scene.add
        .sprite(0, 0, RESOURCES.name, RESOURCES.frames.mobs.scorpion)
        .setTintFill(0xff0000),
    ]);
    scene.add.existing(this);

    //
    this.__sprite = this.list[0];
    //
    this.setSize(this.__sprite.width, this.__sprite.height);
    scene.input.enableDebug(this.__sprite, 0xfff011);
    //
  }

  static spawn(scene, x, y) {
    const enemy = poolManager.create(scene, Enemy);
    enemy.setPosition(x, y);
    enemy.__alive = true;
    enemy.setVisible(true);
    enemy.life = 1;
    if (enemy.body) {
      enemy.body.setEnable(true);
    }
    return enemy;
  }

  getDamage() {
    // *modificadores (-2 attac)
    return this.__damage;
  }

  moveTowardsTarget() {
    //  I COULD VALIDATE IF THAT SPRITE IS EMPTY?
    let target = this.getTarget();
    if (!target) {
      return Promise.resolve(false);
    }
    var path = calcPathToCoords(this, target);
    if (path.length === 0) {
      this.__target = null;
      while (this.storedClosestEntityList.length > 1) {
        // if cannot go there then change target to next
        this.storedClosestEntityList.shift();
        let target = this.storedClosestEntityList[0];
        path = calcPathToCoords(this, target);
        // RE RUN
        if (path.length > 0) {
          this.__target = target;
          break;
        }
      }
      if (path.length === 0 && !this.__target) {
        return Promise.resolve(false);
      }
    }
    const step = path.shift();
    // GET FIRST PATH
    const coords = getTileFromRowCol(step.col, step.row);
    return tweenPromise(this.scene, {
      targets: [this],
      x: coords.x,
      y: coords.y,
      duration: 300,
      ease: "Linear",
    });
  }

  async doAttack() {
    if (!this.getTarget().isAlive()) {
      return;
    }
    let dist = calcDistance(this, this.getTarget());
    // console.log("ATTACKING", this.getTarget().__id, dist);
    const dir = calcDirection(this, this.getTarget());
    let once = false;
    await tweenDoTweenAttackMove(this.__sprite, dir, () => {
      if (once) {
        return;
      }
      once = true;
      this.getTarget().hit(this.getDamage());
    });

    await wait(1000);
  }
  hit(damage) {
    if (damage < 1) {
      return;
    }
    let newdamage = damage;
    this.life -= newdamage;
    shakeObject(this.__sprite, 100, 0.1, { modY: 0 });
    tintAnimation(this.__sprite, COLORS.white, COLORS.red).then(() => {
      this.__sprite.clearTint();
    });
    if (this.life <= 0) {
      // se destruye
      this.kill();
    }
  }
  kill() {
    WORLD.removeEntity(this);
    this.setAlive(false);
    this.setVisible(false);
    this.body.setEnable(false);
  }
  async moveTo(newCoords) {
    this.___busy = true;
    WORLD.removeEntity(this);
    WORLD.setEntity(newCoords, this);
    await tweenPromise(this.scene, {
      targets: [this],
      x: newCoords.x,
      y: newCoords.y,
      duration: 300,
      ease: "Linear",
    });
    this.___busy = false;
    this.setDepth(parseInt(this.y + this.height));
  }
  update(time, delta) {
    if (!this.isAlive()) {
      return;
    }
    if (this.___busy) {
      return;
    }
    // LOOK FOR HQ
    const HQ = Main.getHQ();
    let dir = calcDirection(this, HQ);
    let posibles = [];
    let vel = { x: 0, y: 0 };
    if (dir.x != 0) {
      posibles.push("x");
    }
    if (dir.y != 0) {
      posibles.push("y");
    }
    let prop = posibles[0];
    if (posibles.length > 1) {
      prop = posibles[random(0, 1)];
    }
    vel[prop] = dir[prop];
    const newCoords = {
      x: this.x + vel.x * GRIDSIZE,
      y: this.y + vel.y * GRIDSIZE,
    };
    const position = WORLD.getColRowFromCoords(newCoords.x, newCoords.y);
    const any = WORLD.getAt(position.col, position.row);
    if (!any) {
      this.moveTo(newCoords);
      return;
    }
    if (any.iamEnemyMob) {
      // DONT MOVE
      // IS NEXT TO HIM FREE?
      // INVERTED
      let trydat = [
        [vel.y, vel.x],
        [-vel.y, -vel.x],
        [vel.x, vel.y],
        [-vel.x, -vel.y],
      ];
      const currentPosition = WORLD.getColRowFromCoords(this.x, this.y);
      let goTo = null;
      while (trydat.length > 0) {
        let v = trydat.shift();
        if (
          !WORLD.getAt(currentPosition.col + v[0], currentPosition.row + v[1])
        ) {
          goTo = {
            x: this.x + v[0] * GRIDSIZE,
            y: this.y + v[1] * GRIDSIZE,
          };
          break;
        }
      }

      if (goTo) {
        this.moveTo(goTo);
      }

      return;
    }
    // ATTACK
    let once = false;
    this.___busy = true;
    tweenDoTweenAttackMove(this.__sprite, vel, () => {
      if (once) {
        return;
      }
      once = true;
      any.hit(this.getDamage());
    }).then(() => {
      this.___busy = false;
    });
  }
}
