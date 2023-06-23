import calcDistance, { calcDirection } from "./calcDistance.js";
import calcPathToCoords from "./calcPathToCoords.js";
import enemyStateMachine from "./enemy.statemachine.js";
import getSortedEntityListDistFromCoords, {
  getCloseEntityPosibleFromList,
} from "./getSortedEntityListDistFromCoords.js";
import getTileFromRowCol from "./getTileFromRowCol.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
import tweenDoTweenAttackMove from "./tween.doTweenAttackMove.js";
import tweenPromise from "./tweenPromise.js";
import wait from "./wait.js";

const poolManager = new PoolAliveManager();
export function getAliveEnemies() {
  return poolManager.getAlive();
}

export default class Enemy extends Phaser.GameObjects.Container {
  __target = null;
  __damage = 1;
  iamEnemyMob = true;
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
    this.__machineState = enemyStateMachine.call(this, {
      getClosestTarget: () => this.findClosestTarget(),
      getTarget: () => this.getTarget(),
      getMinTouchDistance: () => this.__sprite.width,
      moveTowardsTarget: () => this.moveTowardsTarget(),
      doAttack: () => this.doAttack(),
    });
  }

  static spawn(scene, x, y) {
    const enemy = poolManager.create(scene, Enemy);
    enemy.setPosition(x, y);
    enemy.__machineState.reset();
    enemy.__alive = true;
    enemy.setVisible(true);
    if (enemy.body) {
      enemy.body.setEnable(true);
    }
    return enemy;
  }

  setTarget(target) {
    // debe tener posicion
    if (!(target.x && target.y)) {
      return;
    }
    this.__target = target;
  }
  getTarget() {
    return this.__target;
  }

  getDamage() {
    // *modificadores (-2 attac)
    return this.__damage;
  }

  moveTowardsTarget() {
    //  I COULD VALIDATE IF THAT SPRITE IS EMPTY?
    let target = this.getTarget();
    if (!target) {
      this.__machineState.idle();
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
        this.__machineState.idle();
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

  findClosestTarget() {
    let closestEntityList = getSortedEntityListDistFromCoords(this);

    if (closestEntityList.length === 0) {
      this.__target = null;
      return;
    }
    this.storedClosestEntityList = closestEntityList;
    //this.__target = getCloseEntityPosibleFromList(this, closestEntityList);
    this.__target = closestEntityList[0];
    return this.__target;
  }
  async doAttack() {
    if (!this.getTarget().isAlive()) {
      this.__machineState.idle();
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

  kill() {
    this.setAlive(false);
    this.setVisible(false);
    this.body.setEnable(false);
  }
  update() {
    if (!this.isAlive()) {
      return;
    }
    this.__machineState.run();
    this.setDepth(parseInt(this.y + this.height));
  }
}
