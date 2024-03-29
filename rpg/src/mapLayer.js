import RESOURCES from "./resources.js";

const gridSize = 64,
  maxColumns = 100, // REALLY HIGH NUMBER
  maxRows = 100, // REALLY HIGH NUMBER
  trueSpriteSize = 16;
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
    this.layers = [map.createBlankLayer("layer1", tileset).setOrigin(0)];
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
  renderData(matrixList, walkableframes) {
    //
    this.walkableframes = walkableframes;
    this.clearLayers();
    matrixList.forEach((data, idx) => {
      const layer = this.layers[idx];
      data.forEach((columnArray, row) => {
        columnArray.forEach((frame, col) => {
          layer.putTileAt(frame, col, row);
        });
      });
    });
  }
}
