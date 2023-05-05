import getTileSize from "./getTileSize.js";

export default class ButtonSprite extends Phaser.GameObjects.Container {
  static width = 64;
  static height = 64;
  constructor(scene, x, y, frameIcon, text = null) {
    super(scene, x, y, [
      // this make a border
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0.5)
        .setTintFill(0x111)
        .setDisplaySize(ButtonSprite.width + 8, ButtonSprite.height + 8),
      // this make a background
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0.5)
        .setTintFill(0xf1f1f1)
        .setDisplaySize(ButtonSprite.width, ButtonSprite.height),
      // this make the sprite
      scene.add
        .sprite(0, 0, "world", frameIcon)
        .setOrigin(0.5)
        .setDisplaySize(ButtonSprite.width, ButtonSprite.height),
    ]);
    this.sprite = this.list[2];
    //
    if (text) {
      console.log("add text", text);
      const fontSize = parseInt(getTileSize() * 0.8);
      this.text = scene.add
        .text(0, ButtonSprite.height - fontSize + 2, text, {
          fontSize,
          fill: "#000",
        })

        .setOrigin(0.5);

      [this.list[0], this.list[1]].forEach((elem) => {
        elem.setDisplaySize(
          elem.displayWidth,
          elem.displayHeight + this.text.height
        );
        elem.y += parseInt(this.text.height / 2);
      });

      this.add(this.text);
    } else {
      this.text = null;
    }

    this.__onClick = () => {};
    this.setSize(ButtonSprite.width, ButtonSprite.height);
    this.setInteractive();

    this.on("pointerdown", () => {
      this.__onClick();
    });
    this.on("pointerover", (pointer) => {
      this.__onHover && this.__onHover(pointer);
      this.once("pointerout", (pointer) => {
        this.__onHoverOut && this.__onHoverOut(pointer);
      });
    });
  }
  onHover(_callback, __callbackOut) {
    this.__onHover = _callback;
    this.__onHoverOut = __callbackOut;
    return this;
  }
  onClick(_callback) {
    this.__onClick = _callback;
    return this;
  }
}
