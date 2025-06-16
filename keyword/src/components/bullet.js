export default class Bullet extends Phaser.GameObjects.Container {
  sprite;

  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene.add.existing(this);
    this.setSize(8, 8);
    this.sprite = scene.add
      .image(0, 0, "__WHITE")
      .setDisplaySize(this.width, this.height)
      .setTint(0xffff00);
    this.add(this.sprite);
  }
  respawn(x, y) {
    this.active = true;
    this.setVisible(true);
    this.setPosition(x, y);
  }

  kill() {
    this.active = false;
    this.setVisible(false);
  }
}
