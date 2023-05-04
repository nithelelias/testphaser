import getTileSize from "./getTileSize.js";
const default_frame = 716;
export default class Cursor extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.image(0, 0, "world", default_frame),
      scene.add.image(0, 0, "world", 0),
    ]);

    scene.add.existing(this);
    this.drawFrame = null;
    this.list.forEach((element) => {
      element.setDisplaySize(getTileSize(), getTileSize());
    });
  }
  unsetFrame() {
    this.list[1].setFrame(0);
    this.drawFrame = null;
  }
  startDrawFrame(_frame) {
    this.drawFrame = _frame;
    this.list[1].setFrame(_frame);
  }
}
