import RESOURCES from "./resources.js";
import tweenPromise from "./tweenPromise.js";
import walkJumpAnim from "./animation/walkJumpAnim.js";

function EntitiMoveLock(entity) {
  var locked = false;
  const moveAnim = new walkJumpAnim(
    entity.sprite,
    entity.sprite.y,
    entity.sprite.displayHeight * 0.4
  );

  const move = async (coords) => {
    if (locked) {
      return locked;
    }
    locked = true;
    //moveAnim.play();
    await tweenPromise(entity.scene, {
      targets: [entity],
      x: coords.x,
      y: coords.y,
      ease: "QuintEaseInOut",
      duration: 100,
    });
    locked = false;
  };

  return {
    move,
  };
}

export default class Human extends Phaser.GameObjects.Container {
  constructor(scene, size = 64) {
    super(scene, 0, 0, []);
    this.backEmpty = scene.add
      .image(0, 0, "rect")
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setDisplaySize(size, size)
      .setTintFill(0x000);

    this.sprite = scene.add
      .sprite(0, 0, RESOURCES.name, RESOURCES.human)
      .setOrigin(0.5)
      .setDisplaySize(size / 2, size / 2);
    this.add([this.backEmpty, this.sprite]);
    this.size = size;
    scene.add.existing(this);
    this.moveManager=new EntitiMoveLock(this)
  }

  async doWalkAnim(coords) {
    return this.moveManager.move(coords)
  }
}
