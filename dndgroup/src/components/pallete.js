import RESOURCES from "../constants/resources.js";
import { GRID } from "../constants/values.js";
import WorldLayer from "./WorldLayer.js";

const padding = 32;
const fsize = 32;
class Panel extends Phaser.GameObjects.Container {
  constructor(scene, { frameClick }) {
    super(scene, 0, 0, [
      scene.add.image(0, 0, "rect").setOrigin(0).setTintFill(0x111111),
      new WorldLayer(scene, 32),
    ]);
    scene.add.existing(this);
    this.background = this.list[0];
    this.layer = this.list[1];

    this.setDepth(100);
    this.setScrollFactor(0);
    /**
     *  FILL PALLETE
     */
    const texture = scene.textures.get(RESOURCES.name).source[0];

    const w = texture.width,
      h = texture.height,
      cols = parseInt(w / RESOURCES.tilesize),
      rows = parseInt(h / RESOURCES.tilesize);

    let frame = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let img = this.layer.putFrameAt(col, row, frame);
        img.setAlpha(0.6);
        img.setInteractive();

        img.on("pointerdown", () => {
          frameClick && frameClick(img.frame.name);
        });
        img.on("pointerover", () => {
          img.setAlpha(1);
          img.once("pointerout", () => {
            img.setAlpha(0.6);
          });
        });
        frame++;
      }
    }

    this.full = {
      w: cols * fsize,
      h: rows * fsize,
    };
    this.layer.y = this.layer.x = parseInt(fsize / 2);

    this.setSize(w, h);
    this.center();
  }

  close() {
    this.setVisible(false);
  }
  show() {
    this.setVisible(true);
    this.center();
  }
  toggle() {
    if (this.visible) {
      this.close();
    } else {
      this.show();
    }
  }
  center() {
    this.background.setDisplaySize(
      this.full.w + padding,
      this.full.h + padding
    );
    let scaleRatio =
      parseFloat(
        Math.min(
          (this.scene.scale.width - padding) / this.full.w,
          (this.scene.scale.height - padding) / this.full.h
        ).toFixed(2)
      ) - 0.1;

    this.setScale(scaleRatio);

    this.x = parseInt(
      this.scene.scale.width - this.full.w * scaleRatio - padding / 2 - 60
    );
    this.y = parseInt(
      this.scene.scale.height - this.full.h * scaleRatio - padding / 2 - 90
    );
  }
  resize() {
    this.center();
  }
}

export default class Pallete extends Phaser.GameObjects.Container {
  constructor(scene, { onFrameSelected }) {
    super(scene, scene.scale.width - 72, scene.scale.height - 72, [
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0.5)
        .setTintFill(0x111)
        .setDisplaySize(72, 72),
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0.5)
        .setTintFill(0xf1f1f1)
        .setDisplaySize(64, 64),
      scene.add
        .image(0, 0, RESOURCES.name, 0)
        .setOrigin(0.5)
        .setDisplaySize(64, 64),
    ]);
    this.spriteFrame = this.list[2];
    this.panel = new Panel(scene, {
      frameClick: (_frame) => {
        onFrameSelected && onFrameSelected(_frame);
        this.spriteFrame.setFrame(_frame);
        setTimeout(() => {
          this.panel.close();
        }, 100);
      },
    });
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(100);
    this.panel.close();
    this.setSize(80, 80);
    this.setInteractive();
    this.on("pointerdown", () => {
      this.panel.toggle();
    });
    addEventListener("resize", (event) => {
      this.setPosition(scene.scale.width - 84, scene.scale.height - 84);
      this.panel.resize();
    });
  }
  isOpen() {
    return this.panel.visible;
  }
}
