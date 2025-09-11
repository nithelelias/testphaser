import { deferred } from "../utils/defered.js";

export default class ThrowDice extends Phaser.GameObjects.Container {
  allowDragging = false;
  constructor(scene) {
    super(scene, 0, 0);

    this.dice = new Dice(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.add(this.dice);
    scene.add.existing(this);

    this.dice.setInteractive({ draggable: true });
    this.scene.input.setDraggable(this.dice);
    const holder = {
      start: { x: 0, y: 0 },
      startTime: 0,
    };
    this.scene.input.on("dragstart", (pointer, gameObject, dragX, dragY) => {
      this.dice.setScale(1.4);
    });
    this.scene.input.on("dragend", (pointer, gameObject, dragX, dragY) => {
      this.dice.setScale(1);

      this.dice.throw();
    });
    this.scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.dice && this.allowDragging && this.visible) {
        this.dice.x = dragX;
        this.dice.y = dragY;
      }
    });
  }
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
  show() {
    this.setVisible(true);
    this.allowDragging = true;
  }
  hide() {
    this.setVisible(false);

    this.allowDragging = true;
  }
}

class Dice extends Phaser.GameObjects.Container {
  min = 1;
  max = 20;
  constructor(scene, x, y) {
    super(scene, x, y);

    /* this.background = scene.add.container(0, 0, [
      scene.add.rectangle(0, 0, 100, 100, 0xf1f1f1, 1).setAngle(45),
      scene.add.rectangle(0, 0, 100, 100, 0xf1f1f1, 1),
    ]); */
    this.background = scene.add.image(0, 0, "dice20");
    this.background.setScale(100 / this.background.width);
    this.add(this.background);
    this.setSize(this.background.displayWidth, this.background.displayHeight);
    this.numberText = scene.add.text(0, 0, "1", {
      color: "#111",
      fontSize: 32,
    });
    this.numberText.setOrigin(0.5);
    this.add(this.numberText);
  }

  throw() {
    const defered = deferred();
    const scene = this.scene;
    scene.sound.play("sfx-dice");

    let rndNumber = -1;
    const roll = () => {
      rndNumber = Phaser.Math.Between(this.min, this.max);
      this.numberText.setText(rndNumber + "");
    };
    const boundaries = {
      xmin: 0,
      xmax: scene.scale.width,
      ymin: 0,
      ymax: scene.scale.height,
    };
    const sides = [
      {
        x: [boundaries.xmin, boundaries.xmin],
        y: [boundaries.ymin, boundaries.ymax],
      },
      {
        x: [boundaries.xmax, boundaries.xmax],
        y: [boundaries.ymin, boundaries.ymax],
      },
      {
        x: [boundaries.xmin, boundaries.xmax],
        y: [boundaries.ymin, boundaries.ymin],
      },
      {
        x: [boundaries.xmin, boundaries.xmax],
        y: [boundaries.ymax, boundaries.ymax],
      },
    ];
    const ricochets = Phaser.Math.Between(2, 3);
    const ricochetPoints = [];
    const idxSides = sides.map((_, idx) => idx);
    let lastIdx = -1;
    const getNewSideIdx = () => {
      const avaibleIdx = idxSides.filter((_idx) => _idx !== lastIdx);
      const idx = Phaser.Math.Between(0, avaibleIdx.length - 1);
      return avaibleIdx[idx];
    };
    for (let i = 0; i < ricochets; i++) {
      const idx = getNewSideIdx();
      const side = sides[idx];
      lastIdx = idx;
      ricochetPoints.push({
        x: Phaser.Math.Between(side.x[0], side.x[1]),
        y: Phaser.Math.Between(side.y[0], side.y[1]),
      });
    }
    const bounce = () => {
      if (ricochetPoints.length < 1) return Promise.resolve();
      const { x, y } = ricochetPoints.shift();
      let iteration = 0;
      return new Promise((resolve) => {
        scene.tweens.add({
          targets: this,
          x,
          y,
          rotation: Phaser.Math.Between(-360, 360) * Phaser.Math.Between(3, 15),
          duration: Phaser.Math.Between(200, 500),
          onUpdate: () => {
            iteration++;
            if (iteration % 10 === 0) roll();
          },
          onComplete: () => {
            resolve(rndNumber);
          },
        });
      });
    };
    const run = async () => {
      while (ricochetPoints.length > 0) {
        await bounce();
      }
      let iteration = 0;
      return new Promise(() => {
        scene.tweens.chain({
          targets: this,
          tweens: [
            {
              x: scene.scale.width / 2,
              y: scene.scale.height / 2,
              rotation:
                Phaser.Math.Between(-360, 360) * Phaser.Math.Between(3, 15),
              duration: 600,
              onUpdate: () => {
                iteration++;
                if (iteration % 10 === 0) roll();
              },
              onComplete: () => {
                scene.sound.play("sfx-pop");
              },
            },
            {
              rotation: 0,
              scale: 2,
              duration: 200,
            },
            {
              rotation: 0,
              scale: 1,
              duration: 300,
            },
          ],
        });
      });
    };
    run().then(() => {
      defered.resolve(rndNumber);
    });

    return defered.promise;
  }
}
