import Button from "./button.js";
import { GRIDSIZE } from "./constants.js";
import Cursor from "./cursor.js";
const width = GRIDSIZE * 4,
  height = GRIDSIZE * 4;
export default class TopUIComponent extends Phaser.GameObjects.Container {
  constructor(scene, cursor, { onNextStage }) {
    super(scene, scene.scale.width / 2 - width / 2, 0, [
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0)
        .setTintFill(0xfff000)
        .setAlpha(0.1)
        .setDisplaySize(width, height),
    ]);
    scene.add.existing(this);
    // PUT AT TOP
    this.buttonStartWave = new Button(scene, width, height, ["click aqui"], {
      onClick: () => {
        onNextStage();
      },
      onHover: () => {
        Cursor.onHoverButton(cursor);
      },
      onHoverOut: () => {
        Cursor.onHoverOut(cursor);
      },
    });
    this.buttonStartWave.setPosition(
      width / 2,
      height - this.buttonStartWave.height / 2
    );

    this.add([this.buttonStartWave]);
  }
}
