import scenes from "./scenes.js";

/// ...  https://www.youtube.com/watch?v=2MwwHmnhPAk
export default function createPhaserGame(parent, implementations) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 1440,
    transparent: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
    },
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },

    scene: scenes,
    version: "1.0.0",
  });

  return {
    game,
    destroy: () => {
      game.destroy(true);
    },
  };
}

createPhaserGame(document.getElementById("game"), {});
