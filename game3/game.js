function random(min, max) {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var quizTimeCallback = () => { };
var totalPoints = 0;
class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  init() {
    let element = document.createElement("style");
    document.head.appendChild(element);
    element.sheet.insertRule(
      '@font-face { font-family: "bebas"; src: url("assets/fonts/bebas.ttf") format("truetype"); }',
      0
    );
  }

  preload() {
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    this.load.image("bg-intro", "assets/gradient7.png");
    this.load.image("bg-game", "assets/gradient1.png");
    this.load.image("buttonbg", "assets/button-bg.png");
    this.load.atlas("emojis", "assets/emojis.png", "assets/emojis.json");
    this.load.atlasXML("animals", "assets/round.png", "assets/round.xml");
  }

  create() {
    let scene = this.scene;

    WebFont.load({
      custom: {
        families: ["bebas"],
      },
      active: function () {
        scene.start("intro");
      },
    });
  }
}

class Intro extends Phaser.Scene {
  constructor() {
    super("intro");
  }

  create() {
    this.add.image(400, 300, "bg-intro");
    this.add
      .text(20, 40, "BUSCA PAREJAS", {
        fontFamily: "bebas",
        fontSize: 70,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    var help = [
      "Encuentra  los  pares   antes   que   se   acabe el tiempo!",
      "Algunos elementos pueden estar ocultos bajo otros",
    ];

    this.add
      .text(20, 180, help, {
        fontFamily: "bebas",
        fontSize: 30,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    this.add
      .text(20, 450, "CLICK PARA INICIAR", {
        fontFamily: "bebas",
        fontSize: 40,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    this.input.keyboard.once("keydown_SPACE", this.start, this);
    this.input.once("pointerdown", this.start, this);
  }
  start() {
    this.scene.start("game");
  }
}

class TheGame extends Phaser.Scene {
  constructor() {
    super("game");
    this.selected = null;
    this.busy = false;
    this.maxTime = 20;
    this.currTime = 0;
    this.timerEvent = null;

    this.maxPoints = 0;
    totalPoints = 0;
    window.$game = this;
  }

  preload() {
    this.load.audio("ambience", "assets/howsyourday.mp3");
  }

  create() {
    totalPoints = 0;
    this.maxPoints = 0;
    this.currTime = 0;
    this.ambience = this.sound.add("ambience");
    this.ambience.play();
    this.add.image(400, 300, "bg-game");
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.currTime++;
      },
      callbackScope: this,
      loop: true,
    });
    this.timer_text = this.add
      .text(32, 32, "TIMELEFT", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ff0011",
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    this.timer_text.depth = 3;
    this.timerAdd_text = this.add
      .text(180, 26, "+0", {
        fontFamily: "bebas",
        fontSize: 32,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    this.timerAdd_text.alpha = 0;
    this.score_text = this.add
      .text(400, 32, "SCORE", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#fff000",
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    this.score_text.depth = 3;

    this.groupA = this.add.group();
    this.groupB = this.add.group();
    const animals = [
      "bear",
      "buffalo",
      "chick",
      "chicken",
      "cow",
      "crocodile",
      "dog",
      "duck",
      "elephant",
      "frog",
      "giraffe",
      "goat",
      "gorilla",
      "hippo",
      "horse",
      "monkey",
      "moose",
      "narwhal",
      "owl",
      "panda",
      "parrot",
    ];
    this.maxPoints = animals.length;
    const fillAt = (group) => {
      for (var i = 0; i < this.maxPoints; i++) {
        const elem = group.create(
          random(100, config.width - 100),
          random(100, config.height - 100),
          "animals",
          animals[i] + ".png"
        );
        elem.tag = animals[i];
        elem.setScale(0.5);
        elem.setInteractive();
        elem.depth = 1;
        elem.idle_count = 10;
        elem.idleAnim = () => {
          elem.idle_count--;
          var ang = 15;
          var duration = 500;
          if (elem.idle_count <= 0) {
            ang = random(5, 60);
            elem.idle_count = random(5, 20);
          }
          this.tweens.add({
            targets: [elem],

            ease: "linear",
            angle: elem.angle > 0 ? -ang : ang,
            duration,
            onComplete: () => {
              setTimeout(() => elem.idleAnim(), 100);
            },
          });
        };
        this.input.setDraggable(elem);
        elem.selectUp = () => {
          return new Promise((resolve) => {
            this.tweens.add({
              targets: [elem],
              scale: ".7",
              ease: "linear",
              duration: 200,
              onComplete: () => {
                elem.depth = 2;
                resolve();
              },
            });
          });
        };
        elem.selectDown = () => {
          return new Promise((resolve) => {
            this.tweens.add({
              targets: [elem],
              scale: ".5",
              ease: "linear",
              duration: 200,
              onComplete: () => {
                elem.depth = 1;
                resolve();
              },
            });
          });
        };
        elem.remove = () => {
          return new Promise((resolve) => {
            this.tweens.add({
              targets: [elem],
              angle: "-=900",
              scale: "-=.1",
              ease: "linear",
              duration: 200,
              onComplete: () => {
                elem.destroy();
                resolve();
              },
            });
          });
        };

        elem.idleAnim();
      }
    };

    fillAt(this.groupA);
    fillAt(this.groupB);

    this.groupA
      .create(
        random(200, config.width - 200),
        random(200, config.height - 200),
        "emojis",
        "smile5"
      )
      .setInteractive().tag = "smile";
    this.input.on("gameobjectdown", (pointer, gameObject) => {
      if (gameObject.tag === "smile") {
        const [x, y] = [
          random(200, config.width - 200),
          random(200, config.height - 200),
        ];

        this.tweens.add({
          targets: [gameObject],
          scale: 3,
          angle: "-=720",
          ease: "easy.in",
          duration: 100,
          onComplete: () => {
            this.quizTime();
            gameObject.scale = 1;
            gameObject.depth = 0;
            gameObject.angle = 0;
            gameObject.x = x;
            gameObject.y = y;
          },
        });
      } else {
        this.validateMatch(gameObject);
      }
    });

    // DRAG ELEMENTS PLS
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (!this.busy) {
        // CANT MOVE >gridsize distance

        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });
  }
  getTimeRemain() {
    return this.maxTime - this.currTime;
  }
  update() {
    var remainTime = this.getTimeRemain();
    this.timer_text.setText(["TIME LEFT:\t \t " + remainTime]);
    if (remainTime <= 0) {
      this.gameOver();
    }
    this.score_text.setText(
      totalPoints + "\t \tPunto" + (totalPoints != 1 ? "s" : "")
    );
  }
  async validateMatch(element) {
    if (this.busy) {
      return;
    }

    this.busy = true;

    (async () => {
      if (!this.selected) {
        await element.selectUp();
        this.selected = element;
        return;
      }

      // IS THE SAME
      if (this.selected === element) {
        await element.selectDown();
        this.selected = null;
        return;
      }

      // VALIDATE IF THERE IS THE SAME
      if (this.selected.tag === element.tag) {
        // MATCH
        await element.selectUp();
        await Promise.all([this.selected.remove(), element.remove()]);
        totalPoints += 1;
        if (totalPoints === this.maxPoints) {
          this.youWin();
        }
        // ADD POINTS...
        this.selected = null;

        return;
      }

      await this.selected.selectDown();
      this.selected = null;
    })();

    this.busy = false;
  }

  youWin() {
    this.scene.pause();
    this.scene.run("youwin");
    this.ambience.stop();
  }
  gameOver() {
    this.scene.pause();
    this.scene.run("gameOver");
    this.ambience.stop();
  }
  quizTime() {
    quizTimeCallback = () => {
      const timeAdd = 10;
      this.currTime -= timeAdd;
      const tempY = this.timerAdd_text.y;
      this.timerAdd_text.setText("+" + timeAdd);
      this.timerAdd_text.alpha = 1;

      this.timerAdd_text.depth = 3;
      this.tweens.add({
        targets: [this.timerAdd_text],
        ease: "linear",
        alpha: 0,
        y: "-=12",
        duration: 1000,
        onComplete: () => {
          this.timerAdd_text.y = tempY;
        },
      });
      //this.time.paused = false;
    };
    //this.time.paused = true;
    this.scene.pause();
    this.scene.sendToBack();
    this.scene.run("quiztime");
    this.scene.get("quiztime").scene.setActive(true);
  }
}

class GameOver extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  create() {
    // PANEL
    this.add.rectangle(400, 300, 640, 500, 0x000000, 0.7);

    this.add
      .text(400, 120, "GAME OVER", {
        fontFamily: "bebas",
        fontSize: 80,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 200, "COMO TE FUE?", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 300, ["HICISTE "], {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    this.add
      .text(400, 350, [totalPoints + " PUNTOS!!"], {
        fontFamily: "bebas",
        fontSize: 34,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    const createButton = (x, y, text, onclick) => {
      var bg = this.add.image(0, 0, "buttonbg").setScale(0.6).setInteractive();
      var text = this.add.text(-50, -20, text, {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      });
      if (onclick) {
        bg.once("pointerup", onclick, this);
      }
      return this.add.container(x, y, [bg, text]);
    };

    createButton(400, 450, "Reiniciar", () => {
      this.restart();
    });
  }

  restart() {
    this.scene.start("game");
  }
}
class YouWin extends Phaser.Scene {
  constructor() {
    super("youwin");
  }

  create() {
    // PANEL
    this.add.rectangle(400, 300, 640, 500, 0x000000, 0.7);

    this.add
      .text(400, 120, "GAME OVER", {
        fontFamily: "bebas",
        fontSize: 80,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 200, "COMO TE FUE?", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 300, "HICISTE " + totalPoints + " PUNTOS!!", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    const createButton = (x, y, text, onclick) => {
      var bg = this.add.image(0, 0, "buttonbg").setScale(0.6).setInteractive();
      var text = this.add.text(-50, -20, text, {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      });
      if (onclick) {
        bg.once("pointerup", onclick, this);
      }
      return this.add.container(x, y, [bg, text]);
    };

    createButton(500, 400, "Reiniciar", () => {
      this.restart();
    });
  }

  restart() {
    this.scene.start("game");
  }
}

class QuizTime extends Phaser.Scene {
  constructor() {
    super("quiztime");
  }
  create() {
    // PANEL
    this.add.rectangle(400, 300, 640, 500, 0x000000, 0.7);

    this.add
      .text(400, 120, "QUIZ TIME", {
        fontFamily: "bebas",
        fontSize: 80,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 200, "SOME QUESTION ASK:", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 300, "CHOOSE ONE OPTION", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    const createButton = (x, y, text, onclick) => {
      var bg = this.add.image(0, 0, "buttonbg").setScale(0.6).setInteractive();
      var text = this.add.text(-50, -20, text, {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      });
      if (onclick) {
        bg.once("pointerup", onclick, this);
      }
      return this.add.container(x, y, [bg, text]);
    };
    setTimeout(() => {
      // ADD BUTTON
      createButton(300, 400, "OPCION A", () => {
        alert("OPCION A");
        this.restart();
      });
      createButton(500, 400, "OPCION B", () => {
        alert("OPCION B");
        this.restart();
      });
    }, 1000);
  }

  restart() {
    // CONTINUE
    this.scene.sendToBack();
    this.scene.get("game").scene.setActive(true);
    quizTimeCallback();
  }
}
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: document.querySelector(".game__wrapper"),
  scene: [Boot, Intro, TheGame, GameOver, YouWin, QuizTime],
};

const game = new Phaser.Game(config);
