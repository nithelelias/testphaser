import STATE from "../state.js";
import { generateRectTexture } from "./ui.js";

export function MoneyPanel(scene, x, y) {
  generateRectTexture(scene);
  const panelBG = scene.add
    .image(0, 0, "rect")
    .setOrigin(0)
    .setTintFill(0xf1f1f1)
    .setDisplaySize(120, 32);

  const text = scene.add
    .bitmapText(0, 1, "font1", ["$"], 30)
    .setTint(0x11af11)
    .setDropShadow(0, 2, 0x000000, 1)
    .setOrigin(0);
  const container = scene.add.container(x, y, [panelBG, text]);

  this.update = () => {
    text.setText("$" + STATE.MONEY);
  };
  this.getContainer = () => {
    return container;
  };
  this.destroy = () => {
    panelBG.destroy();
    text.destroy();
    container.destroy();
  };

  this.update();
}
