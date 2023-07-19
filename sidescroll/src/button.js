export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, { onPress, onClick }) {
    super(scene, x, y, [
      scene.add.rectangle(0, 0, 100, 32, 0xffffff, 1),
      scene.add
        .text(0, 0, label, {
          color: "black",
        })
        .setOrigin(0.5),
    ]);
    scene.add.existing(this);
    const text = this.list[1];
    const padding = 12;
    this.list[0].setSize(text.width + padding, text.height + padding);
    this.setSize(text.width + padding, text.height + padding);
    this.setInteractive();
    let pressed = false;
    this.on("pointerdown", () => {
      pressed = true;
      this.setScale(0.8, 0.8);
      onPress && onPress();
    });
    scene.input.on("pointerup", () => {
      this.setScale(1, 1);
      if (pressed) {
        onClick && onClick();
      }
      pressed = false;
    });
  }
}
