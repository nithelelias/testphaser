export default function (scene) {
  if (!scene.textures.list.hasOwnProperty("rect")) {
    let g = scene.make.graphics({ add: false });
      g.fillStyle(0xffffff);
    g.lineStyle(0x000000);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture("rect", 8, 8);
    g.clear();
    g.strokeRect(0, 0, 8, 8);
    g.generateTexture("border_rect", 8, 8);
    g.destroy();
  }
}
