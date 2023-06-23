export default function generateCircleTexture(scene) {
  if (!scene.textures.list.hasOwnProperty("circle")) {
    let g = scene.make.graphics({ add: false });
    let radius = 32,
      diameter = radius * 2;
    g.fillStyle(0xffffff);
    g.fillCircle(radius, radius, radius);
    g.generateTexture("circle", diameter, diameter);
    
    g.clear();
    radius = 8;
    diameter = radius * 2;
    g.fillStyle(0xffffff);
    g.fillCircle(radius, radius, radius);
    g.generateTexture("circle-small", diameter, diameter);

    g.destroy();
  }
}
