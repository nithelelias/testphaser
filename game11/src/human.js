import ElementsFrames from "./elementsFrames.js";

export default class Human extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.sprite(0, 0, "world", ElementsFrames.human),
      scene.add.image(0, 0, "world", ElementsFrames.bow),
    ]);
    scene.add.existing(this);
    this.sprite = this.list[0];
    this.weapon = this.list[1];
  }

}


