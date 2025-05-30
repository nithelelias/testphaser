import { COLORS, GRID } from "../src/constants/values.js";
import { CURSOR, PLAYERS, WORLD } from "../src/constants/data.js";
import Pice from "../src/components/piece.js";
import { restoreFromLocal } from "../src/components/localStore.js";
import WorldLayer from "../src/components/worldLayer.js";
import Pallete from "../src/components/pallete.js";
import Button from "../src/components/button.js";

export default class Main extends Phaser.Scene {
  static current = null;
  worldLayer;
  centerGrid = {
    x: 0,
    y: 0,
  };
  constructor() {
    super("main");
    restoreFromLocal();
    window.main = this;
    Main.current = this;
  }

  create() {
    this.current = this;

    this.scene.run("hub", { main: this });
    this.createGrid();
    this.listenMouseCameraMove();
    this.createPieces();
    this.initWorldPaint();
    this.initPaintMode();

    this.cameras.main.scrollX = CURSOR.x;
    this.cameras.main.scrollY = CURSOR.y;
    this.cameras.main.zoom = CURSOR.zoom;
  }
  centerOnGrid() {
    this.cameras.main.pan(
      this.centerGrid.x,
      this.centerGrid.y,
      300,
      "Sine.easeInOut"
    );
  }
  createGrid() {
    const gridSize = GRID.size;
    const cols = GRID.cols;
    const rows = GRID.rows;

    // Create graphics object for drawing grid
    const graphics = this.add.graphics();
    graphics.lineStyle(2, COLORS.color1, 0.15);

    // Calculate total grid dimensions
    const gridWidth = cols * gridSize;
    const gridHeight = rows * gridSize;

    // Draw vertical lines
    for (let x = 0; x <= cols; x++) {
      graphics.moveTo(x * gridSize, 0);
      graphics.lineTo(x * gridSize, gridHeight);
    }

    // Draw horizontal lines
    for (let y = 0; y <= rows; y++) {
      graphics.moveTo(0, y * gridSize);
      graphics.lineTo(gridWidth, y * gridSize);
    }

    graphics.strokePath();

    // Center camera on grid
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    this.centerGrid = {
      x: centerX,
      y: centerY,
    };
  }
  listenMouseCameraMove() {
    // Add bitmap text to the scene

    let isMouseDown = false;
    let startX;
    let startY;
    let lastTimeoutToSave;
    const updateCursor = () => {
      clearTimeout(lastTimeoutToSave);
      lastTimeoutToSave = setTimeout(() => {
        CURSOR.zoom = this.cameras.main.zoom;
        CURSOR.x = this.cameras.main.scrollX;
        CURSOR.y = this.cameras.main.scrollY;
      }, 200);
    };
    // Listen for mouse down event
    this.input.on("pointerdown", (pointer) => {
      if (pointer.middleButtonDown()) {
        isMouseDown = true;
        startX = pointer.x;
        startY = pointer.y;
      } else {
        /* const worldPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );
        const col = Math.floor(worldPoint.x / GRID.size);
        const row = Math.floor(worldPoint.y / GRID.size);
        console.log({ col, row }); */
      }
    });

    // Listen for mouse up event
    this.input.on("pointerup", () => {
      isMouseDown = false;
    });

    // Listen for mouse move event
    this.input.on("pointermove", (pointer) => {
      if (isMouseDown) {
        // Calculate distance moved
        const deltaX = startX - pointer.x;
        const deltaY = startY - pointer.y;

        // Move camera
        this.cameras.main.scrollX += deltaX;
        this.cameras.main.scrollY += deltaY;

        // Update start position
        startX = pointer.x;
        startY = pointer.y;
        updateCursor();
      }
    });

    // Listen for mouse wheel event
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // Set zoom limits
      const minZoom = 0.5;
      const maxZoom = 2;
      const zoomFactor = 0.1;

      // Calculate new zoom level
      const newZoom =
        this.cameras.main.zoom + (deltaY > 0 ? -zoomFactor : zoomFactor);

      // Apply zoom if within limits
      if (newZoom >= minZoom && newZoom <= maxZoom) {
        this.cameras.main.zoom = newZoom;
        updateCursor();
      }
    });
  }
  createPieces() {
    PLAYERS.forEach((item, idx) => {
      const pice = new Pice(this, 0, 0, 1, item.frame);
      pice.setData("index", idx);
      pice.sprite.setTint(item.color);
      pice.putAt(item.col, item.row);
      pice.setInteractive({ cursor: "grab" });
    });
    let dragging = false;
    this.input.on("pointerover", (pointer, gameObjects) => {
      if (dragging) return;
      if (gameObjects.length === 0) return;
      if (!(gameObjects[0] instanceof Pice)) return;
      gameObjects[0].setScale(1.1);
    });
    this.input.on("pointerout", (pointer, gameObjects) => {
      if (dragging) return;
      if (gameObjects.length === 0) return;
      if (!(gameObjects[0] instanceof Pice)) return;
      gameObjects[0].setScale(1);
    });
    this.input.on("pointerdown", (pointer, gameObjects) => {
      if (gameObjects.length === 0) return;
      if (!(gameObjects[0] instanceof Pice)) return;
      if (dragging) return;
      dragging = true;

      this.initDragAndDropPiece(gameObjects[0]).then(() => {
        dragging = false;
        const idx = gameObjects[0].getData("index");
        PLAYERS[idx].col = gameObjects[0].col;
        PLAYERS[idx].row = gameObjects[0].row;
      });
    });
  }

  initDragAndDropPiece(piece) {
    return new Promise((resolve) => {
      const onDrag = (pointer, dragX, dragY) => {
        piece.x = dragX;
        piece.y = dragY;
      };
      this.input.setDraggable(piece);
      this.input.once("dragstart", (pointer, dragX, dragY) => {
        piece.setDepth(100);
        piece.setScale(1.1);
      });
      this.input.once("dragend", () => {
        const col = Math.floor(piece.x / GRID.size);
        const row = Math.floor(piece.y / GRID.size);
        piece.putAt(col, row);
        piece.off("drag", onDrag);
        resolve();
      });

      piece.on("drag", onDrag);
    });
  }
  initWorldPaint() {
    this.worldLayer = new WorldLayer(this, GRID.size);
    this.updateWorldLayer();
  }

  updateWorldLayer() {
    for (let key in WORLD) {
      const [col, row] = key.split("-");
      const frame = WORLD[key];
      this.worldLayer.putFrameAt(col, row, frame);
    }
  }
  initPaintMode() {
    let frame = 20;
    const hubScene = this.scene.get("hub");
    const pallete = new Pallete(hubScene, {
      onFrameSelected: (_frame) => {
        frame = _frame;
      },
    });
    const STATES = {
      idle: "idle",
      draw: "draw",
      erase: "erese",
    };
    pallete.setVisible(false);
    let down = STATES.idle;

    const draw = (col, row) => {
      const key = `${col}-${row}`;
      WORLD[key] = frame;
      this.updateWorldLayer();
    };
    const erase = (col, row) => {
      const key = `${col}-${row}`;
      WORLD[key] = null;
      delete WORLD[key];
      this.worldLayer.removeFrameAt(col, row);
    };
    const onPointerDown = (pointer) => {
      if (pointer.middleButtonDown()) return;
      down = pointer.leftButtonDown() ? STATES.draw : STATES.erase;
    };
    const onPointerUp = (pointer) => {
      if (pointer.middleButtonDown()) return;
      down = STATES.idle;
    };
    const onPointerMove = (pointer) => {
      if (down === STATES.idle) return;

      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const col = Math.floor(worldPoint.x / GRID.size);
      const row = Math.floor(worldPoint.y / GRID.size);

      if (down === STATES.erase) {
        erase(col, row);
      } else {
        draw(col, row);
      }
    };

    let painting = false;
    const btnPaint = new Button(
      hubScene,
      this.scale.width - 70,
      this.scale.height - 20,
      "pintar",
      () => {
        painting = !painting;
        if (painting) {
          startPaint();
        } else {
          stopPaint();
        }
      }
    );
    const startPaint = () => {
      btnPaint.setText("parar");
      pallete.setVisible(true);
      this.input.on("pointerdown", onPointerDown);
      this.input.on("pointerup", onPointerUp);
      this.input.on("pointermove", onPointerMove);
    };
    const stopPaint = () => {
      btnPaint.setText("pintar");
      pallete.setVisible(false);
      this.input.off("pointerdown", onPointerDown);
      this.input.off("pointerup", onPointerUp);
      this.input.off("pointermove", onPointerMove);
    };
  }
}
