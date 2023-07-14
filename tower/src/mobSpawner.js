import Main from "../scenes/main.js";
import { COLORS, GRIDSIZE } from "./constants.js";
import Cursor from "./cursor.js";
import PoolAliveManager from "./poolAliveManager.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
import TickManager from "./tickManager.js";
const poolManager = new PoolAliveManager();
export default class MobSpawner extends Phaser.GameObjects.Container {
  internalTick = 0;
  ___triggered = false;
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.circle(0, 0, 16, COLORS.red),
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.squares.thin1)
        .setOrigin(0.5),
      scene.add
        .image(0, 0, RESOURCES.name, RESOURCES.frames.skull)
        .setOrigin(0.5),
      scene.add.circle(8, -6, 6, COLORS.black),
      scene.add
        .bitmapText(6, -10, "font1", 0, 8)
        .setTint(COLORS.white)
        .setDropShadow(1, 1)
        .setOrigin(0),
    ]);

    this.setSize(16, 16);
    this.setInteractive();
    this.on("pointerdown", () => {
      this.triggerSpawn();
    });
    this.on("pointerover", () => {
      Cursor.setToolTip(["CALL ENEMYS", "TOTAL ENEMYS: " + this.total]);
    });
    this.on("pointerout", () => {
      Cursor.hideToolTip();
    });
    this.mobCountText = this.list[4];
    this.total = 1;
    scene.add.existing(this);
  }
  static create(scene, x, y, total = 1) {
    let spawner = poolManager.create(scene, MobSpawner);
    spawner.setVisible(true);
    spawner.setAlive(true);
    spawner.setPosition(x, y);
    spawner.setTotal(total);
    spawner.internalTick = 0;
    spawner.___triggered = false;
    return spawner;
  }
  addMore(n = 1) {
    this.setTotal(this.total + n);
  }
  tickToAddMore() {
    this.internalTick++;
    if (this.internalTick < 10) {
      return;
    }
    this.internalTick = 0;
    this.addMore(1);
    if (this.total > 30) {
      this.triggerSpawn();
    }
  }
  setTotal(n) {
    this.total = n;
    this.mobCountText.setText(this.total);
  }
  triggerSpawn() {
    if (this.___triggered) {
      return;
    }
    this.___triggered = true;
    let count = this.total + 0;
    const spawn = () => {
      let x = this.x + random(-1, 1) * GRIDSIZE,
        y = this.y + random(-1, 1) * GRIDSIZE;
      count--;
      this.mobCountText.setText(count);
      Main.spawnMob(x, y);
      if (count < 1) {
        this.kill();
        unbindTick();
      }
    };
    let unbindTick = TickManager.onTick(() => {
      spawn();
    });
    spawn();
  }
  kill() {
    this.setAlive(false);
    this.setVisible(false);
  }
}
