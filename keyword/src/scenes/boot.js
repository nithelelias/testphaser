import { FONTS } from "../constants/values.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }
  preload() {
    this.load.setPath("./resources/");
    this.load.script("webfont", "webfont.js");

    ["key-down.mp3", "key-down-2.mp3", "melody.mp3"].forEach((filepath) => {
      const name = filepath.split(".")[0];
      this.load.audio(name, filepath);
    });
  }
  create() {
    window.WebFont.load({
      google: {
        families: [FONTS.font1],
      },
      active: () => {
        this.sound.play("melody", { loop: true, volume: 0.3 });
        this.scene.start("main");
      },
    });
  }
}
