import Button from "../src/button.js";
import checkLandScape from "../src/checkLandScape.js";
import lockToFullScaleLandScape from "../src/lockToFullScaleLandScape.js";

export default class Intro extends Phaser.Scene {
  constructor() {
    super("intro");
  }
  create() {
    let text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "SALTADOR DALI V1.8")
      .setOrigin(0.5);

    const btn = new Button(
      this,
      this.scale.width / 2,
      text.y + text.height + 12,
      "CLICK PARA INICIAR",
      {
        onClick: () => {
          this.scene.start("main");
        },
      }
    );
    checkLandScape(this.game, () => {
      text.setPosition(this.scale.width / 2, this.scale.height / 2);
      btn.setPosition(this.scale.width / 2, text.y + text.height + 12);
      setTimeout(() => {
        window.scrollTo(0, -100);
      }, 100);
    });
  }
}
