export default class RectLabel extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.image(-3, -3, "rect").setOrigin(0).setTintFill(0xf1f1f1),
      scene.add
        .text(0, 0, ["0,0"], {
          color: 0x111,
        })
        .setOrigin(0),
    ]);
    scene.add.existing(this);

    this.setScrollFactor(0);
    this.text = this.list[1];
    this.list[0].setDisplaySize(
      this.text.displayWidth + 6,
      this.text.displayHeight + 6
    );
    addEventListener("resize", (event) => {
      this.fit();
    });
    this.fit();
  }
  fit() {
    this.setPosition(8, 8);
  }
  setText(text) {
    this.text.setText(text);
    this.list[0].setDisplaySize(
      this.text.displayWidth + 6,
      this.text.displayHeight + 6
    );
  }
}
