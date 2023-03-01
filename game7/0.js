import createAudioNote, { NOTES } from "./AudioNote.js";

var config = {
  type: "customEnvironment",
  customEnvironment: true,
  canvas: document.querySelector(".game__canvas"),
  width: window.innerWidth,
  height: window.innerHeight,

  scene: {
    preload,
    create,
    update,
  },
};
var path = [];
var game = new Phaser.Game(config);
const audioNotes = createAudioNote();
function random(m1, m2) {
  return Phaser.Math.Between(m1, m2);
}

function Deffered() {
  this.promise = new Promise((resolve) => {
    this.resolve = resolve;
  });
}
function preload() {
  this.load.image("ball", "ball.png");
  this.load.audio("beat", "./beat.wav");
  this.load.audio("sound", "./sound.wav");
}
function addProgressBar(scene, duration = 5000) {
  let deferred = new Deffered();
  let bar = scene.add.image(0, config.height - 30, "bar").setOrigin(0, 0.5);
  let holder = { value: 0 };
  scene.add.tween({
    targets: holder,
    value: 1,
    onUpdate: () => {
      bar.setDisplaySize(config.width * holder.value, 30);
    },
    onComplete: () => {
      deferred.resolve();
      bar.destroy();
    },
    duration,
  });
  return deferred.promise;
}

function addMessages(scene, messages) {
  let deferred = new Deffered();
  let text = scene.add
    .text(config.width / 2, config.height / 2, messages[0])
    .setOrigin(0.5);
  let pointerDownListener = (p) => {
    if (messages.length > 0) {
      text.setText(messages.shift());
      return;
    }
    if (text) {
      text.destroy();
      scene.input.removeListener("pointerdown", pointerDownListener);
      deferred.resolve();
    }
  };
  scene.input.on("pointerdown", pointerDownListener, scene);
  return deferred.promise;
}
function addTextAnimations(scene, messages, yoyo = false, duration = 500) {
  let deferred = new Deffered();
  let text = scene.add
    .text(config.width / 2, config.height / 2, messages[0])
    .setOrigin(0.5);

  let nextMessage = () => {
    text.setText(messages.shift());
    text.setAlpha(1);
    text.setScale(1);
    scene.add.tween({
      targets: text,
      alpha: 0,
      scale: 3,
      yoyo,
      onComplete: () => {
        if (messages.length < 1) {
          text.destroy();
          deferred.resolve();
        } else {
          nextMessage();
        }
      },
      duration,
    });
  };
  nextMessage();

  return deferred.promise;
}
function stateToCreatePath() {
  let deferred = new Deffered();

  let pointerDownListener = (p) => {
    let img = this.add.image(p.x, p.y, "ball");
    path.push({ x: p.x, y: p.y });

    this.add.tween({
      targets: img,
      alpha: 0,
      onComplete: () => {
        img.destroy();
      },
      duration: 300,
    });
  };
  this.input.on("pointerdown", pointerDownListener, this);
  let endState = () => {
    this.input.removeListener("pointerdown", pointerDownListener);
    deferred.resolve();
  };

  addProgressBar(this).then(endState);
  return deferred.promise;
}
function stateToBeat() {
  let deferred = new Deffered();

  this.center = {
    x: parseInt(config.width / 2),
    y: parseInt(config.height / 2),
  };
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
  let img;
  let addNewBeatPoint = () => {
    if (path.length < 1) {
      return;
    }
    let point = path.shift();
    let radius = random(30, 50);
    img = this.add.image(point.x, point.y, "ball");
    img.setInteractive();
    img.setDisplaySize(radius, radius);
    emitter.setPosition(img.x, img.y);
    emitter.explode(10);
    emitter.setSpeed(500);
    emitter.setBlendMode(Phaser.BlendModes.ADD);

    this.sound.play();
  };

  let pointerMoveListener = (p, gameObjects) => {
    if (gameObjects.length === 0) {
      return;
    }
    gameObjects[0].destroy();
    let { x, y } = p;
    emitter.setPosition(x, y);
    emitter.setSpeed(100);
    emitter.explode(90);
    emitter.setBlendMode(Phaser.BlendModes.ADD);

    // this.beat.play();
    audioNotes.play(NOTES[indexNote], indexOctave);
    indexNote++;
    if (indexOctave > 5) {
      octaveDir = -1;
      indexOctave = 5;
    }
    if (indexOctave < 1) {
      octaveDir = 1;
      indexOctave = 1;
    }
    if (indexNote > NOTES.length - 1) {
      indexNote = 0;
      indexOctave += octaveDir;
    }
    addNewBeatPoint();
  };
  this.input.on("pointermove", pointerMoveListener, this);
  let endState = () => {
    this.input.removeListener("pointermove", pointerMoveListener, this);
    deferred.resolve();
    img.destroy();
  };
  addNewBeatPoint();
  addProgressBar(this, 7000).then(endState);
  return deferred.promise;
}

async function runStates() {
  await addMessages(this, [
    ["Hi!", "click to continue"],
    ["first click any where to add a point of use", "click to continue"],
  ]);
  await addTextAnimations(this, ["Ready", "SET", ["GO", "click MF"]]);
  await stateToCreatePath.call(this);
  await addTextAnimations(this, ["ESPERA ", "Espera", "espera"]);
  await addTextAnimations(this, ["calma "], true, 1000);
  await addMessages(this, [
    "NOW IN SPANISH",
    "toca todas las bolas hasta ganar!!",
    "sino pierdes",
  ]);
  await addTextAnimations(this, ["Ready", "SET", ["GO", "TOCALOS MF"]]);
  await stateToBeat.call(this);
  if (path.length > 0) {
    await addMessages(this, [["UFF TE FALTARON", path.length]]);
  } else {
    await addTextAnimations(this, ["GANASTE ", "TENEMOS UN GANADOR!!!"], true);
  }
  await addMessages(this, ["va de nuevo?", "haz click para repetir"]);
  path = [];
  setTimeout(() => {
    runStates.call(this);
  }, 100);
}
function create() {
  this.top_text = this.add.text(20, 20, "total Points: N").setOrigin(0);
  // this.top_text.updateText = function () {
  //   console.log("UPDATE PATH", path.length, this);
  // };
  this.beat = this.sound.add("beat", { loop: false, volume: 0.2 });
  this.sound = this.sound.add("sound", { loop: false, volume: 0.2 });

  let g = this.make.graphics({ add: false });
  g.fillStyle(0xff0000);
  g.fillRect(0, 0, 10, 10);
  g.generateTexture("bar", 8, 8);
  g.clear();

  g.fillStyle(0xffffff);
  g.fillCircle(4, 4, 4);
  g.generateTexture("dust", 8, 8);
  g.clear();
  g.destroy();
  runStates.call(this);
}
function update() {
  this.top_text.setText("total points: " + path.length);
}
