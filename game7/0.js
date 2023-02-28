import createAudioNote, { NOTES } from "./AudioNote.js";

var config = {
  type: "customEnvironment",
  customEnvironment: true,
  canvas: document.querySelector(".game__canvas"),
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
const audioNotes = createAudioNote();
function random(m1, m2) {
  return Phaser.Math.Between(m1, m2);
}

function addBeatPoint(emitter) {
  if (this.beatsRemain > 0) {
    return;
  }
  var offset = 150;
  let center = {
    x: random(offset, config.width - offset),
    y: random(offset, config.height - offset),
  };
  this.beatsRemain = random(1, 4);
  let i = 0 + this.beatsRemain;
  let angles = [0, 90, 180, 270];
  let radius = random(30, 50);
  while (i > 0) {
    let angle =
      (angles.splice(random(0, angles.length - 1), 1)[0] * Math.PI) / 180;

    let vx = radius * Math.cos(angle);
    let vy = radius * Math.sin(angle);

    let img = this.add.image(center.x + vx, center.y + vy, "ball");
    img.setInteractive();
    img.setDisplaySize(radius, radius);
    emitter.setPosition(img.x, img.y);
    emitter.explode(10);
    emitter.setSpeed(500);
    emitter.setBlendMode(Phaser.BlendModes.ADD);
    i--;
  }
  this.sound.play();
}

function preload() {
  this.load.image("ball", "ball.png");
  this.load.audio("beat", "./beat.wav");
  this.load.audio("sound", "./sound.wav");
}

function create() {
  this.beatsRemain = 0;
  window.$scene = this;
  this.beat = this.sound.add("beat", { loop: false, volume: 0.2 });
  this.sound = this.sound.add("sound", { loop: false, volume: 0.2 });
  let text = this.add
    .text(config.width / 2, config.height / 2, "Click to START")
    .setOrigin(0.5);
  let g = this.make.graphics({ add: false });
  g.fillStyle(0xffffff);
  g.fillCircle(4, 4, 4);
  g.generateTexture("dust", 8, 8);
  g.clear();
  g.destroy();
  window.g = g;
  let particles = this.add.particles("dust");
  let emitter = particles.createEmitter({
    alpha: { start: 1, end: 0 },
    scale: { start: 0.5, end: 1.5 },
    speed: 100,
  });
  emitter.stop();
  let indexNote = 0;
  let indexOctave = 1;
  let octaveDir = 1;
  let started = false;

  this.input.once("pointerdown", (p, gameObjects) => {
    started = true;
    addBeatPoint.call(this, emitter);

    text.destroy();
  });
  this.input.on("pointermove", (p, gameObjects) => {
    if (!started) {
      return;
    }
    if (gameObjects.length === 0) {
      return;
    }
    gameObjects[0].destroy();
    let { x, y } = p;
    emitter.setPosition(x, y);
    emitter.setSpeed(100);
    emitter.explode(90);
    emitter.setBlendMode(Phaser.BlendModes.ADD);
    this.beatsRemain -= 1;
    // this.beat.play();
    audioNotes.play(NOTES[indexNote], indexOctave);
    indexNote++;
    if (indexNote > NOTES.length - 1) {
      indexNote = 0;
      indexOctave += octaveDir;
    }
    if (indexOctave < 0 || indexOctave > 10) {
      octaveDir *= -1;
    }
    
    console.log(indexOctave, octaveDir);
    //
    addBeatPoint.call(this, emitter);
  });
  window.emitter = emitter;
}

function update() {}
