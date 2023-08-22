import imageMask from "./imagemask.js";
import { DIC_PIEZAS } from "./pieza.js";

const game = document.getElementById("game");
const gameConfig = {
  style: {
    width: 600, //320,
    height: 760, //480,
  },
};
const RESOURCES = {
  BGIMAGES: { minId: 1, maxId: 12 },
  VARS: {
    PIECE_PADDING: 2,
    PIECE_MIN_SQ_SIZE: 164,
    PIECE_MAX_SQ_SIZE: 224,
    PIECE_HEAD_SQ_RATIO: 0.36,
  },
};

const context = {
  level: 1,
  currentImageId: 0,
};

function itera(maxNumber, callback) {
  let i = 0;
  while (i < maxNumber) {
    if (callback(i) === false) {
      break;
    }
    i++;
  }
}
function waitTime(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const createDiv = () => document.createElement("div");
function Deffered() {
  this.promise = new Promise((resolve) => {
    this.resolve = resolve;
  });
}
function preload() {
  const defer = new Deffered();
  game.innerHTML = "CARGANDO";
  let totalResorcesToLoad = RESOURCES.BGIMAGES.maxId;
  let totalResourcesLoaded = 0;
  const onResourceLoad = () => {
    totalResourcesLoaded++;
    game.innerHTML = `CARGANDO ${parseInt(
      (totalResourcesLoaded / totalResorcesToLoad) * 100
    )}% ${totalResourcesLoaded}/${totalResorcesToLoad}`;
    if (totalResourcesLoaded >= totalResorcesToLoad) {
      game.innerHTML = "";
      defer.resolve();
    }
  };
  itera(5, (_i) => {
    const level = _i + 1;
    let total = Math.pow(level + 1, 2);
    totalResorcesToLoad += total;
    itera(total, (num) => {
      loadPiezaBack(num + 1, level).onload = onResourceLoad;
    });
  });

  itera(RESOURCES.BGIMAGES.maxId, (num) => {
    let id = num + 1;
    loadBgImage(id).onload = onResourceLoad;
  });

  return defer.promise;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return parseInt(random(min, max));
}
function getNotUsedArrayBgImage() {
  let array = [];
  itera(RESOURCES.BGIMAGES.maxId, (num) => {
    const id = num + 1;
    if (context.currentImageId !== id) {
      array.push(id);
    }
  });
  return array;
}
function getNotUsedRandomBgImage() {
  const array = getNotUsedArrayBgImage();
  const rnd = randomInt(0, array.length - 1);
  return array[rnd];
}
function defineUsageImage() {
  let imageId = getNotUsedRandomBgImage();
  context.currentImageId = imageId;
}
const createBoard = () => {
  const boardSize = game.clientWidth * 0.7 + "px";
  const board = createDiv();
  board.id = "board";
  board.style.width = boardSize;
  board.style.height = boardSize;

  game.board = board;
  game.appendChild(board);
};

function addBgImage() {
  const img = loadBgImage(context.currentImageId);
  game.bgImage = img;
  game.board.appendChild(img);
}

function loadImage(url) {
  const img = new Image();
  img.src = url;
  return img;
}
function createPiecesContainer() {
  const pieceContainer = createDiv();
  pieceContainer.id = "pieceContainer";
  game.pieceContainer = pieceContainer;
  game.board.appendChild(pieceContainer);
}

function drawPieces() {
  const pieceContainer = game.pieceContainer;
  pieceContainer.piecesDic = {};
  let total_cells = context.level + 1;
  let size = parseInt(pieceContainer.clientWidth / total_cells);
  let pieceNum = 1;
  let promises = [];
  itera(total_cells, (row) => {
    itera(total_cells, (col) => {
      console.log("P:" + pieceNum);
      let piece = createPiece(size * col, size * row, size, pieceNum);
      promises.push(
        new Promise((resolve) => {
          piece.puzzleImage.onload = resolve;
        })
      );
      pieceContainer.appendChild(piece);
      pieceContainer.piecesDic[pieceNum] = {
        isReveled: () => piece.isReveled(),
        remove: () => {
          piece.remove();
        },
        reveal: function (image) {
          return piece.reveal(image, pieceContainer.clientWidth);
        },
      };
      pieceNum += 1;
    });
  });

  return Promise.all(promises);
}
function getPositionByNum(lados, num) {
  let row = Math.ceil(num / lados),
    col = num - (row - 1) * lados;

  return { row: row - 1, col: col - 1 };
}
function createPiece(x, y, size, pieceNum, level = context.level) {
  const piece = createDiv();
  var revealed = false;
  piece.className = "puzzle-piece";
  piece.style.top = y + "px";
  piece.style.left = x + "px";
  piece.style.width = size + "px";
  piece.style.height = size + "px";
  piece.puzzleImage = loadPiezaBack(pieceNum, level);
  piece.isReveled = () => revealed;
  piece.reveal = (image, fullwidth) => {
    if (revealed) {
      return false;
    }
    revealed = true;
    let p = getPositionByNum(context.level + 1, pieceNum);

    imageMask(image, piece.puzzleImage, {
      width: fullwidth,
      height: fullwidth,
      x: p.col * size + piece.puzzleImage.__settings.x,
      y: p.row * size + piece.puzzleImage.__settings.y,
    }).then((source) => {
      piece.puzzleImage.src = source;
    });
    return true;
  };
  console.log("level", level, "pieceNum", pieceNum);
  piece.appendChild(piece.puzzleImage);
  fitPieza(piece.puzzleImage, size, pieceNum);
  return piece;
}

function fitPieza(img, _size, pieceNum) {
  const { PIECE_HEAD_SQ_RATIO, PIECE_PADDING } = RESOURCES.VARS;
  const size = _size - PIECE_PADDING * 2;
  const key = "p" + context.level + "_" + pieceNum;

  if (!DIC_PIEZAS[key]) {
    console.log("KEY ERROR", key, pieceNum);
  }
  const config = DIC_PIEZAS[key];
  let headSize = size * PIECE_HEAD_SQ_RATIO;
  let width = size,
    height = size,
    x = PIECE_PADDING,
    y = PIECE_PADDING;
  if (config.left !== 0) {
    width += headSize;
    x = -headSize;
  }
  if (config.right !== 0) {
    width += headSize;
  }
  if (config.top !== 0) {
    height += headSize;
    y = -headSize;
  }
  if (config.bottom !== 0) {
    height += headSize;
  }
  img.style.width = width + "px";
  img.style.height = height + "px";
  img.style.top = y + "px";
  img.style.left = x + "px";
  img.__settings = { x, y, width, height };
}

function createPieceOptionBar() {
  const optionBar = createDiv();
  optionBar.id = "optionBar";
  optionBar.innerHTML = `<div id="optionBar__content">
    <div class="optionBar__option"></div>
    <div class="optionBar__option"></div>
    <div class="optionBar__option"></div>
  </div>`;
  optionBar.__content = optionBar.querySelector("#optionBar__content");
  optionBar.__options = optionBar.querySelectorAll(".optionBar__option");

  game.optionBar = optionBar;
  game.appendChild(optionBar);
  optionBar.update = () => {
    let total = Math.pow(context.level + 1, 2);
    let currentGood = randomInt(0, 2);
    optionBar.__options.forEach((element, idx) => {
      element.childNodes.forEach((_child) => {
        _child.remove();
      });
      element.__good = idx === currentGood;
      element.__pieceNum = element.__good
        ? getRandomHiddenPieceNum()
        : randomInt(1, total);
      if (!element.__pieceNum) {
        console.error("no number", element.__good ? "isgood" : "nogood");
        return;
      }
      let piece = createPiece(
        0,
        0,
        element.clientWidth,
        element.__pieceNum,
        context.level
      );
      let imgUrl = game.bgImage.src;

      if (!element.__good) {
        imgUrl = getBgImageUrl(getNotUsedRandomBgImage());
      }
      // fitPieza(piece.puzzleImage, size, pieceNum);
      piece.reveal(imgUrl, element.clientWidth * (1 + context.level));
      element.appendChild(piece);
    });
  };
  optionBar.__options.forEach((element, idx) => {
    element.onclick = onOptionBarClickHandler;
  });
  optionBar.update();
}
function onOptionBarClickHandler(evt) {
  if (this.__good) {
    revealPieza(this.__pieceNum);
    addFloatingMessage(this.style.left, this.style.top, "+10pts");
  } else {
    addFloatingMessage(this.style.left, this.style.top, "-10pts");
  }
  if (validateIfWin()) {
    doWin();
  } else {
    game.optionBar.update();
  }
}
function getPiecesLeft() {
  let array = [];
  for (let i in pieceContainer.piecesDic) {
    const handler = pieceContainer.piecesDic[i];
    if (!handler.isReveled()) {
      array.push(parseInt(i));
    }
  }
  return array;
}

function getRandomHiddenPieceNum() {
  const options = getPiecesLeft();
  return options[randomInt(0, options.length - 1)];
}

function addFloatingMessage(x, y, message) {
  let div = createDiv();
  div.classList.add("floating-message", "entrance");
  div.innerHTML = `<p>${message}</p>`;
  div.style.left = typeof x === "string" ? x : x + "px";
  div.style.top = typeof y === "string" ? y : y + "px";
  setTimeout(() => {
    div.classList.remove("entrance");
    div.classList.add("exit");
  }, 1000);
  game.appendChild(div);
  return div;
}
function loadPiezaBack(pieceNum, level = context.level) {
  const img = loadImage(`piezas/level${level}/${pieceNum}.png`);
  img.className = "puzzle-piece-image";
  return img;
}
function loadBgImage(imageId) {
  const img = loadImage(getBgImageUrl(imageId));
  img.id = "img-escenario";
  return img;
}
function getBgImageUrl(imageId) {
  return `images/escenario-${imageId}.webp`;
}
function clearPieza(pieceNum) {
  game.pieceContainer.piecesDic[pieceNum].remove();
}
function revealPieza(pieceNum) {
  game.pieceContainer.piecesDic[pieceNum].reveal(game.bgImage.src);
}
function validateIfWin() {
  let totalPiecesLeft = getPiecesLeft().length;
  return totalPiecesLeft === 0;
}

async function doWin() {
  addFloatingMessage(game.center.x, game.center.y, "GANASTE");
  game.bgImage.style.opacity = 1;
  game.pieceContainer.remove();
  game.optionBar.style.visibility = "hidden";
  await waitTime(1000);
  clear();
  context.level += 1;
  await waitTime(1000);
  create();
}
function clear() {
  game.childNodes.forEach((_child) => {
    _child.remove();
  });
  game.innerHTML = "";
}
function calcDimensions() {
  let w = parseInt(gameConfig.style.width);
  let h = parseInt(gameConfig.style.height);
  if (w > innerWidth) {
    let ratio = w / h;
    w = innerWidth;
    h *= ratio;
  }
  game.style.width = w + "px";
  game.style.height = h + "px";
}
async function create() {
  calcDimensions();

  game.center = {
    x: game.clientWidth / 2,
    y: game.clientHeight / 2,
  };
  defineUsageImage();
  createBoard();
  addBgImage();
  await waitTime(2000);
  game.bgImage.style.opacity = 0;
  createPiecesContainer();
  await drawPieces();
  await waitTime(100);
  createPieceOptionBar();
}
window.$d = { clearPieza, revealPieza, addFloatingMessage };
//preload().then(() => create());
create();
