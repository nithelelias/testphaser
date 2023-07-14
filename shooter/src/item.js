import jumpDropAwayAnimation from "./animations/jumpDropAwayAnimation.js";
import MapLayer from "./mapLayer.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
const poolManager = new PoolAliveManager();

const gridSize = MapLayer.getGridSize();

export const DataItem = {
  frame: 0,
  name: "",
  quantity: 0,
  pickUpEvent: () => null,
};

export default class Item extends Phaser.GameObjects.Container {
  itemData = DataItem;
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add
        .sprite(0, 0, RESOURCES.name, 0)
        .setOrigin(0.5)
        .setDisplaySize(gridSize, gridSize),
    ]);
    this.setSize(gridSize, gridSize);
    this.sprite = this.list[0];
    scene.add.existing(this);
  }

  static create(scene, x, y, itemData = DataItem) {
    let item = poolManager.create(scene, Item);
    item.setPosition(x, y);
    item.setVisible(true);
    item.sprite.setFrame(itemData.frame);
    item.itemData = itemData;

    setTimeout(() => {
      // item.body.setEnable(true);
    }, 2);
    return item;
  }
  jumpTo(x, y) {
    this.body.setEnable(false);
    let { promise } = jumpDropAwayAnimation(this.scene, this, x, y);

    promise.then(() => {
      this.body.setEnable(true);
    });
  }
  remove() {
    this.__alive = false;
    this.setVisible(false);
    this.body.setEnable(false);
    this.body.setVelocity(0, 0);
  }
  pickUp() {
    if (!this.__alive) {
      return;
    }
    this.itemData.pickUpEvent();
    this.remove();
  }
}
