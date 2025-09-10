import RESOURCES from "../constants/resources.js";
import { COLORS, GRID } from "../constants/values.js";

export default class Pice extends Phaser.GameObjects.Container {
  sprite;
  rect;
  col = 0;
  row = 0;
  constructor(scene, x, y, size = 1, frame = 0) {
    super(scene, x, y);
    scene.add.existing(this);
    this.rect = scene.add
      .rectangle(0, 0, GRID.size * size, GRID.size * size, COLORS.color2, 0.15)
      .setOrigin(0.5);
    this.sprite = scene.add.sprite(0, 0, RESOURCES.name, frame);

    this.add([this.rect, this.sprite]);
    this.fitSize(size);
  }
  fitSize(xtimes) {
    const desireSize = GRID.size * xtimes;
    this.sprite.setScale(desireSize / this.sprite.width);
    this.setSize(desireSize, desireSize);
  }
  putAt(col, row) {
    this.col = col;
    this.row = row;
    this.setPosition(
      col * GRID.size + GRID.size / 2,
      row * GRID.size + GRID.size / 2
    );
  }
  kill() {
    this.sprite.setFrame(RESOURCES.frames.empty);
    this.setVisible(false);
  }
}
