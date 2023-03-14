import { Intro } from "./src/scenes/intro.js";
import Main from "./src/scenes/main.js";

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  canvas: document.querySelector(".game__canvas"),
  width: 360,
  height: 740,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [ Intro,Main],
  // --  doesnt work...initialScene: "main",
};

const game = new Phaser.Game(config);
