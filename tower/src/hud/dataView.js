import { COLORS } from "../constants.js";
import { getMaxData } from "../context/data.js";
import RESOURCES from "../resources.js";

export default class DataView extends Phaser.GameObjects.Container {
  constructor(scene, x, y, icon = 0, dataStore) {
    super(scene, x, y, [
      scene.add
        .rectangle(0, 0, 64, 32, COLORS.UI_BACKGROUND1, 0.5)
        .setOrigin(0),
      scene.add
        .image(16, 16, RESOURCES.name, icon)
        .setOrigin(0.5)
        .setDisplaySize(32, 32),
    ]);
    scene.add.existing(this);
    this.text = scene.add
      .bitmapText(32, 8, "font1", "", 16)
      .setTint(COLORS.white)
      .setDropShadow(1, 1)
      .setOrigin(0);
    this.add(this.text);

    this.updateValue = () => {
      let newnum = dataStore.get().toString().padStart(2, "0");
      let max = getMaxData(dataStore.datakey);
      this.text.setText(`x${newnum}${max === 999 ? "" : "/" + max}`);
      this.list[0].setSize(this.text.width + this.list[1].displayWidth + 4, 32);
      this.setSize(this.list[0].width, this.list[0].height);
    };
    dataStore.onChange((gold) => {
      this.updateValue();
    });
    this.updateValue();
  }
}
