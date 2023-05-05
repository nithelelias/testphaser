import ButtonSprite from "./btnSprite.js";

export default class ActionMenu extends Phaser.GameObjects.Container {
  static height = 80;
  constructor(scene) {
    super(scene, 0, 0, [
      new ButtonSprite(scene, 0, 0, 189, "sell").onClick(() => {
        this.doSell();
      }),
      new ButtonSprite(scene, 72, 0, 50, ["nature", "Buy"]).onClick(() => {
        this.doBuy("nature");
      }),
    ]);
    scene.add.existing(this);
    addEventListener("resize", (event) => {
      this.center();
    });
    this.center();
  }
  doSell() {
    console.log("OPEN SELL");
  }
  center() {
    this.setPosition(
      parseInt(this.scene.scale.width / 2),
      this.scene.scale.height - ActionMenu.height
    );
  }
}
