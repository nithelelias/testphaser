import RESOURCES from "../resources.js";
import TickManager from "../tickManager.js";

export default class UITickTempo extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add.image(0, 0, RESOURCES.name, RESOURCES.frames.squares.empty1),
      scene.add.image(16, 0, RESOURCES.name, RESOURCES.frames.squares.fill1),
    ]);
    let odd = true;
    scene.add.existing(this);
    TickManager.onTick(() => {
      odd = !odd;
      if (odd) {
        this.list[0].x = 0;
        this.list[1].x = 16;
      } else {
        this.list[0].x = 16;
        this.list[1].x = 0;
      }
    });
  }
}
