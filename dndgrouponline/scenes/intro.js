import Button from "../src/components/button.js";
import { init, restoreFromLocal } from "../src/components/storage.js"; 
import { CLIENT } from "../src/constants/data.js";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("intro");
    init();
  }
  create() {
    const mssg = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "¿Quien eres?"
    );

    const btn = new Button(
      this,
      this.scale.width / 2,
      this.scale.height / 2 + 200,
      "admin",
      () => {
        CLIENT.type = 2;
        start();
      }
    );
    const btn2 = new Button(
      this,
      this.scale.width / 2 + 100,
      this.scale.height / 2 + 200,
      "player",
      () => {
        start();
      }
    );
    const start = () => {
      btn.destroy();
      btn2.destroy();
      mssg.setText("...cargando");
      restoreFromLocal(() => {
        this.scene.start("main");
      });
    };
  }
}
