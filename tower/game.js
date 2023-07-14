import Boot from "./scenes/boot.js";
import Hud from "./scenes/hud.js";
import Main from "./scenes/main.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  parent: document.getElementById("canvasWrapper"),
  width: 720,
  height: 480,
  scene: [Boot,Main,Hud],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      tileBias: 16,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
});
