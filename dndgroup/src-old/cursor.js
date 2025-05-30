import { COLORS, GRIDSIZE } from "./constants.js";
import RESOURCES from "./resources.js";

export default class Cursor extends Phaser.GameObjects.Container {
  static current = null;
  currentFrames = [RESOURCES.name, RESOURCES.frames.cursor,RESOURCES.name, RESOURCES.frames.empty];
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.cursor)
        .setDisplaySize(GRIDSIZE, GRIDSIZE),
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.empty)
        .setDisplaySize(GRIDSIZE, GRIDSIZE),
      scene.add
        .rectangle(0, 0, 16, 16, COLORS.UI_BACKGROUND1, 0.8)
        .setOrigin(0),
    ]);
    scene.add.existing(this);
    this.tooltip = scene.add
      .bitmapText(0, 0, "font1", "", 16)
      .setTint(COLORS.white)
      .setDropShadow(1, 1)
      .setOrigin(0);
    this.tooltip.background = this.list[2];
    this.tooltip.background.setVisible(false);
    this.tooltip.setVisible(false);
    this.add(this.tooltip);
    this.setDepth(100);
    //this.reset();
    Cursor.current = this;
  }
  static setAsPointer() {
    Cursor.current.setFrame(RESOURCES.frames.pointer, RESOURCES.frames.empty);
    Cursor.current.setColor(0xff0000);
  }
  static reset() {
    Cursor.current.reset();
  }
  static setToolTip(text) {
    Cursor.current.setToolTip(text);
  }

  static hideToolTip() {
    Cursor.current.hideToolTip();
  }
  static setFrame(frame, frame2) {
    Cursor.current.setFrame(frame, frame2);
  }

  setToolTip(text) {
    let padding = 16,
      half_padding = padding / 2;
    const rightSide = this.x > this.scene.scale.width * 0.62;
    const topSide = this.y < this.scene.scale.height * 0.62;
    this.tooltip.setVisible(true);
    this.tooltip.background.setVisible(true);
    this.tooltip.setText(text);
    this.tooltip.y = topSide
      ? this.tooltip.height
      : -this.tooltip.height * 2 - half_padding;
    this.tooltip.x = rightSide ? -this.tooltip.width : 0;
    this.tooltip.background.setDisplaySize(
      this.tooltip.width + padding,
      this.tooltip.height + padding
    );
    this.tooltip.background.x = this.tooltip.x - half_padding;
    this.tooltip.background.y = this.tooltip.y - half_padding;
  }
  hideToolTip() {
    this.tooltip.setVisible(false);
    this.tooltip.background.setVisible(false);
  }
  setFrame(frame, frame2 = RESOURCES.frames.empty) {
    this.list[0].setFrame(frame);
    this.list[1].setFrame(frame2);
    this.currentFrames = [frame, frame2];
  }
  getFrames() {
    return [this.list[0].getFrames()];
  }
  setColor(color, color2) {
    if (color) {
      this.list[0].setTint(color);
    }
    if (color2) {
      this.list[1].setTint(color2);
    }
  }
  clearTint() {
    this.list[0].clearTint();
    this.list[1].clearTint();
  }

  reset() {
    this.setFrame(RESOURCES.frames.cursor, RESOURCES.frames.empty);
    this.clearTint();
  }

  static onHoverOut(cursor) {
    cursor.reset();
  }
}
