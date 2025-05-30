import { COLORS } from "../constants/values.js";

export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, onClick = () => {}) {
    super(scene, x, y, []);
    scene.add.existing(this);
    const padding = 20;

    const labelText = scene.add
      .bitmapText(0, 0, "font1", text, 16)
      .setOrigin(0.5)
      .setTint(COLORS.color2);

    const bg = scene.add
      .rectangle(
        0,
        0,
        labelText.width + padding,
        labelText.height + padding,
        COLORS.color1
      )
      .setOrigin(0.5)
      .setAlpha(0.9);
    this.add([bg, labelText]);

    this.setSize(bg.width, bg.height);
    let down = false;
    this.setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        down = true;
        bg.setAlpha(0.5).setScale(0.98);
        bg.setFillStyle(COLORS.color2);
        labelText.setTint(COLORS.color1);
      })
      .on("pointerover", () => {
        bg.setAlpha(1).setScale(1.1);
      })
      .on("pointerout", () => {
        bg.setAlpha(0.8).setScale(1);
        bg.setFillStyle(COLORS.color1);
        labelText.setTint(COLORS.color2);
      })
      .on("pointerup", () => {
        if (down) {
          onClick();
        }
        down = false;
        bg.setAlpha(0.8).setScale(1);
        bg.setFillStyle(COLORS.color1);
        labelText.setTint(COLORS.color2);
      });
  }
  setText(text) {
    this.getAt(1).setText(text);
    const padding = 20;
    const bg = this.getAt(0);
    bg.setSize(this.getAt(1).width + padding, this.getAt(1).height + padding);
  }
}
