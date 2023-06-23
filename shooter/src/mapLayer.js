import { map_maxColumns, map_maxRows } from "./constants.js";
import RESOURCES from "./resources.js";

const gridSize = 16,
  maxColumns = map_maxColumns, // REALLY HIGH NUMBER
  maxRows = map_maxRows; // REALLY HIGH NUMBER

var currentInstance = null;

export default class MapLayer {
  constructor(scene, { frameSize }) {
    const mapConfig = {
      name: "tilemapname",
      tileWidth: gridSize,
      tileHeight: gridSize,
      width: maxColumns,
      height: maxRows,
    };
    const map = scene.make.tilemap(mapConfig);
    const tileset = map.addTilesetImage(
      RESOURCES.name,
      null,
      frameSize,
      frameSize
    );
    this.layers = [
      map
        .createBlankLayer("layer1", tileset)
        .setOrigin(0)
        .setCollisionByProperty({ collides: true }),
    ];
    this.walkableframes = [];
    currentInstance = this;
  }
  getGridSize() {
    return gridSize;
  }
  static getGridSize() {
    return gridSize;
  }
  static isCellWall(col, row) {
    const tileInfo = currentInstance.layers[0].getTileAt(col, row);
    if (!tileInfo) {
      return false;
    }
    return currentInstance.walkableframes.includes(tileInfo.index);
  }
  clearLayers() {
    // i= idx column
    // j = idx row
    for (let i = 0; i < maxColumns; i++) {
      for (let j = 0; j < maxColumns; j++) {
        this.layers.forEach((layer) => {
          layer.putTileAt(0, i, j);
        });
      }
    }
  }
  putTileAt(frame, col, row) {
    this.layers[0].putTileAt(frame, col, row);
  }
  getTileAtWorldXY(x, y) {
    return this.layers.map((layer) => layer.getTileAtWorldXY(x, y));
  }
  renderData(matrixList, walkableframes) {
    //
    this.walkableframes = walkableframes;
    let unwalkableFramesDic = {};
    this.clearLayers();
    matrixList.forEach((data, idx) => {
      const layer = this.layers[idx];
      data.forEach((columnArray, row) => {
        columnArray.forEach((frame, col) => {
          if (!walkableframes.includes(frame)) {
            unwalkableFramesDic[frame] = frame;
          }
          layer.putTileAt(frame, col, row);
        });
      });
    });

    let unwalkableFrames = Object.keys(unwalkableFramesDic).map((num) =>
      parseInt(num)
    );

    this.layers.forEach((layer) => layer.setCollision(unwalkableFrames, true));
  }
}
