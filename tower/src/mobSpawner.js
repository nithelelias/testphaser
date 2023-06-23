import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
const poolManager = new PoolAliveManager();
export default class MobSpawner extends Phaser.GameObjects.Sprite {
  
  constructor(scene) {
    super(scene, 0, 0, RESOURCES.name, RESOURCES.frames.spawner);
    scene.add.existing(this);
  }
  static create(scene, x, y) {
    let spawner = poolManager.create(scene, MobSpawner);
    spawner.setVisible(true);
    spawner.setAlive(true);
    spawner.setPosition(x, y);
    return spawner;
  }
  kill() {
    this.setAlive(false);
    this.setVisible(false);
  }
}
