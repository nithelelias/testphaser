import ElementsFrames from "./elementsFrames.js";
import getTotalHouses from "./getTotalHouses.js";
import STATE from "./state.js";
const fontSize = 24;
class InformationPiece extends Phaser.GameObjects.Container {
  constructor(scene, x, y, icon, text, value = 0) {
    super(scene, x, y, [
      scene.add.image(0, 0, "rect").setOrigin(0).setTintFill(0xffffff),
      scene.add.image(0, 0, "rect").setOrigin(0).setTintFill(0x111),
      scene.add.container(0, 0, [
        scene.add
          .image(0, 0, "world", icon)
          .setOrigin(0)
          .setDisplaySize(fontSize, fontSize),
        scene.add.text(0, 0, text + ":", { fontSize }).setOrigin(0),
        scene.add.text(0, 0, value, { fontSize }).setOrigin(0),
      ]),
    ]);
    this.container = this.list[2];
    this.image = this.container.list[0];
    this.text = this.container.list[1];
    this.value = this.container.list[2];
    this.fit();
  }
  fit() {
    let last,
      margin = parseInt(fontSize / 2);
    this.container.list.forEach((elem) => {
      if (last) {
        elem.x = last.x + last.width + margin;
      }
      last = elem;
    });
    // size
    let width = last.x + last.width + margin,
      height = fontSize + 4,
      gap = 4;
    this.list[0].setDisplaySize(width + gap, height + gap);
    this.list[1].setDisplaySize(width, height);
    this.list[2].setPosition(gap / 2, gap / 2);
    this.list[1].setPosition(gap / 2, gap / 2);
    this.setSize(width + gap, height + gap);
  }
}
export default class InformationBar extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.image(0, 0, "rect").setOrigin(0).setTintFill(0x111),
      scene.add.container(4, 4, [
        new InformationPiece(
          scene,
          0,
          0,
          ElementsFrames.coin,
          "Gold",
          STATE.gold
        ),
      ]),
    ]);
    scene.add.existing(this);
    this.background = this.list[0];
    this.itemsContainer = this.list[1];
    this.fit();
    this.center();
    addEventListener("resize", (event) => {
      this.center();
    });
  }
  fit() {
    let margin = 8;
    let last;
    this.itemsContainer.list.forEach((elem, idx) => {
      if (idx > 0) {
        elem.x = last.x + last.width + margin;
      }
      last = elem;
    });
    this.background.setDisplaySize(
      last.x + last.width + margin,
      fontSize * 1.6
    );
    this.setSize(this.background.displayWidth, this.background.displayHeight);
  }
  center() {
    this.setPosition(parseInt(this.scene.scale.width / 2 - this.width / 2), 16);
  }
}
