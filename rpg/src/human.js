import RESOURCES from "./resources.js";
import tweenPromise from "./tweenPromise.js";
import WalkSwingAnim from "./walkSwingAnim.js";

export default class Human extends Phaser.GameObjects.Container {
  constructor(scene, size = 64) {
    super(scene, 0, 0, []);
    this.backEmpty = scene.add
      .image(0, 0, "rect")
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setDisplaySize(size, size)
      .setTintFill(0x000);

    this.sprite = scene.add
      .sprite(0, 0, RESOURCES.name, RESOURCES.human)
      .setOrigin(0.5)
      .setDisplaySize(size / 2, size / 2);
    this.add([this.backEmpty, this.sprite]);
    this.size = size;
    scene.add.existing(this);
    this.swingAnim = new WalkSwingAnim(this.sprite);
  }

  async doWalkAnim(coords) {
    this.swingAnim.play();
    await tweenPromise(this.scene, {
      targets: [this],
      x: coords.x,
      y: coords.y,
      ease: "QuintEaseIn",
      duration: 100,
    });
  }
}
