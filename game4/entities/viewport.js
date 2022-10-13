export default class Viewport {
  constructor(context, width, height, center = { x: 0, y: 0 }) {
    this.context = context;
    this.center = center;
    this.width = width;
    this.height = height;
    this.scale = 1;
    // Scroll to the center
    this.cam = context.cameras.main;
    this.cam.setBounds(0, 0, width, height);
    this.cam.scrollX = center.x - this.cam.width * 0.5;
    this.cam.scrollY = center.y - this.cam.height * 0.5;
  }
  setCenter(_center = { x: 0, y: 0 }) {
    this.center = _center;
  }
  setScale(_scale) {
    this.scale = _scale;
    console.log(_scale)
    this.cam.setBounds(0, 0, this.width * this.scale, this.height * this.scale);
  }
  update() {
    // Smooth follow
    var smoothFactor = 1;
    this.cam.scrollX =
      smoothFactor * this.cam.scrollX +
      (1 - smoothFactor) * (this.center.x - this.cam.width * 0.5);
    this.cam.scrollY =
      smoothFactor * this.cam.scrollY +
      (1 - smoothFactor) * (this.center.y - this.cam.height * 0.5);
  }
}