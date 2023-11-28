import { COLORS } from "./constants.js";
import Boot from "./scenes/boot.js";
import Main from "./scenes/main.js";
import Test from "./scenes/test.js";
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
  scene: [Boot, Main, Test],
};

const game = new Phaser.Game(config);
