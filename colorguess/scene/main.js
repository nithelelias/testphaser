import { COLORS } from "../constants.js";

const BOTTLE_WIDTH = 60;
const BOTTLE_HEIGHT = 100;
const COLORS_IDS = {
  red: 0xff595e,
  yellow: 0xffca3a,
  green: 0x8ac926,
  blue: 0x1982c4,
  purple: 0x6a4c93,
};
const BOTTLE_COLORS = ["red", "yellow", "green", "blue", "purple"];
const TOTAL_BOTTLES = BOTTLE_COLORS.length;
function addBottleColor(scene, color, x, y) {
  let elem = scene.add
    .rectangle(x, y, BOTTLE_WIDTH, BOTTLE_HEIGHT, color, 1)
    .setOrigin(0.5, 0);

  return elem;
}

function random(min, max) {
  return Phaser.Math.Between(min, max);
}
function createBottleGroup(FROM_COLORS = BOTTLE_COLORS) {
  let center = {
    x: this.scale.width / 2,
    y: this.scale.height / 2,
  };
  let maxWIdth = (TOTAL_BOTTLES - 1) * BOTTLE_WIDTH;
  let container = this.add.container(center.x - maxWIdth / 2, center.y, []);
  let margin = 0;
  const color_order = [...FROM_COLORS].sort(() => random(-3, 3));

  {
    let same = 0;
    color_order.forEach((_color, idx) => {
      same += _color === FROM_COLORS[idx] ? 1 : 0;
    });
    if (same > 2) {
      let rndForce = [...FROM_COLORS];
      let i = 0;
      while (rndForce.length > 0) {
        let rnd = rndForce.splice(random(0, rndForce.length - 1), 1)[0];
        color_order[i] = rnd;
        i++;
      }
    }
  }
  container._map = {};
  for (let i = 0; i < TOTAL_BOTTLES; i++) {
    let b = addBottleColor(this, COLORS_IDS[color_order[i]], margin * i, 0);
    b.x += b.width * i;
    b._idx = i + 0;
    b._colorId = color_order[i];
    container._map[i] = b;
    container.add(b);
  }
  container.color_order = color_order;
  container.setSize(maxWIdth, BOTTLE_HEIGHT);
  return container;
}
function emojiControl(scene, x, y, text_string, onclick) {
  const fontSize = 24;

  let text = scene.add
    .text(0, 0, text_string, {
      color: COLORS.text,
      fontSize,
    })
    .setOrigin(0.5);
  let container = scene.add.container(x, y, [
    scene.add.rectangle(0, 0, text.width + 8, text.height + 8, 0xfff0f0, 0.8),
    text,
  ]);
  container.setSize(text.width, text.height);
  container.setInteractive();
  container.on("pointerdown", () => {
    onclick();
  });
  container.text = text;
  return container;
}
export default class Main extends Phaser.Scene {
  actions = 0;
  hearts = 5;
  current_guess = 0;
  constructor() {
    super("main");
    window.main = this;
  }
  preload() {
    this.load.audio("click", "audio/click.mp3");
    this.load.audio("drop", "audio/drop.mp3");
    this.load.audio("hurt", "audio/hurt.mp3");
    this.load.audio("win", "audio/win.mp3");
    this.load.audio("lose", "audio/lose.mp3");
    this.load.audio("melody", "audio/melody.mp3");
    this.load.audio("boing", "audio/boing.mp3");
  }
  create() {
    this.audios = {
      click: this.sound.add("click"),
      drop: [this.sound.add("drop"), this.sound.add("drop")],
      hurt: this.sound.add("hurt"),
      win: this.sound.add("win"),
      lose: this.sound.add("lose"),
      melody: this.sound.add("melody"),
    };
    this.cameras.main.fadeIn(1200, 0, 0, 0, false);
    this.audios.melody.loop = true;
    this.audios.melody.play();
    this.colorOrderContainer = createBottleGroup.call(this);
    this.volumeControl();
    this.melodyControl();
    this.prepareBottles().then(() => {
      this.startGame();
    });
    this.darken();
  }
  volumeControl() {
    let getVolumeIcon = (v) => (v ? `🔇` : `🔈`);
    let control = emojiControl(
      this,
      this.scale.width - 32,
      20,
      getVolumeIcon(this.sound.mute),
      () => {
        this.sound.mute = !this.sound.mute;

        control.text.setText(getVolumeIcon(!this.sound.mute));
        return;
      }
    );
  }
  melodyControl() {
    let getVolumeIcon = (v) => (v ? `🤫` : `🎵`);
    let control = emojiControl(
      this,
      this.scale.width - 72,
      20,
      getVolumeIcon(this.audios.melody.mute),
      () => {
        this.audios.melody.mute = !this.audios.melody.mute;

        control.text.setText(getVolumeIcon(!this.audios.melody.mute));
        return;
      }
    );
  }
  prepareBottles() {
    let promises = [];
    this.colorOrderContainer.list.forEach((_elem, _idx) => {
      _elem.y = -1000;
      promises.push(
        new Promise((resolve) => {
          let boing = this.sound.add("boing");
          this.tweens.add({
            targets: _elem,
            delay: 500 + _idx * 100,
            y: 0,
            ease: "bounce.out",
            onUpdate: () => {
              if (_elem.y > -8) {
                boing.currentTime = 0;
                boing.play();
              }
            },
            onComplete: () => {
              boing.currentTime = 0;
              boing.play();
              resolve();
            },
          });
        })
      );
    });
    return Promise.all(promises);
  }
  darken() {
    return new Promise((resolve) => {
      this.blackBox = this.add
        .rectangle(
          this.scale.width / 2 + 2000,
          this.colorOrderContainer.y,
          this.colorOrderContainer.width * 1.5,
          BOTTLE_HEIGHT,
          0x111111
        )
        .setAlpha(0)
        .setOrigin(0.5, 0);

      this.tweens.add({
        targets: this.blackBox,
        delay: 300,
        x: this.scale.width / 2,
        alpha: 1,
        ease: "quint.out",

        onComplete: () => {
          resolve();
        },
      });
    });
  }
  startGame() {
    this.currentGuessContainer = createBottleGroup.call(
      this,
      this.colorOrderContainer.color_order
    );
    this.currentGuessContainer.y -= BOTTLE_HEIGHT;
    this.addBottleHandlers(this.currentGuessContainer);
    this.titleText ==
      this.add
        .text(this.scale.width / 2, 64, ["ORDENA LOS COLORES "], {
          color: COLORS.text,
          fontSize: 24,
        })
        .setOrigin(0.5, 0);
    this.guessText = this.add
      .text(
        this.scale.width / 2,
        204,
        ["Adivinados: 0", "Click en color para intercambiar"],
        {
          color: COLORS.text,
          fontSize: 20,
        }
      )
      .setOrigin(0.5, 0);

    this.actionsText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + BOTTLE_HEIGHT + 60,
        ["Intentos: ❤️"],
        {
          color: COLORS.text,
          fontSize: 32,
        }
      )
      .setOrigin(0.5, 1);

    this.createCenterGrid();

    this.validateMatch();
  }
  addBottleHandlers(container) {
    let selecteds = [];
    let busy = false;
    let bottles = container.list;

    let onCompleteToggle = () => {
      this.validateMatch();
      busy = false;
    };

    let toggleOrder = () => {
      if (selecteds.length < 2) {
        return;
      }
      this.actions++;
      busy = true;
      setTimeout(() => {
        let first = selecteds.shift();
        let second = selecteds.shift();
        let toX = [first.x + 0, second.x + 0];
        let tempX = first._idx + 0;
        first._idx = second._idx + 0;
        second._idx = tempX + 0;

        container._map[first._idx] = first;
        container._map[second._idx] = second;

        let duration = 300,
          ease = "quintInOut";

        this.tweens.chain({
          targets: first,
          tweens: [
            {
              x: toX[1],
              duration,
              ease,
            },
            { delay: 100, y: 0, duration, ease },
          ],
          onComplete: () => {
            onCompleteToggle();
            this.audios.drop[0].play();
          },
        });
        this.tweens.chain({
          targets: second,
          tweens: [
            { x: toX[0], duration, ease },
            {
              delay: 100,
              y: 0,
              duration,
              ease,
            },
          ],
          onComplete: () => {
            this.audios.drop[1].play();
          },
        });
      }, 300);
    };

    bottles.forEach((_elem, idx) => {
      _elem.setInteractive();
      _elem.on("pointerdown", () => {
        if (busy) {
          return;
        }
        this.audios.click.play();
        if (selecteds.includes(_elem)) {
          _elem.y = 0;
          selecteds = [];
          return;
        }

        _elem.y -= BOTTLE_HEIGHT;
        selecteds.push(_elem);
        toggleOrder();
      });
    });
  }
  createCenterGrid() {
    let center = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };
    // --
    this.add.grid(
      center.x,
      center.y,
      (TOTAL_BOTTLES + 2) * BOTTLE_WIDTH,
      2 * BOTTLE_HEIGHT,
      BOTTLE_WIDTH,
      BOTTLE_HEIGHT,
      0xffffff,
      0,
      0xffffff,
      1
    );
  }
  validateMatch() {
    let guesses = 0;

    for (let i = 0; i < TOTAL_BOTTLES; i++) {
      if (
        this.currentGuessContainer._map[i]._colorId ===
        this.colorOrderContainer._map[i]._colorId
      ) {
        guesses++;
      }
    }
    if (this.current_guess > guesses) {
      this.hearts--;
      this.audios.hurt.play();
      this.cameras.main.shake(300, 0.005, false);
    }
    this.current_guess = guesses;
    this.guessText.setText([`Adivinados: ${this.current_guess}`]);

    this.actionsText.setText([`${new Array(this.hearts).fill("❤️").join("")}`]);
    if (guesses === 5 || this.hearts < 1) {
      this.end(guesses === 5);
      return;
    }
  }
  end(win) {
    this.tweens.add({
      targets: this.audios.melody,
      volume: 0,
      duration: 500,
      onComplete: () => {
        this.audios.melody.stop();
      },
    });
    if (win) {
      this.audios.win.play();
    } else {
      this.audios.lose.play();
    }
    this.blackBox.setVisible(false);
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 + 232,
        [win ? "GANASTE!!" : "Perdiste!", "click para volver a jugar"],
        {
          color: COLORS.text,
          align: "center",
        }
      )
      .setOrigin(0.5, 1);

    this.input.on("pointerdown", () => {
      this.restart();
    });
    {
    }
  }
  restart() {
    this.actions = 0;
    this.hearts = 5;
    this.current_guess = 0;

    this.scene.restart();
  }

  update() {}
}
