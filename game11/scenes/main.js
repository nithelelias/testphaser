import Cursor from "../src/cursor.js";
import Interactions from "../src/interactions.js";
import JsonPacked from "../src/jsonPack.js";
import Layer from "../src/layer.js";
import generateRectTextures from "../src/generateTextures.js";
import Pallete from "../src/pallete.js";
import ActionMenu from "../src/actionMenu.js";
import InformationBar from "../src/informationBar.js";
var currentInstance = null;
export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    currentInstance = this;
    window.main = this;
  }
  preload() {
    this.load.atlas("world", "./tilemap.png", JsonPacked(16, [784, 352]));
    generateRectTextures(this);
  }
  updateCell(x, y, frame) {
    this.world.putFrameAt(x, y, frame);
  }
  create() {
    this.initWorld();
  }
  initWorld() {
    this.world = new Layer(this);
    this.cursor = new Cursor(this);
    this.actionMenu=new ActionMenu(this)
    this.informationBar=new InformationBar(this)
    this.pallete = new Pallete(this, {
      onFrameSelected: (frame) => {
        this.cursor.startDrawFrame(frame);
      },
    });
    this.__initWorldInteractions();
  }
  static getWorld() {
    return currentInstance.world;
  }
  __initWorldInteractions() {
    Interactions(this, {
      putFrameAt: (coords) => {
        if (this.pallete.isOpen()) {
          return;
        }
        if (this.cursor.drawFrame) {
          this.updateCell(
            coords.x - this.world.x,
            coords.y - this.world.y,
            this.cursor.drawFrame
          );
        }
      },
      onpointermove: (_pointer) => {
        this.cursor.x = _pointer.x;
        this.cursor.y = _pointer.y;
      },
    });
  }
}
