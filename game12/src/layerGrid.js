import onResize, { onResizeUntilDestroy } from "./onResize.js";

const GRID_CONFIG = {
  offset: [0, 0],
  size: 32,

  color1: "0x141414", // 0x999999;

  color2: 0x101e45,
  alphaColor1: 1,
  alphaColor2: 1,
};
export default class LayerGrid extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add
        .grid(
          GRID_CONFIG.offset[0],
          GRID_CONFIG.offset[1],
          0,
          0,
          GRID_CONFIG.size,
          GRID_CONFIG.size,
          GRID_CONFIG.color1,
          GRID_CONFIG.alphaColor1,
          GRID_CONFIG.color2,
          GRID_CONFIG.alphaColor2
        )
        .setOrigin(0),
    ]);
    scene.add.existing(this);
    this.grid = this.list[0];
    this.grid.fit = () => {
      this.grid.width = scene.scale.width;
      this.grid.height = scene.scale.height;
    };
    // on update fit grids
    this.grid.fit();
    ////
    onResizeUntilDestroy(this,()=>{
      this.grid.fit();
    }) 
  }
}
