import CircularLetterConnector from "../componentes/CircularLetterConnector.js";

const xOffset = 50;
const yOffset = 50;
const cellSize = 40;
export default class MainScene extends Phaser.Scene {
  constructor() {
    super("main");
  }

  preload() {
    // Cargar cualquier recurso necesario aquí
  }

  init() {
    this.words = ["protectores", "lectores", "sarten"]
    
    this.wordsOnGrid = {};
    this.gridSize = 20;

    this.grid = [];
    this.gridCells = [];
  }

  create() {
    this.init();
    window.$main = this;
    this.gridContainer = this.add.container(0, 0, [
      this.add.rectangle(
        0,
        0,
        this.gridSize * 10,
        this.gridSize * 10,
        0xff0000,
        0.5
      ),
    ]);
    // Inicializar el grid
    this.grid = Array.from({ length: this.gridSize }, () =>
      Array(this.gridSize).fill("")
    );
    this.gridCells = Array.from({ length: this.gridSize }, () =>
      Array(this.gridSize).fill(null)
    );
    let currentDirection = -1;
    const getDirection = (dirCode) => {
      return dirCode === 1 ? "horizontal" : "vertical";
    };
    // Colocar la primera palabra en el centro del grid
    this.placeWord(
      this.words[0],
      Math.floor(this.gridSize / 2),
      Math.floor(this.gridSize / 2),
      getDirection(currentDirection)
    );
    // Colocar las demás palabras
    for (let i = 1; i < this.words.length; i++) {
      const word = this.words[i];
      const direction = getDirection(currentDirection);
      const placed = this.placeConnectedWord(word, direction);
      if (!placed) {
        console.log(`No se pudo colocar la palabra: ${word}`);
      }
      currentDirection *= -1;
    }

    const comp = new CircularLetterConnector(
      this,
      this.scale.width / 2,
      this.scale.height - 200,
      getUniqueLetters(this.words),
      (letters) => {
        console.log(letters);
        this.showWord(letters.join(""));
      }
    );

    // Dibujar el grid        this.drawGrid();
  }

  placeConnectedWord(word, initialDirection) {
    const len = word.length;
    const attempts = 100; // Número de intentos para colocar la palabra

    for (let attempt = 0; attempt < attempts; attempt++) {
      // Elegir una letra de una palabra existente para conectar
      const [x, y] = this.getRandomLetterPosition();

      if (x !== -1 && y !== -1) {
        // Alternar dirección
        const direction =
          initialDirection === "horizontal" ? "vertical" : "horizontal";
        const startX = direction === "horizontal" ? x - Math.floor(len / 2) : x;
        const startY = direction === "horizontal" ? y : y - Math.floor(len / 2);

        // Verificar si la palabra cabe en el grid y se puede conectar
        if (this.canPlaceWord(word, startX, startY, direction)) {
          this.placeWord(word, startX, startY, direction);
          return true; // Palabra colocada con éxito
        }
      }
    }

    return false; // No se pudo colocar la palabra
  }

  getRandomLetterPosition() {
    const positions = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] !== "") {
          positions.push([x, y]);
        }
      }
    }

    // Retornar una posición aleatoria de una letra existente
    if (positions.length === 0) {
      return [-1, -1]; // No hay letras en el grid
    }
    return positions[Math.floor(Math.random() * positions.length)];
  }

  canPlaceWord(word, startX, startY, direction) {
    const len = word.length;
    const isHorizontal = direction === "horizontal";
    // Verificar límites del grid
    for (let i = 0; i < len; i++) {
      const x = isHorizontal ? startX + i : startX;
      const y = isHorizontal ? startY : startY + i;

      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
        return false; // Fuera de límites
      }

      // Verificar si hay conflictos
      if (this.grid[y][x] !== "" && this.grid[y][x] !== word[i]) {
        return false; // Conflicto con otra palabra
      }
    }

    /*     // Verificar adyacencia ANTE SY DESPUES
    if (isHorizontal) {
      if (this.grid[startY][startX - 1]) {
        return false;
      }
      if (this.grid[startY][startX + len]) {
        return false;
      }
    } else {
      if (this.grid[startY - 1][startX]) {
        return false;
      }
      if (this.grid[startY + len][startX]) {
        return false;
      }
    }
    // Verificar adyacencia en la misma dirección
    let touch = 0;
    for (let i = 0; i < len; i++) {
      if (isHorizontal) {
        // NO PUEDES TENER CELDAS ARRIBA NI ABAJO en los bordes
        let x = startX + i;
        let y = startY;
        if (this.grid[y + 1][x] || this.grid[y - 1][x]) {
          touch++;
        }
      } else {
        let x = startX;
        let y = startY + i;
        if (this.grid[y][x + 1] || this.grid[y][x - 1]) {
          touch++;
        }
      }
      if (touch > 1) {
        return false;
      }
    } */

    return true; // Se puede colocar la palabra
  }

  placeWord(word, startX, startY, direction) {
    const len = word.length;
    this.wordsOnGrid[word] = { startX, startY, direction, cells: [] };
    // Colocar la palabra en el grid
    for (let i = 0; i < len; i++) {
      const x = direction === "horizontal" ? startX + i : startX;
      const y = direction === "horizontal" ? startY : startY + i;

      this.grid[y][x] = word[i];
      this.gridCells[y][x] = this.drawWordRect(x, y, word[i]);
      this.wordsOnGrid[word].cells.push({
        x,
        y,
      });
    }
  }
  showWord(word) {
    if (!this.wordsOnGrid[word]) return;
    const holder = this.wordsOnGrid[word];

    holder.cells.map((position) => {
      const { y, x } = position;
      const cell = this.gridCells[y][x];
      cell.show();
    });
  }

  drawWordRect(x, y, letter) {
    console.log(x, y);
    const borderWidth = 1;
    const innerCell = cellSize - borderWidth * 2;
    const letterText = this.add
      .text(innerCell / 2, innerCell / 2, letter, {
        fontSize: "32px",
        color: "#111111",
        stroke: "#000", // Color del borde
        strokeThickness: 3, // Grosor del borde
      })
      .setOrigin(0.5);
    const cellContainer = this.add.container(x * cellSize, y * cellSize, [
      this.add.rectangle(0, 0, cellSize, cellSize, 0x111111, 1).setOrigin(0),
      this.add
        .rectangle(borderWidth, borderWidth, innerCell, innerCell, 0xffffff, 1)
        .setOrigin(0),
      letterText,
    ]);

    letterText.setVisible(false);

    this.gridContainer.add(cellContainer);
    return {
      x,
      y,
      show: () => {
        letterText.setVisible(true);
        this.tweens.add({
          targets: letterText,
          scale: 2,
          yoyo: true,
          ease: "bounce",
          duration: 100,
        });
      },
    };
  }
}

function getUniqueLetters(words) {
  const uniqueLetters = new Set();

  words.forEach((word) => {
    for (let letter of word) {
      uniqueLetters.add(letter);
    }
  });

  return Array.from(uniqueLetters);
}
