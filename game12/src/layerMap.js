import { onResizeUntilDestroy } from "./onResize.js";

export default class LayerMap {
  constructor(scene) {
    const map = scene.make.tilemap({
      name: "anything",
      tileWidth: 32,
      tileHeight: 32,
      width: 64,
      height: 64,
    });
    const tileset = map.addTilesetImage("world", null, 16, 16);
    const layers = [map.createBlankLayer("layer1", tileset).setOrigin(0)];

    this.getLayer = () => {
      return layers[0];
    };
    console.log(map);
    onResizeUntilDestroy(layers[0], () => {
      scene.scale.width;
    });
  }
}
