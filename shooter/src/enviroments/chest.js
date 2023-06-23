import Main from "../../scenes/main.js";
import jumpDropItemAnimation from "../animations/jumpDropItemAnimation.js";
import MapLayer from "../mapLayer.js";
import random from "../random.js";

import RESOURCES from "../resources.js";

const gridSize = MapLayer.getGridSize();
const getRndJmp = () => random(gridSize, gridSize * 3) * [1, -1][random(0, 1)];
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
  __dropItems() {
    if (this.is_open) {
      return;
    }

    this.loot.forEach((dataItem) => {
      let item = Main.current.addItem(this.x, this.y, dataItem);
      item.jumpTo(this.x + getRndJmp(), this.y + getRndJmp());
    });
  }
  open() {
    if (this.is_open) {
      return;
    }

    this.sprite.setFrame(RESOURCES.frames.chest.open);

    this.__dropItems();
    this.callbackOnOpen();
    this.is_open = true;
    return jumpDropItemAnimation(this.sprite);
  }
}
