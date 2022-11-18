const grid = {
  x: 0,
  y: 0,
  width: 9, // pon esto de 4 para validar la rotacion posible
  height: 16,
  size: 48,
  color1: 0x999999,
  color2: 0x666666,
};
const generateHexaColor = () => {
  return "0x" + Math.floor(Math.random() * 16777215).toString(16);
};
class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
    // AQUI SE INICIA TODO /precarga
  }

  init() {}

  preload() {
    // this.load.atlas("pack", "../common-assets/colored-transparent_packed.png", JsonPacked());
  }

  create() {
    setTimeout(() => {
      this.scene.start("game");
    }, 100);
  }
}
var count = 0;
class Game extends Phaser.Scene {
  constructor() {
    super("game");
    console.log("START");
    window.$stage = this;
    this.waitingNewPiece = null;
    this.waitingNewPiece_delay = 1000;
    this.pieces = [];
    this.speed = 210;
    this.map = {};
    this.gridXInit = 0;
    this.gridYInit = 0;
    this.controlPieces = [];
    this.movedir = { x: 0, y: 0 };
    this.lastPiece = null;
    this.graphics = {
      i: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
        color: generateHexaColor(),
      },
      o: {
        points: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
        color: generateHexaColor(),
      },
      l: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 2],
        ],
        color: generateHexaColor(),
      },
      j: {
        points: [
          [0, 0],
          [0, 1],
          [0, 2],
          [-1, 2],
        ],
        color: generateHexaColor(),
      },
      z: {
        points: [
          [-1, 0],
          [0, 0],
          [0, 1],
          [1, 1],
        ],
        color: generateHexaColor(),
      },
      s: {
        points: [
          [-1, 1],
          [0, 1],
          [0, 0],
          [1, 0],
        ],
        color: generateHexaColor(),
      },
      t: {
        points: [
          [-1, 0],
          [1, 0],

          [0, 0],
          [0, 1],
        ],
        color: generateHexaColor(),
      },
    };
    this.avaibleGraphics = Object.keys(this.graphics);
  }

  create() {
    console.log("CREATE");
    this.map = {};
    grid.x = gameConfig.width / 2;
    grid.y = grid.size;
    grid.h = grid.height * grid.size;
    grid.w = grid.width * grid.size;
    this.gridXInit = grid.x - grid.w / 2;
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
      .setOrigin(0.5, 0);
    this.timer = this.time.addEvent({
      delay: this.speed,
      callback: this.moveBlocks,
      callbackScope: this,
      loop: true,
    });
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
  update() {
    this.moveControlBlocksX();
  }
  initDragListener() {
    let pointer_down = null;
    let canRotate = {
      state: false,
      set: () => {
        canRotate.state = true;
        canRotate.timeout = setTimeout(() => {
          canRotate.state = false;
        }, 200);
      },
      clear: () => {
        clearTimeout(canRotate.timeout);
      },
    };
    this.input.on(
      "pointerdown",
      (pointer) => {
        pointer_down = { x: pointer.x };
        canRotate.set();
      },
      this.scene
    );
    this.input.on(
      "pointerup",
      () => {
        pointer_down = null;
        this.movedir.x = 0;
        if (canRotate.state) {
          canRotate.clear();
          this.rotatePiece();
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
        if (dirx != 0) {
          dirx = dirx / Math.abs(dirx);
          pointer_down = { x: pointer.x };
        }
        this.movedir.x = dirx;
      },
      this.scene
    );
  }

  rotatePiece() {
    if (this.lastPiece === "o") {
      return;
    }
    // ROTATE THE PIECES
    let center = this.controlPieces[2];
    let centerPosition = this.getGridPositionOfCell(center);
    let canmove = true;
    const newPositions = []; 
    const condition = (x, y) =>
      this.isCellOccupied(x, y) || x >= grid.width || x < 0 || y >= grid.height;
    
    for (let i = 0; i < 4; i++) {
      const rect = this.controlPieces[i];
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

      newPositions.push({ x, y });
    }
    if (canmove) {
      console.log(newPositions);
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
  destroyCell(col, row) {
    this.map[col + "-" + row].destroy();
    delete this.map[col + "-" + row];
  }
  addNewPiece() {
    const x0 = this.gridXInit;
    const y0 = this.gridYInit;
    const entryX = parseInt(grid.width / 2);

    count++;
    if (count >= grid.width) {
      count = 0;
    }
    /// NEW PIECE WITH OUT REPEAT IT SELF
    let rnd = this.lastPiece;
    while (this.lastPiece == rnd) {
      rnd =
        this.avaibleGraphics[
          Phaser.Math.Between(0, this.avaibleGraphics.length - 1)
        ];
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
      this.pieces.push(rect);
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
        console.log("cell occupied");
        break;
      }
    }
    if (canmove) {
      this.recttouch.x += velx;
      this.controlPieces.forEach((rect) => {
        const nx = rect.x + velx;

        rect.x = nx;
      });
    } else {
      console.log("can move that way");
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
      //   this.controlPieces.forEach((rect) => {
      //     rect.stuck = true;
      //     this.setPieceOnMap(rect);
      //   });
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
    // validate if controlBlocks can move
    if (this.moveControlBlocksY()) {
      this.clearWaitingNewPiece();
      return;
    }

    if (this.validate()) {
      this.clearWaitingNewPiece();
      return;
    }
    this.waitNewPiece();
  }
  moveAllDownFromRow(maxRow) {
    // clean map

    for (let row = maxRow; row > 0; row--) {
      for (let col = 0; col < grid.width; col++) {
        if (this.isCellOccupied(col, row)) {
          let key = col + "-" + row;
          const rect = this.map[key];
          rect.y += grid.size;
          delete this.map[key];
          this.setPieceOnMap(rect);
        }
      }
    }
    // refill
  }
  destroyRow(row) {
    for (let col = 0; col < grid.width; col++) {
      this.destroyCell(col, row);
    }
  }
  validate() {
    let breakline = false;
    /**
     * Validate rows from 0 to grid.height
     */
    for (let row = 0; row < grid.height; row++) {
      let colsFilled = true;
      for (let col = 0; col < grid.width; col++) {
        if (!this.isCellOccupied(col, row)) {
          colsFilled = false;
          break;
        }
      }
      if (colsFilled) {
        console.log("BREAK LINE");
        this.destroyRow(row);
        this.moveAllDownFromRow(row);
        breakline = true;
        break;
      }
    }
    return breakline;
  }

  clearWaitingNewPiece() {
    clearTimeout(this.waitingNewPiece);
    this.waitingNewPiece = null;
  }
  waitNewPiece() {
    if (!this.waitingNewPiece) {
      this.waitingNewPiece = setTimeout(() => {
        this.waitingNewPiece = null;
        // RE RUN THIS
        if (this.moveControlBlocksY()) {
          return;
        }
        // record
        this.controlPieces.forEach((rect) => {
          rect.stuck = true;
          this.setPieceOnMap(rect);
        });
        this.validate();
        // add new piece
        this.addNewPiece();
      }, this.waitingNewPiece_delay);
    }
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
  width: window.innerWidth - 50,
  height: window.innerHeight - 100,
  pixelArt: true,
  parent: document.querySelector(".game__wrapper"),

  scene: [Boot, Game, GameOver],
};
const game = new Phaser.Game(gameConfig);
