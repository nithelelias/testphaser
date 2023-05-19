import LayerGrid from "../src/layerGrid.js";
import LayerMap from "../src/layerMap.js";
import { addHouse } from "../src/world.js";
var currentInstance;
export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    currentInstance = this;
    window.main = this;
  }
  static current() {
    return currentInstance;
  }
  preload() {
    this.load.spritesheet("world", "./tilemap.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }
  create() {
    
    this.gridlayer = new LayerGrid(this, 0, 0);
    this.world = new LayerMap(this);

     addHouse()
  }
}
