export default class Human extends Phaser.GameObjects.Container {
  constructor(scene, size = 16) {
    super(scene, 0, 0, [
      scene.add
        .sprite(0, 0, "tilemap", 26)
        .setOrigin(0.5)
        .setDisplaySize(size, size),
    ]);
    this.size = size;
    scene.add.existing(this);
  }

  doWalkAnim(coords) {
    return new Promise((_resolve) => {
      this.scene.add.tween({
        targets: [this],
        x: coords.x,
        y: coords.y,
        ease: "QuintEaseIn",
        duration: 1000,
        onComplete: () => {
          _resolve();
        },
      });
    });
  }
}
