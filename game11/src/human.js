import ElementsFrames from "./elementsFrames.js";
import getTileSize from "./getTileSize.js";
import HumanStateMachine from "./human.statemachine.js";

export default class Human extends Phaser.GameObjects.Container {
  constructor(scene,x,y) {
    super(scene, x,y, [
      scene.add
        .sprite(0, 0, "world", ElementsFrames.human)
        .setDisplaySize(getTileSize(), getTileSize()),
      scene.add
        .image(4, 0, "world", ElementsFrames.bow)
        .setDisplaySize(getTileSize() * 0.8, getTileSize() * 0.8),
    ]);
    scene.add.existing(this);
    this.sprite = this.list[0];
    this.weapon = this.list[1];
    HumanStateMachine.call(this)
  }

}
