
import jumpDropItemAnimation from "../animations/jumpDropItemAnimation.js"; 
import dropItemsAt from "../dropItemsAt.js";

import RESOURCES from "../resources.js";

export default class Chest extends Phaser.GameObjects.Container {
  isChest = true;
  is_open = false;
  constructor(scene, x, y, size, loot = []) {
    super(scene, x, y, [
      scene.add
        .sprite(0, 0, RESOURCES.name, RESOURCES.frames.chest.close)
        .setOrigin(0.5)
        .setDisplaySize(size, size),
    ]);
    this.setSize(size, size);
    this.sprite = this.list[0];
    this.loot = loot;
    this.callbackOnOpen = () => {};
    scene.add.existing(this);
  }
  onOpen(_callback) {
    this.callbackOnOpen = _callback;
  }
  close() {
    this.is_open = false;
    this.sprite.setFrame(RESOURCES.frames.chest.close);
  }

  open() {
    if (this.is_open) {
      return;
    }

    this.sprite.setFrame(RESOURCES.frames.chest.open);

    dropItemsAt(this.x, this.y, this.loot);
    this.callbackOnOpen();
    this.is_open = true;
    return jumpDropItemAnimation(this.sprite);
  }
}
