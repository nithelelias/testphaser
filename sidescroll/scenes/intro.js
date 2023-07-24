import Button from "../src/button.js";
import lockToFullScaleLandScape from "../src/lockToFullScaleLandScape.js";

export default class Intro extends Phaser.Scene {
  constructor() {
    super("intro");
  }
  create() {
    let text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "SALTADOR DALI V1.4")
      .setOrigin(0.5);

    const btn = new Button(
      this,
      this.scale.width / 2,
      text.y + text.height + 12,
      "CLICK PARA INICIAR",
      {
        onClick: () => {
          lockToFullScaleLandScape(this).then((response) => {
            console.log(response);
            this.scene.start("main");
          });
        },
      }
    );
  }
}
