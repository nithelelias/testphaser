import Sleep from "./actions/sleep.js";
import STATE from "./state.js";
import { tweenOnPromise, waitTimeout } from "./utils.js";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, room) {
    super(scene, x, y, "player", 1);
    this.setDisplaySize(128, 128);
    this.__higing = false;
    this.__hinge_dir = false;
    this.__sleeping = false;
    this.__onkitchen = false;
    this.__fainted = false;
    this.room = room;
  }
  onAct(_callback) {
    this.__onAct = _callback;
    return () => {
      this.__onAct = null;
    };
  }
  onFaint(_callback) {
    this.__onFaint_callback = _callback;
    return () => {
      this.__onFaint_callback = null;
    };
  }
  isFainted() {
    return this.__fainted;
  }
  isBusy() {
    return this.__sleeping || this.__fainted || this.__onkitchen;
  }
  async hinge() {
    if (this.__higing) {
      return;
    }
    this.__higing = true;
    if (!this.__hinge_dir) {
      this.__hinge_dir = 1;
    }

    this.setAngle(0);
    await tweenOnPromise(this.scene, {
      targets: this,
      angle: 12 * this.__hinge_dir,
      y: "-=5",
      yoyo: true,
      duration: 100,
    });
    this.__higing = false;
    this.__hinge_dir *= -1;
  }
  async goToBed() {
    if (this.__sleeping) {
      return;
    }
    this.__sleeping = true;

    this.setFrame(2);
    this.setFlipX(true);
    await tweenOnPromise(this.scene, {
      targets: this.room,
      x: "-=200",
      duration: 2200,
      onUpdate: () => {
        this.hinge();
      },
    });
    await Sleep(this.scene);
    this.setFlipX(false);
    await tweenOnPromise(this.scene, {
      targets: this.room,
      x: "+=200",
      duration: 2200,
      onUpdate: () => {
        this.hinge();
      },
    });
    this.setFrame(1);
    this.__sleeping = false;
  }
  async goToKitchen() {
    if (this.__onkitchen) {
      return;
    }
    this.__onkitchen = true;
    this.setFrame(2);
    await tweenOnPromise(this.scene, {
      targets: this.room,
      x: "+=332",
      duration: 3200,
      onUpdate: () => {
        this.hinge();
      },
    });
    this.setFrame(1);
  }
  async goToPcFromKitchen() {
    if (!this.__onkitchen) {
      return;
    }
    this.__onkitchen = false;
    this.setFrame(2);
    this.setFlipX(true);
    await tweenOnPromise(this.scene, {
      targets: this.room,
      x: "-=332",
      duration: 3200,
      onUpdate: () => {
        this.hinge();
      },
    });
    this.setFrame(1);
    this.setFlipX(false);
  }
  async faint() {
    if (this.__fainted) {
      return;
    }
    this.__fainted = true;
    this.__onFaint_callback && this.__onFaint_callback();
    this.scene.cameras.main.flash(100);
    await waitTimeout(100);
    this.scene.cameras.main.flash(100);
    tweenOnPromise(this.scene, {
      targets: this,
      angle: 90,
      y: "+=20",
      duration: 100,
    });
    this.scene.sounds.tap.play();
    this.scene.cameras.main.flash(100);
    await waitTimeout(100);
    this.scene.cameras.main.flash(1000);
    await waitTimeout(1000);

    await this.scene.printMessage([
      "Te pasaste!",
      "tu salud ha empeorado debes recuperarte...",
    ]);

    this.scene.cameras.main.fade(1000);
    await waitTimeout(1000);
    this.setAngle(0);
    this.y -= 20;
    let promiseBed = this.goToBed();
    await waitTimeout(2300);
    this.scene.cameras.main.fadeIn(1000);
    await waitTimeout(1000);

    await promiseBed;
    this.__fainted = false;
  }
  getState() {
    return STATE;
  }
}
