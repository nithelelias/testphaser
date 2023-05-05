import getTileSize from "./getTileSize.js";
export default class Layer extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    this.dic = {};
  }
  addImg(_x, _y, _frame) {
    const size = getTileSize();
    const img = this.scene.add.image(_x, _y, "world", _frame);
    img.setDisplaySize(size, size);
    this.add(img);
    return img;
  }
  putFrameAt(x, y, frame) {
    let key = x + "_" + y;
    if (this.dic.hasOwnProperty(key)) {
      this.dic[key].setFrame(frame);
    } else {
      this.dic[key] = this.addImg(x, y, frame);
    }
    return this.dic[key]
  }
  removeFrameAt(x, y) {
    let key = x + "_" + y;
    if (this.dic.hasOwnProperty(key)) {
      this.dic[key].destroy();
      delete this.dic[key];
    }
  }
  clearWorld() {
    for (let key in this.dic) {
      this.dic[key].destroy();
      delete this.dic[key];
    }
  }
  putLiveData(data) { 
    for (let i in data) {
      let cell = data[i];
      this.putFrameAt(parseInt(cell.x), parseInt(cell.y), parseInt(cell.frame));
    }
  }
}
