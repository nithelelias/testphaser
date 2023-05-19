import Main from "./scenes/main.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [Main],
  scale: {
    mode: Phaser.Scale.RESIZE,
    
  },
});
