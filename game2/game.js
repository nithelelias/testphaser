var tag_types;
function random(min, max) {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var quizTimeCallback = () => {};
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
    this.load.image("bg", "assets/gradient26.png");
    this.load.image("grid", "assets/grid.png");
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    this.load.audio("place", [
      "assets/audio/place.ogg",
      "assets/audio/place.m4a",
    ]);

    this.load.audio("miss", ["assets/audio/miss.ogg", "assets/audio/miss.m4a"]);

    this.load.audio("gamelost", [
      "assets/audio/gamelost.ogg",
      "assets/audio/gamelost.m4a",
    ]);

    this.load.audio("gamewon", [
      "assets/audio/gamewon.ogg",
      "assets/audio/gamewon.m4a",
    ]);

    this.load.audio("music", [
      "assets/audio/music.ogg",
      "assets/audio/music.m4a",
      "assets/audio/music.mp3",
    ]);
    this.load.audio("countdown", [
      "assets/audio/countdown.ogg",
      "assets/audio/countdown.m4a",
      "assets/audio/countdown.mp3",
    ]);
    this.load.audio("match", [
      "assets/audio/match.ogg",
      "assets/audio/match.m4a",
      "assets/audio/match.mp3",
    ]);

    this.load.image("buttonbg", "assets/button-bg.png");
    this.load.atlas("emojis", "assets/emojis.png", "assets/emojis.json");
    tag_types = ["diamond_0000", "prism_0000", "ruby_0000", "square_0000"];
    this.load.atlas("gems", "assets/gems.png", "assets/gems.json");
    // tag_types = [
    //   "veg31",
    //   "veg32",
    //   "veg33",
    //   "veg34",
    //   "veg35",
    //   "veg36",
    //   "veg37",
    //   "veg27",
    // ];
    // this.load.atlas("gems", "assets/veg2.png", "assets/veg2.json");
  }

  create() {
    let scene = this.scene;

    WebFont.load({
      custom: {
        families: ["bebas"],
      },
      active: function () {
        scene.start("instructions");
      },
    });
  }
}

class Instructions extends Phaser.Scene {
  constructor() {
    super("instructions");
  }

  create() {
    this.add.image(400, 300, "bg"); 

   

    this.add
      .text(20, 40, "3 En LINEA!", {
        fontFamily: "bebas",
        fontSize: 70,
        color: "#ffffff",
      })
      .setShadow(2, 2, "#333333", 2, false, true);

    var help = [
      "Tienes que poner 3 elementos en LINEA!!",
      'Solo puedes mover los elementos adjacentemente 1 casilla',
      "Si juntas 3 o mas elmentos del mimsmo tipo estos desapareceran y sumaras puntos",
      "Si sale un emoji saldra un quiz para borrar elementos adjacentes",
    ];

    this.add
      .text(20, 180, help, {
        fontFamily: "bebas",
        fontSize: 30,
        color: "#ffffff",
        lineSpacing: 6,
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

    this.grid;
    this.gridWidth = 8;
    this.gridHeight = 6;
    this.gridSize = 64;
    this.selected = null;
    this.map = {};
    this.points = 0;
    this.busy = false;
    this.rowsGenerated = 0;
    this.offset = {
      x: config.width / 2 - (this.gridSize * this.gridWidth) / 2,
      y: config.height / 2 - (this.gridSize * this.gridHeight) / 2,
    };
    window.$game = this;
  }

  init() {
    this.grid = [];

    this.speed = 250;

    this.direction = 0;
    this.currentY = this.gridHeight;
  }

  create() {
    let ox = this.offset.x;
    let oy = this.offset.y;

    let gw = this.gridWidth;
    let gh = this.gridHeight;

    let size = this.gridSize;
    let color1 = "0x141414"; // 0x999999;
    let color2 = 0x101e45;  

    this.elementsGroup = this.add.group();

    this.add
      .grid(ox, oy, gw * size, gh * size, size, size, color1, 1, color2)
      .setOrigin(0);
    for (var y = 0; y <= gh; y++) {
      if (y < gh) {
        this.grid.push([0, 0, 0, 0, 0, 0, 0]);
      }
      for (let x = 1; x <= this.gridWidth; x++) {
        // IF first row does not have elements
        this.map[x + "-" + y] = null;
      }
    }
    //  The score
    this.add.text(0, 16, "score:", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.scoreText = this.add.text(0, 64, "0", {
      fontSize: "32px",
      fill: "#fff",
    });

    const limitMoveToNear = (px, py) => {
      let cell = this.getCellByCoords(px, py);
      if (!cell) {
        return false;
      }
      let current_cell = this.selected.cell;
      let sum =
        Math.abs(cell.x - current_cell.x) + Math.abs(cell.y - current_cell.y);
      return sum <= 1;
    };

    this.input.on(
      "gameobjectdown",
      (pointer, gameObject) => {
        if (!this.busy) {
          console.log(gameObject.tag);
          if (gameObject.tag.indexOf("smile") > -1) {
            this.quizTime();
            quizTimeCallback = () => {
              this.points += 100;
              const promises = this.getElementsAroundMe(gameObject).map((el) =>
                el.remove()
              );
              promises.push(gameObject.remove());
              Promise.all(promises).then(() => {
                this.addFirstRow();
              });
            };
          } else {
            this.selected = gameObject;
          }
        }
      },
      this
    );
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (!this.busy && this.selected) {
        // CANT MOVE >gridsize distance
        if (limitMoveToNear(dragX, dragY)) {
          this.selected.x = dragX;
          this.selected.y = dragY;
        }
      }
    });
    this.input.on("pointerup", (pointer, gameObject) => {
      if (!this.busy && this.selected) {
        if (limitMoveToNear(pointer.x, pointer.y)) {
          let fromcell = { ...this.selected.cell };
          let tocell = this.getCellByCoords(this.selected.x, this.selected.y);

          this.swithPosition(tocell);
          if (!this.validateMatch()) {
            //return..
            this.swithPosition(fromcell);
          }
          this.selected = null;
          return;
        }

        this.returnSelected();
      }
    });

    this.addFirstRow();
  }
  addNewElement(x, y, type, tag) {
    const child = this.elementsGroup.create(0, 0, type);
    this.setOnCell(child, x, y);
    child.tag = tag;
    child.setFrame(child.tag);

    child.setInteractive();
    this.input.setDraggable(child);
    child.input.draggable = true;
    child.remove = (callback_oncomplete) => {
      return new Promise((resolve) => {
        this.tweens.add({
          targets: [child],
          angle: "-=900",
          scale: "-=.1",
          ease: "linear",
          duration: 200,
          onComplete: () => {
            this.map[child.cell.x + "-" + child.cell.y] = null;
            child.destroy();
            if (callback_oncomplete) callback_oncomplete();
            resolve();
          },
        });
      });
    };
    return child;
  }
  swithPosition(cell) {
    if (cell) {
      const other = this.getElementOnCell(cell.x, cell.y);
      if (other && other != this.selected) {
        const c1 = { ...this.selected.cell };
        this.setOnCell(other, c1.x, c1.y);
        this.setOnCell(this.selected, cell.x, cell.y);
        return true;
      }
    }
    return false;
  }
  getElementsAroundMe(element) {
    const centercell = element.cell;
    const found = [
      //der
      this.getElementOnCell(centercell.x + 1, centercell.y),
      //iz
      this.getElementOnCell(centercell.x - 1, centercell.y),
      //up
      this.getElementOnCell(centercell.x, centercell.y - 1),
      //down
      this.getElementOnCell(centercell.x, centercell.y + 1),
    ];

    return found.filter((el) => el != null);
  }
  addFirstRow() {
    this.rowsGenerated++;
    const randomQuizX =
      this.rowsGenerated % this.gridHeight === 0
        ? random(1, this.gridWidth)
        : -1;
    for (let x = 1; x <= this.gridWidth; x++) {
      // IF first row does not have elements

      if (this.map[x + "-1"] === null) {
        if (randomQuizX === x) {
          this.addNewElement(x, 1, "emojis", "smile" + random(1, 5)).setScale(
            0.8
          );
        } else {
          this.addNewElement(
            x,
            1,
            "gems",
            tag_types[random(0, random(tag_types.length - 1))]
          );
        }
      }
    }
    this.dropElements();
  }

  validateMatch() {
    const matchs = this.getMatchs();
    this.busy = false;
    if (matchs.length > 0) {
      this.busy = true;
      this.clearMatchs(matchs).then(() => {
        this.addFirstRow();
      });
      this.points += matchs.length;
      this.updateScoreView();
    }
    return matchs.length > 0;
  }

  updateScoreView() {
    this.scoreText.setText(this.points);
  }
  getMatchs() {
    // FROM SELECTED FIND NEAR SAME COLOR

    const visited = {};
    const matches = [];
    const iterationOnDirection = (tag, fromcell, matches, vx, vy) => {
      let other = this.getElementOnCell(fromcell.x + vx, fromcell.y + vy);
      if (other && other.tag === tag) {
        matches.push(other);
        visited[other.cell.x + "-" + other.cell.y] = 1;
        // continue
        iterationOnDirection(tag, other.cell, matches, vx, vy);
      }
    };

    const validateFrom = (targetElement) => {
      const { tag, cell } = targetElement;
      const matchesV = [targetElement];
      const matchesH = [targetElement];
      //RIGHT
      iterationOnDirection(tag, cell, matchesH, 1, 0);
      //LEFT
      iterationOnDirection(tag, cell, matchesH, -1, 0);
      // UP
      iterationOnDirection(tag, cell, matchesV, 0, -1);
      // DOWN
      iterationOnDirection(tag, cell, matchesV, 0, 1);

      if (matchesH.length >= 3) {
        matches.push(matchesH);
      }
      if (matchesV.length >= 3) {
        matches.push(matchesV);
      }
    };

    for (let key in this.map) {
      if (this.map[key] && !visited.hasOwnProperty(key)) {
        visited[key] = 1;
        validateFrom(this.map[key]);
      }
    }
    if (matches.length > 0) {
      return matches.reduce((currentarr, nextarr) => {
        return currentarr.concat(nextarr);
      });
    }
    return [];
  }

  clearMatchs(matchs) {
    const promises = [];
    matchs.forEach((element) => {
      promises.push(element.remove());
    });

    return Promise.all(promises);
  }

  dropElements() {
    const emptyCells = [];
    let gw = this.gridWidth;
    let gh = this.gridHeight;

    for (let x = 1; x <= gw; x++) {
      for (let y = gh; y > 0; y--) {
        if (this.map[x + "-" + y] === null) {
          emptyCells.push({ x, y });
          break;
        }
      }
    }
    //-- console.log(emptyCells);
    const animations = [];
    emptyCells.forEach((_emptycell) => {
      // this cell is empty get cell up.
      let cursorY = parseInt(_emptycell.y - 1);
      let deep = 1;
      while (cursorY > 0) {
        let element = this.getElementOnCell(_emptycell.x, cursorY);
        if (element) {
          animations.push({
            element,
            fromcell: { ...element.cell },
            deep,
            cell: _emptycell,
          });
          break;
        }
        cursorY -= 1;
        deep++;
      }
    });
    const promises = [];
    animations.forEach((anim) => {
      const element = anim.element;
      this.map[anim.fromcell.x + "-" + anim.fromcell.y] = null;
      promises.push(
        new Promise((resolve) => {
          this.tweens.add({
            targets: element,
            y: anim.element.y + this.gridSize * anim.deep,
            ease: "linear",
            duration: 100,
            onComplete: () => {
              this.setOnCell(element, anim.cell.x, anim.cell.y);
              resolve();
            },
          });
        })
      );
    });
    //--console.log(animations);
    Promise.all(promises).then(() => {
      if (animations.length > 0) {
        // REPEAT.
        this.addFirstRow();
      } else {
        this.validateMatch();
      }
    });
  }

  returnSelected() {
    this.setOnCell(this.selected, this.selected.cell.x, this.selected.cell.y);
    this.selected = null;
  }
  setOnCell(element, x, y) {
    element.x = this.offset.x + (x * this.gridSize - this.gridSize / 2);
    element.y = this.offset.y + (y * this.gridSize - this.gridSize / 2);
    element.cell = { x, y };
    this.map[x + "-" + y] = element;
  }

  getCellByCoords(inx, iny) {
    let x = parseInt((inx - this.offset.x) / this.gridSize + 1);
    let y = parseInt((iny - this.offset.y) / this.gridSize + 1);
    if (x > 0 && x <= this.gridWidth && y > 0 && y <= this.gridHeight) {
      return { x, y };
    }
    return null;
  }
  getElementOnCell(x, y) {
    const key = x + "-" + y;
    return this.map[key] || null;
  }
  quizTime() {
    this.scene.pause();
    this.scene.sendToBack();
    this.scene.run("quiztime");
    this.scene.get("quiztime").scene.setActive(true);
  }
  gameOver() {
    this.scene.pause();
    this.scene.run("gameOver");
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
    // this.scene.remove("quiztime");
    //this.scene.start("game");
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

    var score = this.registry.get("score");

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

    if (score < 5) {
      this.sound.play("gamelost");
    } else {
      this.sound.play("gamewon");
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
    this.scene.start("game");
  }
}
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: document.querySelector(".game__wrapper"),
  scene: [Boot, Instructions, TheGame, QuizTime, GameOver],
};

var game = new Phaser.Game(config);
