import Main from "./scenes/main.js";
import resizeCanvas from "./src/resizeCanvas.js";

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x111111,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  scene: [Main],
  // --  doesnt work...initialScene: "main",
};

const game = new Phaser.Game(config);
resizeCanvas(game);
