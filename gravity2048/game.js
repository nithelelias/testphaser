import { COLORS } from "./constants.js";
import Boot from "./scenes/boot.js";
import Main from "./scenes/main.js";
import Test from "./scenes/test.js";

const config = {
  type: Phaser.AUTO,
  width: 460,
  height: 720,
  backgroundColor: COLORS.primary,
  parent: "gameWrapper",

  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [Boot, Main, Test],
};

const game = new Phaser.Game(config);
