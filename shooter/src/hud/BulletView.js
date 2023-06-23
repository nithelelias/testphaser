import { getBullets, onBulletsChange } from "../context/data.js";
import RESOURCES from "../resources.js";
import TextFromSprite from "../textFromSprite.js";

export default class BulletView extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add
        .image(0, 0, "rect")
        .setDisplaySize(80, 32)
        .setTintFill(0x111100)
        .setAlpha(0.5)
        .setOrigin(0),
      scene.add
        .image(16, 16, RESOURCES.name, RESOURCES.frames.bullet_box)
        .setTintFill(0xff001f)
        .setOrigin(0.5)
        .setDisplaySize(32, 32),
    ]);
    scene.add.existing(this);
    this.text = new TextFromSprite(
      scene,
      32,
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
    onBulletsChange((keys) => {
      this.updateBulletCount();
    });
    this.updateBulletCount();
  }
  updateBulletCount() {
    let bullets = getBullets();
    let total = bullets.total.toString().padStart(2, "0");
    //let max = bullets.max.toString().padStart(2, "0");
    this.text.setText(`x${total}`);
  }
}
