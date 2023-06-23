import { GRIDSIZE } from "./constants.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
import shakeObject from "./shakeObject.js";
import WORLD from "./world.js";
const default_wall_live = 5;
const poolManager = new PoolAliveManager();
export default class Wall extends Phaser.GameObjects.Container {
  __id = poolManager.genNewId();
  __alive = false;
  life = 0;
  iamWall=true;
  constructor(scene, x, y) {
    super(scene, parseInt(x), parseInt(y), [
      scene.add.sprite(0, 0, RESOURCES.name, RESOURCES.frames.wall.normal),
      //scene.add.text(0, 0, "id",{color:"#ff0000"}),
    ]);
    //this.list[1].setText(this.__id);
    this.__sprite = this.list[0];
    this.setSize(GRIDSIZE, GRIDSIZE);
    scene.add.existing(this);
    this.setDepth(parseInt(this.y + this.height / 2));
  }
  static create(scene, x, y) {
    const wall = poolManager.create(scene, Wall);
    wall.setPosition(x, y);
    wall.__alive = true;
    wall.life = default_wall_live + 0;
    wall.setVisible(true);

    WORLD.setEntity(wall);
    if (wall.body) {
      wall.body.setEnable(true);
    }
    return wall;
  }

  hit(damage) {
    if (damage < 1) {
      return;
    }
    
    this.life -= damage;
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
