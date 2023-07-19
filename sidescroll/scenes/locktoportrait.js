import Button from "../src/button.js";
import lockToFullScaleLandScape from "../src/lockToFullScaleLandScape.js";

export default class LockToPortrait extends Phaser.Scene {
  constructor() {
    super("lockportrait");
    this.__onEnd_callback = () => null;
  }
  onEnd(callback) {
    this.__onEnd_callback = callback;
  }
  create() {
    let text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "solo landscape")
      .setOrigin(0.5);

    const btn = new Button(
      this,
      this.scale.width / 2,
      text.y + text.height + 12,
      "CLICK PARA INICIAR",
      {
        onClick: () => {
          lockToFullScaleLandScape().then((response) => {
            console.log(response);

            this.scene.sendToBack();
            this.scene.get("main").scene.setActive(true);
            this.__onEnd_callback();
            this.__onEnd_callback = () => null;
          });
        },
      }
    );
  }
}
