import Cursor from "../src/cursor.js";
import Interactions from "../src/interactions.js";
import JsonPacked from "../src/jsonPack.js";
import Layer from "../src/layer.js";
import getTileSize from "../src/getTileSize.js";
import Pallete from "../src/pallete.js";
import generateRectTextures from "../src/generateTextures.js";
import panZone from "../src/panZone.js";
import { getWorld } from "../srvice.js";
import MenuSync from "../src/menuSync.js";
import store from "../src/store.js";
import live from "../src/live.js";
import PositionLabel from "../src/positionlabel.js";
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
    //putFrameAtCell(x, y, frame);
    store.save({ x, y, frame });
  }
  create() {
    getWorld().then((response) => {
      this.initWorld();
      try {
        let json = JSON.parse(response);
        if (json.data) {
          this.world.putLiveData(json.data);
        }
        live.start();
      } catch (e) {
        console.error(e);
      }
    });
  }
  initWorld() {
    this.world = new Layer(this);
    this.cursor = new Cursor(this);
    this.menuSync = new MenuSync(this);
    this.positionLabel = new PositionLabel(this);
    this.pallete = new Pallete(this, {
      onFrameSelected: (frame) => {
        this.cursor.startDrawFrame(frame);
      },
    });
    panZone.call(this, {
      movePan: (dirPan) => {
        const tileSize = getTileSize();
        console.log(dirPan);

        this.world.setPosition(
          this.world.x - dirPan[0] * tileSize,
          this.world.y - dirPan[1] * tileSize
        );
        this.positionLabel.setCoords(this.world);
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
