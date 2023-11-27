import Main from "./scenes/main.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: document.querySelector("#game"),
  pixelArt: true,
  width: 320,
  height: 680,
  scene: [Main],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
  },
});
window.game = game;