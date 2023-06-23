import { GRIDSIZE, TOWER_DEFAULT_SHOT_DELAY } from "./constants.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
import shakeObject from "./shakeObject.js";
import WORLD from "./world.js";
const default_tower_life = 100;
const poolManager = new PoolAliveManager();
export default class Tower extends Phaser.GameObjects.Container {
  __id = poolManager.genNewId();
  __alive = false;
  iamTower = true;
  constructor(scene, x, y) {
    super(scene, parseInt(x), parseInt(y), [
      scene.add.sprite(0, 0, RESOURCES.name, RESOURCES.frames.tower),
    ]);
    this.__sprite = this.list[0];
    this.setSize(GRIDSIZE, GRIDSIZE);
    scene.add.existing(this);
    this.life = default_tower_life+0;
    this.shield = 0;
    this.setDepth(parseInt(this.y + this.height / 2));
  }
  static create(scene, x, y, {   }) {
    const tower = poolManager.create(scene, Tower);
    tower.setPosition(x, y);
    tower.__alive = true;
    tower.life = default_tower_life+0;
    tower.setVisible(true); 
    WORLD.setEntity(tower);
    if (tower.body) {
      tower.body.setEnable(true);
    }
    return tower;
  }
 
  hit(damage) {
    if (damage < 1) {
      return;
    }
    let newdamage = damage - this.shield;
    this.shield -= damage;
    if (this.shield > 0) {
      return;
    }

    this.life -= newdamage;
    this.shake();
    if (this.life <= 0) {
      // se destruye
      this.explode();
    }
  }
  explode() {
    this.life = 0;
    this.__alive = false;
    this.setVisible(false);
    WORLD.unsetFromCoords(this);
  }
  shake() {
    shakeObject(this.__sprite, 100, 0.1, { modY: 0 });
  }
}
