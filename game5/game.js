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
const isMobile = (maxWidth = 1024) => window.innerWidth < maxWidth;
const generateHexaColor = () => {
  return "0x" + Math.floor(Math.random() * 16777215).toString(16);
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
        if(countDown>this.time){
          countDown=this.time;
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
    console.log("START");
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
    this.controlPieces = [];
    this.movedir = { x: 0, y: 0 };
    this.lastPiece = null;
    this.repeatLastPieceSum = 0;

    this.graphics = {
      i: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
        color: 0x8f00ff,
      },
      o: {
        points: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        color: 0xffdd00,
      },
      l: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 2],
        ],
        color: 0xff7d00,
      },
      j: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [-1, 2],
        ],
        color: 0xff006d,
      },
      z: {
        points: [
          [-1, 0],
          [0, 0],
          [0, 1],
          [1, 1],
        ],
        color: 0xadff02,
      },
      s: {
        points: [
          [-1, 1],
          [0, 1],
          [0, 0],
          [1, 0],
        ],
        color: 0x8f00ff,
      },
      t: {
        points: [
          [-1, 0],
          [1, 0],

          [0, 0],
          [0, 1],
        ],
        color: 0xff5ebd,
      },
    };
    this.avaibleGraphics = Object.keys(this.graphics);
  }

  create() {
    console.log("CREATE");
    this.map = {};
    this.initPool = ["i", "i", "o", "o", "i", "o", "i", "o", "i"];
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

    this.timer = this.time.addEvent({
      delay: this.speed,
      callback: this.moveBlocks,
      callbackScope: this,
      loop: true,
    });
    this.delayUntilNextPieceTimer = new TimeOutEvent(
      this,
      () => this.movingTimeEnd(),
      500,
      (time, maxTime) => {
        this.updateProgress(time, maxTime);
      }
    );

    this.graphic_progress = this.add.graphics({ x: this.gridXInit, y: 0 });

    this.text = this.add.text(32, 32);
    this.initDragListener();
    this.recttouch = this.add
      .rectangle(
        this.gridXInit,
        this.gridYInit - grid.size,
        grid.size - 1,
        grid.size - 1,
        0xfff000
      )
      .setOrigin(0);

    this.addNewPiece();
  }
  update(time, delta) {
    if (this.state === this.STATES.moving) {
      this.moveControlBlocksX();
    }
  }
  updateProgress(time, maxTime) {
    {
      let progress = time / maxTime;
      this.graphic_progress.clear();
      let w = grid.w * progress;
      this.graphic_progress.fillStyle(0xfff000, 1);
      this.graphic_progress.fillRect(0, 0, w, 8);
    }
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
  addNewPiece() {
    this.timer.delay = this.speed;
    this.timer.paused = true;
    const x0 = this.gridXInit;
    const y0 = this.gridYInit;
    const entryX = parseInt(grid.width / 2);
    const getRndNewPiece = () =>
      this.avaibleGraphics[
        Phaser.Math.Between(0, this.avaibleGraphics.length - 1)
      ];

    /// NEW PIECE WITH OUT REPEAT IT SELF
    let rnd = getRndNewPiece();
    if (this.initPool.length > 0) {
      rnd = this.initPool.shift();
    } else {
      if (rnd === this.lastPiece) {
        this.repeatLastPieceSum++;
      }
      if (this.repeatLastPieceSum > 2) {
        this.repeatLastPieceSum = 0;
        while (rnd === this.lastPiece) {
          rnd = getRndNewPiece();
        }
      }
    }
    this.lastPiece = rnd;
    ////// .....
    let graphic = this.graphics[rnd];
    this.recttouch.x = this.centerX;
    this.controlPieces = [];
    let peaceColor = graphic.color;
    const binds = [];
    let is_game_over = false;
    for (let i in graphic.points) {
      let position = graphic.points[i];
      let px = entryX + position[0];
      let x = px * grid.size;
      let y = position[1] * grid.size;

      if (this.isCellOccupied(px, position[1])) {
        is_game_over = true;
        break;
      }
      // ADD ELEMENT
      const rect = this.add.rectangle(
        x0 + x,
        y0 + y,
        grid.size - 1,
        grid.size - 1,
        peaceColor
      );
      rect.stuck = false;
      rect.setOrigin(0);
      this.controlPieces.push(rect);
      binds.push(rect);
    }
    if (is_game_over) {
      console.log("GAME END");
      this.gameOver();
      return;
    }
    binds.forEach((rect) => {
      rect.binds = binds.filter((b_rect) => {
        return b_rect != rect;
      });
    });
    this.timer.paused = false;
    this.state = this.STATES.moving;
  }
  rotatePiece() {
    if (this.lastPiece === "o") {
      return;
    }

    // ROTATE THE PIECES
    let center = this.controlPieces[2];
    let centerPosition = this.getGridPositionOfCell(center);
    let canmove = true;
    let bounce = { x: 0 };
    const newPositions = [];
    const condition = (x, y) => this.isCellOccupied(x, y) || y >= grid.height;

    for (let i = 0; i < 4; i++) {
      const rect = this.controlPieces[i];
      if (rect.stuck) {
        return;
      }
      let position = this.getGridPositionOfCell(rect);
      let offset_x = position.x - centerPosition.x;
      let offset_y = position.y - centerPosition.y;

      let new_offset_x = offset_y;
      let new_offset_y = -offset_x;
      let x = centerPosition.x + new_offset_x;
      let y = centerPosition.y + new_offset_y;
      if (condition(x, y)) {
        canmove = false;
        break;
      }
      if (x < 0) {
        bounce.x += 1;
      }
      if (x >= grid.width) {
        bounce.x -= 1;
      }
      newPositions.push({ x, y });
    }
    if (canmove) {
      newPositions.forEach((position, index) => {
        let newP = {
          x: bounce.x + position.x,
          y: position.y,
        };
        if (condition(newP.x, newP.y) || newP.x < 0 || newP.x >= grid.width) {
          canmove = false;
          return;
        }
        newPositions[index] = { ...newP };
      });

      newPositions.forEach((position, index) => {
        const rect = this.controlPieces[index];
        const coordinates = this.getCoordinatesFromGridPosition(position);
        rect.x = coordinates.x;
        rect.y = coordinates.y;
      });
    }
  }

  getGridPositionOfCell(rect) {
    const x = Math.abs(this.gridXInit - rect.x) / grid.size;
    const y = Math.abs(this.gridYInit - rect.y) / grid.size;
    return { x, y };
  }
  getCoordinatesFromGridPosition(position) {
    const x = Math.abs(this.gridXInit + position.x * grid.size);
    const y = Math.abs(this.gridYInit + position.y * grid.size);
    return { x, y };
  }
  isCellOccupied(x, y) {
    return this.map.hasOwnProperty(x + "-" + y);
  }
  setPieceOnMap(rect) {
    const position = this.getGridPositionOfCell(rect);
    let key = position.x + "-" + position.y;
    this.map[key] = rect;
  }
  removePieceOnMap(position) {
    let key = position.x + "-" + position.y;
    delete this.map[key];
  }

  moveControlBlocksX() {
    if (this.movedir.x == 0) {
      return;
    }
    const velx = this.movedir.x * grid.size;
    const maxW = this.gridXInit + grid.w;
    let total = this.controlPieces.length;
    let canmove = true;
    for (let i = 0; i < total; i++) {
      const rect = this.controlPieces[i];
      const nx = rect.x + velx;
      if (!(nx >= this.gridXInit && nx < maxW)) {
        canmove = false;
        break;
      }

      let position = this.getGridPositionOfCell(rect);
      if (this.isCellOccupied(position.x + this.movedir.x, position.y)) {
        // not same as
        canmove = false;

        break;
      }
    }
    if (canmove) {
      this.recttouch.x += velx;
      this.controlPieces.forEach((rect) => {
        const nx = rect.x + velx;
        rect.x = nx;
      });
    }
  }
  moveControlBlocksY() {
    let total = this.controlPieces.length;
    let canmove = true;
    for (let i = 0; i < total; i++) {
      const rect = this.controlPieces[i];
      let position = this.getGridPositionOfCell(rect);
      if (position.y + 1 >= grid.height) {
        canmove = false;
        break;
      }
      if (this.isCellOccupied(position.x, position.y + 1)) {
        // not same as
        canmove = false;
        break;
      }
    }
    if (!canmove) {
      return false;
    }

    this.controlPieces.forEach((rect) => {
      rect.y += grid.size;
    });

    return true;
  }
  moveRectDown(rect) {
    let position = this.getGridPositionOfCell(rect);

    if (position.y + 1 >= grid.height) {
      return false;
    }
    // some one down
    if (this.isCellOccupied(position.x, position.y + 1)) {
      return false;
    }
    rect.y += grid.size;
    return true;
  }

  moveBlocks() {
    if (this.state !== this.STATES.moving) {
      return;
    }
    //  if controlBlocks can move
    if (this.moveControlBlocksY()) {
      return;
    }
    this.delayUntilNextPieceTimer.start();
  }
  moveAllDownFromRow(maxRow) {
    // clean map

    for (let row = maxRow; row > 0; row--) {
      for (let col = 0; col < grid.width; col++) {
        if (this.isCellOccupied(col, row)) {
          let key = col + "-" + row;
          const rect = this.map[key];

          this.removePieceOnMap(rect);
          rect.y += grid.size;
          delete this.map[key];
          this.setPieceOnMap(rect);
        }
      }
    }
    // refill
  }

  validate() {
    return new Promise((resolve, reject) => {
      const cycle = () => {
        /**
         *   rows from 0 to grid.height
         */
        let breakline = false;
        let promises = [];
        for (let row = grid.height; row > 0; row--) {
          let colsFilled = true;
          for (let col = 0; col < grid.width; col++) {
            if (!this.isCellOccupied(col, row)) {
              colsFilled = false;
              break;
            }
          }
          if (colsFilled) {
            console.log("DESTROY ROW");
            promises.push(
              this.destroyRow(row).then(() => {
                this.moveAllDownFromRow(row);
                return 1;
              })
            );
            breakline = true;
         //   break;
          }
        }
        console.log("BREAK LINE?", breakline);
        Promise.all(promises).then(() => {
          if (!breakline) {
            setTimeout(() => {
              resolve();
            }, 100);
          } else {
            cycle();
          }
        });
      };

      cycle();
    });
  }

  destroyRow(row) {
    return new Promise((resolve) => {
      let targets = [];
      for (let col = 0; col < grid.width; col++) {
        targets.push(this.map[col + "-" + row]);
        delete this.map[col + "-" + row];
      }

      const completeDestroy = () => {
        targets.forEach((rect) => {
          rect.destroy();
        });
      };

      let promises = [];
      targets.forEach((rect, index) => {
        promises.push(
          new Promise((onComplete) => {
            let delay = index * 10;
            this.tweens.add({
              targets: rect,
              props: {
                fillAlpha: {
                  value: 0,
                  duration: 100,
                  delay: delay + 510,
                  ease: "Bounce.easeOut",
                },
                fillColor: {
                  value: 0xffffff,
                  duration: 100,
                  delay,
                  ease: "Linear",
                },
              },
              onComplete,
            });
          })
        );
      });

      Promise.all(promises).then(() => {
        completeDestroy();
        resolve();
      });
    });
  }

  movingTimeEnd() {
    if (this.state === this.STATES.validating) {
      return;
    }
    if (this.moveControlBlocksY()) {
      this.delayUntilNextPieceTimer.stop();
      return;
    }
    this.controlPieces.forEach((rect) => {
      rect.stuck = true;
      this.setPieceOnMap(rect);
    });
    this.state = this.STATES.validating;
    this.validate().then(() => {
      this.addNewPiece();
    });
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
