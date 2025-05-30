 import RESOURCES from "../src/constants/resources.js";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: "boot", active: true });
  }
  preload() {
    this.load.spritesheet(RESOURCES.name, "./assets/maptile.png", {
      frameWidth: RESOURCES.tilesize,
      frameHeight: RESOURCES.tilesize,
    });
    this.load.bitmapFont(
      "font1",
      "assets/fonts/gem.png",
      "assets/fonts/gem.xml"
    );
  }
  create() { 
    this.game.events.emit("game-ready");
    this.scene.start("main");
  }
}
