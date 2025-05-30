import Button from "../src/components/button.js";
import { saveToLocal } from "../src/components/localStore.js";
import RESOURCES from "../src/constants/resources.js";
import { COLORS, GRID } from "../src/constants/values.js";
export default class SceneHud extends Phaser.Scene {
  mainScene;
  constructor() {
    super("hub");
  }
  create({ main }) {
    this.mainScene = main;
    this.createZoomControl();
    /* this.createMouseCursor(); */
    this.createCenterButton();
  }
  createZoomControl() {
    const rec = this.add.rectangle(0, 0, 200, 30, COLORS.color1).setOrigin(0.5);

    const zoomTextCaption = this.add
      .bitmapText(0, 0, "font1", "Hello World", 16)
      .setOrigin(0, 0.5)
      .setTint(COLORS.color2);

    this.add
      .container(10, this.scale.height - 16, [rec, zoomTextCaption])
      .setScrollFactor(0);

    this.events.on("update", () => {
      const main = this.mainScene;
      zoomTextCaption.setText(`Zoom: ${main.cameras.main.zoom.toFixed(1)}`);
    });
  }
  createMouseCursor() {
    const cursor = this.add
      .image(0, 0, RESOURCES.name, RESOURCES.frames.cursor)
      .setDepth(100)
      .setTint(COLORS.color1);
    cursor.setScale(GRID.size / cursor.width);
    this.input.on("pointermove", (pointer) => {
      cursor.setPosition(pointer.worldX, pointer.worldY);
    });
  }
  createCenterButton() {
    const container = this.add.container(
      this.scale.width / 2,
      this.scale.height - 20,
      []
    );
    const btnCenter = new Button(this, 0, 0, "centrar", () => {
      const main = this.mainScene;
      main.centerOnGrid();
    });
    const btnSave = new Button(this, 0, 0, "Guardar", () => {
      saveToLocal()
    });
    const buttons = [btnCenter, btnSave];
    container.add(buttons);
    buttons.forEach((btn, i) => {
      btn.x = i * (btn.width + 10);
    });
  }
}
