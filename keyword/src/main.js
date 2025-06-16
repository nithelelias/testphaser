import scenes from "./scenes.js";

function initGame() {
  const r = 3;
  const config = {
    type: Phaser.AUTO,
    width: 640 * r,
    height: 360 * r,
    parent: "app",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: scenes,
  };

  new Phaser.Game(config);
}

initGame();
