import store from "./store.js";

class MenuSyncButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, frameIcon) {
    super(scene, x, y, [
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
        .sprite(0, 0, "world", frameIcon)
        .setOrigin(0.5)
        .setDisplaySize(64, 64),
    ]);
    this.sprite = this.list[2];
    this.__onClick = () => {};
    this.setSize(64, 64);
    this.setInteractive();
    this.on("pointerdown", () => {
      this.__onClick();
    });
  }
  onClick(_callback) {
    this.__onClick = _callback;
    return this;
  }
}
export default class MenuSync extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, scene.scale.width - 72, 72, [
      new MenuSyncButton(scene, 0, 0, 827).onClick(() => {
        this.startSync();
      }),
    ]);
    scene.anims.create({
      key: "button-wait",
      frames: scene.anims.generateFrameNames("world", {
        start: 629,
        end: 631,
      }),
      framerate: 1,
      repeat: -1,
      duration: 1000,
    });
    scene.add.existing(this);
    this.busy = false;
    addEventListener("resize", (event) => {
      this.setPosition(scene.scale.width - 72, 72);
    });
  }
  async startSync() {
    if (store.isBusy()) {
      return;
    }

    console.log("start sync");
    this.list[0].sprite.setFrame(629);
    this.list[0].sprite.play("button-wait");
    let success = await store.sync();
    console.log("sync:", success ? "success" : "fail");
    setTimeout(() => {
      this.list[0].sprite.stop();
      this.list[0].sprite.setFrame(827);
    }, 100);
  }
}
