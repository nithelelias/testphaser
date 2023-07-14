import BulletView from "../src/hud/BulletView.js";
import GoldView from "../src/hud/goldView.js";
import KeyView from "../src/hud/keyView.js";

export default class Hud extends Phaser.Scene {
  constructor() {
    super({ key: "HUD", active: true });
    window.hud = this;
  }

  create() {
    /// keys
    this.game.events.on("game-ready", () => {
      this.onGameReady();
    });
  }
  onGameReady() {
    this.keysView = new KeyView(this,16,16);
    this.bulletView=new BulletView(this,96,16)
    this.goldView=new GoldView(this,192,16)
  }
}
