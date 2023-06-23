import { getKeys, onKeysChange } from "../context/data.js";
import RESOURCES from "../resources.js";
import TextFromSprite from "../textFromSprite.js";

export default class KeyView extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add
        .image(0, 0, "rect")
        .setDisplaySize(64, 32)
        .setTintFill(0x111100)
        .setAlpha(0.5)
        .setOrigin(0),
      scene.add
        .image(16, 16, RESOURCES.name, RESOURCES.frames.key)
        .setAngle(90)
        .setFlipX(true)
        .setOrigin(0.5)
        .setDisplaySize(32, 32),
    ]);
    scene.add.existing(this);
    this.text = new TextFromSprite(
      scene,
      24,
      8,
      ["x"],
      {
        name: RESOURCES.name,
        chars: RESOURCES.chars,
      },
      {
        fontSize: 16,
        spacing: 12,
      }
    );
    this.add(this.text);
    onKeysChange((keys) => {
      this.updateKeys();
    });
    this.updateKeys()
  }
  updateKeys() {
    let newnum = getKeys().toString().padStart(2, "0");
    this.text.setText(`x${newnum}`);
  }
}
