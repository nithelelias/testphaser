import LookingJobState from "../states/lookingJob.js";
import { ProgressBar } from "../ui.js";
import { random, tweenOnPromise } from "../utils.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.$main = this;
  }
  preload() {
    this.load.bitmapFont(
      "font1",
      "assets/fonts/gem.png",
      "assets/fonts/gem.xml"
    );
    this.load.spritesheet("computer", "assets/images/pc.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("player", "assets/images/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.audio("step", "./assets/audio/step.mp3");
    this.load.audio("typing", "./assets/audio/typing.mp3");
  }
  create() {
    var w = this.game.scale.width;
    var h = this.game.scale.height;
    this.initSounds();
    this.pc = this.add
      .image(w / 2, h / 2, "computer", 1)
      .setDisplaySize(102, 102);
    this.player = this.add
      .sprite(w / 2, h / 2 + 20, "player", 1)
      .setDisplaySize(128, 128);
    this.player.hinge = async () => {
      if (this.player.higing) {
        return;
      }
      this.player.higing = true;
      if (!this.player.hinge_dir) {
        this.player.hinge_dir = 1;
      }

      this.player.setAngle(0);
      await tweenOnPromise(this, {
        targets: this.player,
        angle: 12 * this.player.hinge_dir,
        y: "-=5",
        yoyo: true,
        duration: 100,
      });
      this.player.higing = false;
      this.player.hinge_dir *= -1;
    };
    this.initTouchKey();
    var todo = this.add
      .bitmapText(
        w / 2,
        h,
        "font1",
        [
          "* crear barra de vida",
          "* crear barra del dia",
          "* Buscar empleo ",
          "* pasar entrevista ",
          "* terminar el trabajo antes del tiempo limite",
          "* hacer compras comida",
          "* cocinar",
          "* dormir",
          "* estudiar",
        ],
        16
      )
      .setOrigin(0.5, 1);

    this.initBars();
    this.updateState();
  }
  initSounds() {
    this.sounds = {
      step: this.sound.add("step", { loop: false, volume: 0.2, rate: 2 }),
      step2: this.sound.add("step", { loop: false, volume: 0.1 }),
      typing: this.sound.add("typing", { loop: false, volume: 0.1 }),
    };

    this.sounds.typing.addMarker({ name: "key1", start: 2.3, duration: 0.2 });
    this.sounds.typing.addMarker({ name: "key2", start: 2.5, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key3", start: 2.6, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key4", start: 2.7, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key5", start: 2.8, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key6", start: 2.9, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key7", start: 3.0, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key8", start: 3.1, duration: 0.1 });
    this.sounds.typing.addMarker({ name: "key9", start: 3.2, duration: 0.1 });
  }

  initTouchKey() {
    let onPointerDown = () => {
      // SPEED UP
      this.input.once(
        "pointerup",
        () => {
          // SPEED DOWN
          this.sounds.typing.play("key" + random(1, 9));
          this.player.hinge();
        },
        true
      );
    };

    this.input.on("pointerdown", onPointerDown, true);
  }
  initBars() {
    var titleBar = this.add
      .bitmapText(this.scale.width / 2, 30, "font1", ["VIDA 100%"], 16)
      .setOrigin(0.5);
    this.lifeBar = ProgressBar(
      this,
      10,
      titleBar.y + titleBar.height + 5,
      this.scale.width - 20,
      12,
      {
        color: 0xff0000,
      }
    );
    this.lifeBar.setValue(100);
  }
  updateState() {
    LookingJobState(this).then(() => {
      console.log("DAY END!");
    });
  }
}
