const gridSize = 64,
  maxColumns = 100, // REALLY HIGH NUMBER
  maxRows = 100, // REALLY HIGH NUMBER
  trueSpriteSize = 16;


export default class MapLayer {
  constructor(scene, { frameSize}) {
    const mapConfig = {
      name: "tilemapname",
      tileWidth: gridSize,
      tileHeight: gridSize,
      width: maxColumns,
      height: maxRows,
    };
    const map = scene.make.tilemap(mapConfig);
    const tileset = map.addTilesetImage(
      "tilemap",
      null,
      frameSize,
      frameSize
    );
    this.layers = [
        map.createBlankLayer("layer1", tileset).setOrigin(0)
    ];
  }
  static getGridSize(){
    return gridSize
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
  renderData(matrixList) {
    //
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
