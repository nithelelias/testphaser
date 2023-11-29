import { COLORS } from "./constants.js";
import Main from "./scene/main.js";
let parent = document.querySelector("#gameWrapper");
parent.style.backgroundColor = COLORS.secundary;
const config = {
  type: Phaser.AUTO,
  width: 460,
  height: window.innerHeight,
  backgroundColor: COLORS.primary,
  parent: parent,

  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [Main],
};

const game = new Phaser.Game(config);
