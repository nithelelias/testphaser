import RESOURCES from "../constants/resources.js";
export default class WorldLayer extends Phaser.GameObjects.Container {
  gridSize = 16;
  constructor(scene, gridSize = 16) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    this.gridSize = gridSize;
    this.dic = {};
  }
  addImg(col, row, _frame) {
    const img = this.scene.add
      .image(col * this.gridSize, row * this.gridSize, RESOURCES.name, _frame)
      .setOrigin(0);
    img.setDisplaySize(this.gridSize, this.gridSize);
    this.add(img);
    return img;
  }
  putFrameAt(col, row, frame) {
    let key = col + "_" + row;
    if (this.dic.hasOwnProperty(key)) {
      this.dic[key].setFrame(frame);
    } else {
      this.dic[key] = this.addImg(col, row, frame);
    }
    return this.dic[key];
  }
  removeFrameAt(col, row) {
    let key = col + "_" + row;
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
}
