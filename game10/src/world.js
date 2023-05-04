import getTileSize from "./getTileSize.js";
var currentInstance = null;
export default class World {
  constructor(scene) {
    currentInstance = this;
    this.group = scene.add.group({});
    this.scene = scene;
    this.dic = {};
    this.addImg = (_x, _y, _frame) => {
      return scene.add.image(_x, _y, "world", _frame);
    };
  }

  putFrameAt(x, y, frame) {
    this.removeFrameAt(x, y);
    let size = getTileSize();
    this.dic[x + "_" + y] = this.addImg(x, y, frame).setDisplaySize(size, size);
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
  static putLiveData(data) {
    currentInstance.clearWorld();
    for (let i in data) {
      let cell = data[i];
      currentInstance.putFrameAt(
        parseInt(cell.x),
        parseInt(cell.y),
        parseInt(cell.frame)
      );
    }
  }
}
