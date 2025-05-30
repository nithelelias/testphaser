import PoolAliveManager from "./poolAliveManager.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
const poolManager = new PoolAliveManager();
export default class MapResource extends Phaser.GameObjects.Sprite {
  total = 0;
  constructor(scene) {
    super(scene, 0, 0, RESOURCES.name, RESOURCES.frames.empty);
    scene.add.existing(this);
  }

  static create(scene, x, y, resourceName, total) {
    let resource = poolManager.create(scene, MapResource);
    resource.total = total;
    let resourceFrameArray = RESOURCES.frames.resources[resourceName];
    resource.setFrame(
      resourceFrameArray[random(0, resourceFrameArray.length - 1)]
    );
    resource.setTint(
      {
        wood: 0x38d973,
        rock: 0xf1f1f1,
        gold: 0xffff00,
        iron: 0xa19d94,
      }[resourceName]
    );
    resource.setVisible(true);
    resource.setPosition(x, y);
    return resource;
  }
  kill() {
    this.setAlive(false);
    this.setVisible(false);
  }
}
