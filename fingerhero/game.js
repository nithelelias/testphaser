import { COLORS } from "./constants.js";
import Main from "./scene/main.js";
let parent = document.querySelector("#gameWrapper");
parent.style.backgroundColor = COLORS.secundary;
const config = {
  type: Phaser.AUTO,
  width: 512,
  height: window.innerHeight,
  backgroundColor: COLORS.primary,
  parent: parent,
  pixelArt:true,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [Main],
};

const game = new Phaser.Game(config);
