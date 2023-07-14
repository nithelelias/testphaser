import RESOURCES from "./resources.js";
export const DECORATIVE = {
  frame: 0,
  name: "",
  light: false,
};
export default class DecorativeEnviroment extends Phaser.GameObjects.Container {
  constructor(scene, x, y, decorativeInfo = DECORATIVE) {
    super(scene, x, y, [
      scene.add.sprite(0, 0, RESOURCES.name, decorativeInfo.frame),
    ]);
    scene.add.existing(this);
  }
}
