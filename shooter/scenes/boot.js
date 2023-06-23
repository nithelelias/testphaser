import { initDataStore } from "../src/context/data.js";
import generateCircleTexture from "../src/generateCircleTexture.js";
import generateRectTextures from "../src/generateRectTextures.js";
import RESOURCES from "../src/resources.js";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: "boot", active: true });
  }
  preload() {
    generateCircleTexture(this);
    generateRectTextures(this);
    this.load.spritesheet(RESOURCES.name, "./assets/maptile.png", {
      frameWidth: RESOURCES.tilesize,
      frameHeight: RESOURCES.tilesize,
    });
  }
  create() {
    initDataStore(this.game)
    this.game.events.emit("game-ready");
    this.scene.start("main");
  }
}
