import { BUILDING_TYPES } from "./building_types.js";
import { COLORS, GRIDSIZE } from "./constants.js";
import { DATA_STORES } from "./context/data.js";
import PoolAliveManager from "./poolAliveManager.js";
import PopMessage from "./popMessage.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
import shakeObject from "./shakeObject.js";
import shotClosestEnemy from "./shotClosestEnemy.js";
import tintAnimation from "./tintAnimation.js";
import WORLD from "./world.js";
const poolManager = new PoolAliveManager();

export const BUILDTYPES = { ...BUILDING_TYPES.house };
export default class Building extends Phaser.GameObjects.Container {
  __id = poolManager.genNewId();
  __alive = false;
  build_value = 0;
  buildType = BUILDTYPES;
  isBuilding = true;
  constructor(scene, x, y) {
    super(scene, parseInt(x), parseInt(y), [
      scene.add.sprite(0, 0, RESOURCES.name, RESOURCES.frames.tower),
    ]);
    this.__sprite = this.list[0];
    this.setSize(GRIDSIZE, GRIDSIZE);
    scene.add.existing(this);
    this.life = BUILDTYPES.life + 0;
    this.setDepth(parseInt(this.y + this.height / 2));
  }
  static create(scene, x, y, buildType = BUILDTYPES) {
    const building = poolManager.create(scene, Building);
    building.setPosition(x, y);
    building.buildType = buildType;
    building.life = buildType.life + 0;
    building.setFrame(buildType.icon);
    building.setVisible(true);
    building.tick_count = 0;

    WORLD.setEntity(building);

    if (building.body) {
      building.body.setEnable(true);
    }
    return building;
  }
  setFrame(frame) {
    this.__sprite.setFrame(frame);
  }
  hit(damage) {
    if (damage < 1) {
      return;
    }
    let newdamage = damage;
    this.life -= newdamage;
    this.shake();
    tintAnimation(this.__sprite, COLORS.white, COLORS.red).then(() => {
      this.__sprite.clearTint();
    });
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
  __popMessage(message, priority, settings) {
    PopMessage.create(
      this.x + random(-8, 8),
      this.y - random(2, 8),
      message,
      priority,
      { fontSize: 16 },
      { duration: 100, y: this.y - 16 },
      settings
    );
  }
  everyTick() {
    if (!this.__alive) {
      return;
    }
    if (!this.buildType) {
      return;
    }
    if (this.buildType.attack) {
      this.tick_count++;
      if (this.tick_count >= this.buildType.attack.ticks) {
        if (shotClosestEnemy(this, this.buildType.attack)) {
          this.tick_count = 0;
        }
      }
    }
  }
  everyMayorTick({ addToStore }) {
    if (!this.__alive) {
      return;
    }
    if (!this.buildType) {
      return;
    }
    if (this.buildType.every) {
      let dmg = 0;
      for (let key in this.buildType.every) {
        let value = this.buildType.every[key];
        if (value < 0) {
          const result = DATA_STORES[key].get() + value;
          if (result < 0) {
            dmg += 1;
            this.__popMessage("Insuficiente", true, {
              iconRight: RESOURCES.frames.resource_icons[key],
            });
          }
        }
        addToStore(key, value);
      }
      if (dmg > 0) {
        this.hit(dmg);
      }
    }
  }
}
