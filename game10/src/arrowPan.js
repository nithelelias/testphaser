export default class ArrowPan extends Phaser.GameObjects.Image {
  static size = 64;
  constructor(scene, frame, dirPan) {
    super(scene, 0, 0, "world", frame);
    this.setDisplaySize(ArrowPan.size, ArrowPan.size);
    this.__onactive = () => {};
    this.setScrollFactor(0);
    this.setAlpha(0.6);
    this.setDepth(100);
    this.setInteractive();
    let intervalId;
    this.on("pointerover", () => {
      this.hover(true);
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        this.__onactive(dirPan);
      }, 100);

      this.once("pointerout", () => {
        this.hover(false);
        clearInterval(intervalId);
      });
    });
    scene.add.existing(this);
  }

  onActive(_callback) {
    this.__onactive = _callback;
    return this;
  }
  hover(_on) {
    const _scale = _on ? 1.2 : 1;
    this.setDisplaySize(ArrowPan.size * _scale, ArrowPan.size * _scale);
    this.setAlpha(_on ? 1 : 0.6);
  }
}
