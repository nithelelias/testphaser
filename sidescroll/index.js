import Intro from "./scenes/intro.js";
import LockToPortrait from "./scenes/locktoportrait.js";
import Main from "./scenes/main.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  width: 720,
  height: 320,
  scene: [Intro, Main, LockToPortrait],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
});
window.game = game;
