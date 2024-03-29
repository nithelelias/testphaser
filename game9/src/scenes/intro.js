import { COLORS } from "../constants.js";
import preload from "../preload.js";
import SOUNDS, { initSounds } from "../sounds.js";
import STATE from "../state.js";
import { generateRectTexture, HurryText } from "../ui/ui.js";
import { random, tweenOnPromise } from "../utils.js";

export class Intro extends Phaser.Scene {
  constructor() {
    super("intro");
    window.$intro = this;
  }
  preload() {
    preload.call(this);
  }
  create() {
    generateRectTexture(this);
    var w = this.game.scale.width;
    var h = this.game.scale.height;
    initSounds.call(this);
    this.sounds = SOUNDS;
    ///////
    var title = this.add
      .bitmapText(w / 2, 100, "font1", ["The", "Developer"], 64)
      .setOrigin(0.5);

    var text2Start = this.add
      .bitmapText(w / 2, h - 100, "font1", ["Click to start"], 32)
      .setOrigin(0.5);

    var text2StartTween = this.tweens.add({
      targets: text2Start,
      loop: -1,
      alpha: 0,
      yoyo: true,
    });

    this.pc = this.add
      .image(w / 2, h / 2, "computer", 1)
      .setDisplaySize(102, 102);
    this.player = this.add
      .sprite(w / 2, h / 2 + 500, "player", 1)
      .setDisplaySize(128, 128);
    this.input.once(
      "pointerdown",
      () => {
        text2StartTween.remove();
        text2Start.destroy();

        this.start(title);
      },
      this
    );
  }

  async start(title) {
    //

    this.tweens.add({
      targets: [title],
      alpha: 0,
      duration: 3000,
    });

    this.tweens.add({
      targets: this.pc,
      y: 100,
      duration: 3000,
    });
    if (STATE.num > 0) {
      this.goToMainScene();
    } else {
      this.playerWalkUp();
    }
  }

  playerWalkUp() {
    let timescale = 1;
    this.player.setAngle(-15);
    var hurryText = HurryText.call(
      this,
      this.game.scale.width / 2,
      this.game.scale.height / 2
    );
    hurryText.hide();
    hurryText.active = false;
    setTimeout(() => {
      hurryText.active = true;
    }, 3000);
    let hingeAnim = this.tweens.add({
      targets: this.player,
      angle: 15,
      loop: -1,
      yoyo: true,
      duration: 300,
      onYoyo: () => {
        this.sounds.step2.play();
      },
      onLoop: () => {
        this.sounds.step.play();
      },
    });
    let walkanim = this.tweens.add({
      targets: this.player,
      y: 120,
      delay: 1000,
      duration: 10000,
      onComplete: () => {
        hingeAnim.remove();
        this.tweens.add({
          targets: this.player,
          angle: 0,
          duration: 200,
          onComplete: () => {
            onPlayerWalkUpEnd();
          },
        });
      },
    });
    let overall = this.tweens.add({
      targets: {
        value: 0,
      },
      value: 1,
      duration: 200,
      loop: -1,
      onLoop: () => {
        if (timescale > 1) {
          timescale--;
        }
        if (hurryText.active) {
          hurryText[timescale < 3 ? "show" : "hide"]();
        }

        walkanim.timeScale = hingeAnim.timeScale = timescale;
      },
    });

    let onPointerDown = () => {
      // SPEED UP
      this.input.once(
        "pointerup",
        () => {
          // SPEED DOWN
          timescale++;
        },
        true
      );
    };
    const onPlayerWalkUpEnd = () => {
      overall.remove();
      hurryText.remove();
      this.input.removeListener("pointerdown", onPointerDown);
      this.playerTyping();
    };
    this.input.on("pointerdown", onPointerDown, true);
  }

  playerTyping() {
    let messageIndex = 0;
    let keyIndex = 0;

    let messageToPrint = [
      "Hola Mundo,",
      "",
      "Soy un DEVELOPER",
      "",
      "Administra mi tiempo",
      "Porque el dia no alcanza",
      "",
      "Si Trabajo y termino",
      "",
      "ENTONCES:",
      "Hay Paga!",
      "",
      "SINO:",
      "Hay Hambre!",
      "",
      "No se te olvide descanzar!",
      "Vamos a Ganar juntos!!",
    ];
    let currentPrintedMessage = [];
    let messageText = this.add
      .dynamicBitmapText(
        this.game.scale.width / 2,
        this.game.scale.height / 2,
        "font1",
        ["..."],
        16
      )
      .setOrigin(0.5)
      .setMaxWidth(this.game.scale.width * 0.8)
      .setDisplayCallback((data) => {
        //  data = { color, tint,index: index, charCode: charCode, x: x, y: y, scaleX: scaleX, scaleY: scaleY }
        data.color = 0xffffff;
        // DEVELOPER
        if (data.index > 19 && data.index < 29) {
          data.color = COLORS.yellow;
        }
        // TIEMPO
        if (data.index > 44 && data.index < 52) {
          data.color = COLORS.green;
        }
        // SI
        if (data.index > 77 && data.index < 80) {
          data.color = COLORS.yellow;
        }
        // ENTONCES
        if (data.index > 99 && data.index < 110) {
          data.color = COLORS.yellow;
        }
        // PAGA
        if (data.index > 112 && data.index < 119) {
          data.color = COLORS.green;
        }
        // SINO
        if (data.index > 120 && data.index < 126) {
          data.color = COLORS.yellow;
        }
        // HAMBRE
        if (data.index > 130 && data.index < 138) {
          data.color = COLORS.red;
        }
        return data;
      });
    const p = {
      value: 0,
    };
    let animText = this.tweens.add({
      targets: p,
      value: 1,
      loop: -1,
      duration: 200,
      timeScale: 1,
      onUpdate: () => {
        if (p.value !== 1) {
          return;
        }
        animText.timeScale = Math.max(1, animText.timeScale - 0.2);
        addKey();
      },
    });
    let addKey = () => {
      if (messageIndex >= messageToPrint.length) {
        // END
        onEnd();
        return;
      }
      let pooltext = messageToPrint[messageIndex];
      let key = pooltext[keyIndex] || "";
      let text = pooltext.substring(0, keyIndex);
      messageText.setText(currentPrintedMessage.concat(text));
      keyIndex += 1;
      let ks = key.trim().length === 0 ? "key1" : "key" + random(2, 9);
      this.sounds.typing.play(ks);
      if (keyIndex > pooltext.length) {
        currentPrintedMessage = currentPrintedMessage.concat(text);
        keyIndex = 0;
        messageIndex += 1;
      }
    };
    const onEnd = () => {
      var h = this.game.scale.height / 2;
      let duration = 1000;
      animText.remove();
      this.input.removeListener("pointerdown", onPointerDown);

      this.tweens.add({
        targets: messageText,
        alpha: 0,
        duration,
      });
      this.tweens.add({
        targets: this.player,
        y: h + 40,
        duration,
      });
      this.tweens.add({
        targets: this.pc,
        y: h - 20,
        duration,
        onComplete: () => {
          this.goToMainScene();
        },
      });
    };
    let onPointerDown = () => {
      // SPEED UP
      this.input.once(
        "pointerup",
        () => {
          // SPEED DOWN
          addKey();
          animText.timeScale += 0.6;
          //console.log(animText.timeScale);
        },
        true
      );
    };

    this.input.on("pointerdown", onPointerDown, true);
  }
  async goToMainScene() {
    let bg = this.add
      .image(0, 0, "rect")
      .setTintFill(0)
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0);

    await tweenOnPromise(this, {
      targets: bg,
      alpha: 1,
      duration: 1000,
    });

    this.scene.start("main");
  }
}
