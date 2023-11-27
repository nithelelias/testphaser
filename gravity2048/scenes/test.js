export default class Test extends Phaser.Scene {
  constructor() {
    super("test");
    window.test = this;
  }
  create() {
    this.add.image(100, 100, "star");
    this.emitter = this.add.particles(0, 0, "star", {
      angle: { start: 0, end: 360, steps: 32 },
      lifespan: 1500,
      speed: 400,
      quantity: 32,
      scale: { start: 0.5, end: 0 },
      //emitting: false,
    });
    console.log("TEST START");

    this.input.on("pointerdown", (pointer) => {
      this.emitter.emitParticleAt(pointer.x, pointer.y);
    });
  }
}
