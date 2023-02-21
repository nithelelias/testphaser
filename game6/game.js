import Snake from "./snake.js";

const grid = {
  x: 0,
  y: 0,
  width: 12, // pon esto de 4 para validar la rotacion posible
  height: 21,
  size: 48,
  color1: 0x141414,
  color2: 0x101e45,
};
const dimensions = {
  w: 400,
  h: 600,
};
class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
    // AQUI SE INICIA TODO /precarga
  }

  init() {
    let grid_width = dimensions.w;
    let grid_height = (grid.height + 6) * grid.size;

    const sw = gameConfig.width / grid_width;
    const sh = gameConfig.height / grid_height;
    const scale = Math.min(sw, sh);
    //this.game.canvas.style.transform = `scale(${sw})`;

    grid.size = Math.min(48, Math.round(grid.size * scale + 1));

    Object.assign(this.game.canvas.style, {
      width: "100vw",
      height: "100vh",
    });
  }

  preload() {
    // this.load.atlas("pack", "../common-assets/colored-transparent_packed.png", JsonPacked());
    this.load.atlas("snake", "./assets/snake.png", {
      frames: [
        {
          filename: "head",
          frame: { x: 0, y: 0, w: 42, h: 42 }, 
        },
        {
          filename: "body",
          frame: { x: 94, y: 84, w: 22, h: 41 }, 
        },
      
        {
          filename: "tail",
          frame: { x: 52, y: 84, w: 22, h: 41 }, 
        },
        {
          filename: "left",
          frame: { x: 52, y: 10, w: 32, h: 32 }, 
        },
        {
          filename: "right",
          frame: { x: 94, y: 10, w: 32, h: 32 }, 
        },
      ],
    });

    this.load.image("food", "./assets/food.png");
    this.load.image("eyes", "./assets/eyes.png");
    //this.load.image("body", "./assets/green-orb.png");
  }

  create() {
    setTimeout(() => {
      this.scene.start("game");
    }, 100);
  }
}

function TimeOutEvent(scope, callback, time, step) {
  this.time = time;
  this.callback = callback;

  let timer;
  let active = false;
  const addTimer = () => {
    console.log("START TIMER");
    let countDown = 0 + this.time;
    let delay = 10;
    timer = scope.time.addEvent({
      delay,
      callback: () => {
        countDown -= delay;
        if (countDown > this.time) {
          countDown = this.time;
        }
        if (countDown <= 0) {
          if (this.callback) {
            this.callback();
          }
          this.stop();
        }
        if (step) {
          step(countDown, this.time);
        }
      },
      callbackScope: scope,
      loop: true,
    });
  };
  this.start = () => {
    if (active) {
      return;
    }
    active = true;
    addTimer();
  };
  this.stop = () => {
    if (timer) {
      active = false;
      timer.remove();
      timer.destroy();
    }
  };
}

function GestureController(scope) {
  this.input = scope.input;
  let direction = {
    x: 0,
    y: 0,
  };
  let isClicking = false;
  const calcDir = (prop) => {
    const upperProp = prop.toUpperCase();
    direction[prop] = 0;
    let dist = Math.abs(
      this.input.activePointer["up" + upperProp] -
        this.input.activePointer["down" + upperProp]
    );
    if (dist >= 1) {
      if (
        this.input.activePointer["up" + upperProp] <
        this.input.activePointer["down" + upperProp]
      ) {
        //direction[prop] = -1;
        return -dist;
      } else if (
        this.input.activePointer["up" + upperProp] >
        this.input.activePointer["down" + upperProp]
      ) {
        // direction[prop] = 1;
        return dist;
      }
    }
    return 0;
  };
  this.update = () => {
    if (!this.input.activePointer.isDown && isClicking == true) {
      isClicking = false;
      let ydist = calcDir("y");
      let xdist = calcDir("x");
      if (Math.abs(xdist) > Math.abs(ydist)) {
        direction.y = 0;
        direction.x = xdist > 0 ? 1 : -1;
      } else {
        direction.x = 0;
        direction.y = ydist > 0 ? 1 : -1;
      }
    } else if (this.input.activePointer.isDown && isClicking == false) {
      isClicking = true;
    }
  };
  this.getDirection = () => {
    return direction;
  };
}
class Game extends Phaser.Scene {
  constructor() {
    super("game");
    window.$stage = this;
    this.STATES = {
      idle: 0,
      moving: 1,
      validating: 2,
    };
    this.state = 0;

    this.map = {};
    this.gridXInit = 0;
    this.gridYInit = 0;
    this.movedir = { x: 0, y: 0 };
    this.points = 0;
    this.combo = 0;
  }

  create() {
    grid.h = grid.height * grid.size;
    grid.w = grid.width * grid.size;
    grid.x = this.game.scale.width / 2 - grid.w / 2;
    grid.y = grid.size * 2;

    this.gridXInit = grid.x;
    this.gridYInit = grid.y;
    this.centerX = this.gridXInit + parseInt(grid.width / 2) * grid.size;
    this.add
      .grid(
        grid.x,
        grid.y,
        grid.width * grid.size,
        grid.height * grid.size,
        grid.size,
        grid.size,
        grid.color1,
        1
      )
      .setAltFillStyle(grid.color2)
      .setOrigin(0);

    this.snake = new Snake(this, grid, this.gridXInit, this.gridYInit);

    this.text = this.add.text(32, 32);

    this.points = 0;
    this.combo = 0;
    this.gestures = new GestureController(this);
    this.snake.init();
  }

  update(time, delta) {
    this.text.setText(["Puntos: " + this.points, "Combo: " + this.combo]);
    this.gestures.update(time, delta);
    this.snake.setDirection(this.gestures.getDirection());
    this.snake.update();
  }

  gameOver() {
    this.scene.pause();
    this.scene.run("gameOver");
  }
}
class GameOver extends Phaser.Scene {
  constructor() {
    super("gameOver");
  }

  create() {
    this.add.rectangle(400, 300, 640, 500, 0x000000, 0.7);

    var list = ["Tiny Bonus:", "", "Minor Prize:", "", "Major Prize:"];

    var prizes1 = [
      "A Paperclip",
      "Half-eaten Sandwich",
      "A Boiled Egg",
      "Used Gum",
      "A Goldfish",
      "A Book about Flash",
    ];
    var prizes2 = [
      "Mario Stickers",
      "SNES Joypad",
      "Superman Cape",
      "Contra Poster",
      "Bubble Machine",
      "X-Ray Specs",
      "Skateboard",
    ];
    var prizes3 = [
      "Playstation 4",
      "A Tardis",
      "An X-Wing",
      "Super Nintendo",
      "Arcade Machine",
      "Dragon Egg",
      "Personal Cyborg",
    ];

    var score = 0; // this.registry.get("score");

    var prizelist = [
      "Nothing (Complete 5 rows)",
      "",
      "Nothing (Complete 10 rows)",
      "",
      "Nothing (Complete 15 rows)",
    ];

    var title = "GAME OVER!";

    if (score >= 5) {
      prizelist[0] = Phaser.Utils.Array.GetRandom(prizes1);
    }

    if (score >= 10) {
      prizelist[2] = Phaser.Utils.Array.GetRandom(prizes2);
    }

    if (score === 15) {
      prizelist[4] = Phaser.Utils.Array.GetRandom(prizes3);
      title = "GAME WON!";
    }

    this.add
      .text(400, 120, title, {
        fontFamily: "bebas",
        fontSize: 80,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    this.add
      .text(400, 200, "Let's see what you have won:", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    this.add
      .text(100, 270, list, {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
        align: "right",
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    this.add
      .text(260, 270, prizelist, {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffff00",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    this.add
      .text(400, 500, "Space or Click to try again", {
        fontFamily: "bebas",
        fontSize: 26,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    this.input.keyboard.once("keydown_SPACE", this.restart, this);
    this.input.once("pointerdown", this.restart, this);
  }

  restart() {
    console.log("restart!");
    this.scene.start("game");
  }
}

const gameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  parent: document.querySelector(".game__wrapper"),

  scene: [Boot, Game, GameOver],
};
const game = new Phaser.Game(gameConfig);
