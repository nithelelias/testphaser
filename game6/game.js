const grid = {
  x: 0,
  y: 0,
  width: 9, // pon esto de 4 para validar la rotacion posible
  height: 16,
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
    this.speed = 410;
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
    grid.y = grid.size * 4;

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
        1,
        grid.color2
      )
      .setOrigin(0);

     
    this.graphic_progress = this.add.graphics({ x: this.gridXInit, y: 0 });

    this.text = this.add.text(32, 32); 
    
    this.points = 0;
    this.combo = 0;
    this.initDragListener();
  }
  initDragListener() {
    let pointer_down = null;
    let eventTimeStamp = null;

    this.input.on(
      "pointerdown",
      (pointer) => {
        pointer_down = { x: pointer.x, y: pointer.y };
        //canRotate.set();
        eventTimeStamp = Date.now();
        this.delayUntilNextPieceTimer.time = 1000;
      },
      this.scene
    );
    this.input.on(
      "pointerup",
      () => {
        pointer_down = null;
        this.movedir.x = 0;
        this.timer.delay = this.speed;
        this.delayUntilNextPieceTimer.time = 100;
        if (eventTimeStamp != null) {
          let diff_now = Date.now() - eventTimeStamp;
          if (diff_now >= 60) {
            this.rotatePiece();
          }
          eventTimeStamp = null;
        }
      },
      this.scene
    );
    this.input.on(
      "pointermove",
      (pointer) => {
        if (!pointer_down) {
          return;
        }
        let dirx = parseInt((pointer.x - pointer_down.x) / grid.size);
        let diry = parseInt(pointer.y - pointer_down.y) / grid.size;
        if (diry > 2) {
          eventTimeStamp = null;
          this.timer.delay = diry > 4 ? this.speed / diry : 120;
          //pointer_down = { x: pointer.x, y: pointer.y };
        }
        if (dirx != 0) {
          dirx = dirx / Math.abs(dirx);
          pointer_down.x = pointer.x;
          eventTimeStamp = null;
        }

        this.movedir.x = dirx;
      },
      this.scene
    );
  }
  update(time, delta) {
    if (this.state === this.STATES.moving) {
      this.moveControlBlocksX();
    }
    this.text.setText(["Puntos: " + this.points, "Combo: " + this.combo]);
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
