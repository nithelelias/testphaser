import { GRIDSIZE } from "./constants.js";
import RESOURCES from "./resources.js";

export default class Cursor extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.cursor)
        .setDisplaySize(GRIDSIZE, GRIDSIZE),
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.empty)
        .setDisplaySize(GRIDSIZE, GRIDSIZE),
    ]);
    scene.add.existing(this);
    this.currentFrame = null;
    this.setDepth(100);
    //this.reset();
  }

  setFrame(_frame) {
    this.currentFrame = _frame;
    this.list[1].setFrame(_frame);
  }
  setColor(_color) {
    this.list[1].setTint(_color);
  }
  hideBorder() {
    this.list[0].setAlpha(0);
  }
  reset() {
    this.list[1].setFrame(RESOURCES.frames.empty);
    this.currentFrame = null;
    this.list[1].clearTint();
    this.list[0].setAlpha(1);
  }

  static onHoverButton(cursor) {
    cursor.setFrame(RESOURCES.frames.pointer);
    cursor.setColor(0xff1111);
    cursor.hideBorder();
  }
  static onHoverOut(cursor) {
    cursor.reset();
  }
}
