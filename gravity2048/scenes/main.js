import { COLORS, animals, shapes } from "../constants.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super({
      key: "main",
      physics: {
        matter: {
        // debug: true,
          gravity: { y: 3 },
        },
      },
    });
  }

  __onScoreChange = () => null;
  __updateNextInfo = () => null;

  create() {
    window.main = this;
    this.points = 0;
    this.current = null;
    this.pointer = { x: 0, y: 0 };
    this.nextPointRnd = this.getRandPoint();
    this.collisionPool = {};
    this.createParticleEmitter();
    this.createNextPointInfo();
    this.createScore();
    this.createGameBounds();
    this.createMusicBg();
    //
    this.initPointerListener();
    this.createIntro().then(() => {});
    this.createNew(this.scale.width / 2);
  }
  createMusicBg() {
    const img_size = 16;
    const music = this.sound.add("music");
    music.setVolume(0.3);
    music.loop = true;
    music.play();
    const toggleSound = () => {
      if (music.isPlaying) {
        music.stop();
        control.setTexture("sound-muted");
      } else {
        music.play();
        control.setTexture("sound-playing");
      }
    };
    const control = this.add.image(
      this.scale.width - img_size,
      this.scale.height - img_size,
      "sound-playing"
    );
    const rate = img_size / control.width;
    control.setDisplaySize(rate * control.width, rate * control.height);
    control.setInteractive();
    control.on("pointerdown", (event) => {
      toggleSound();
    });
  }
  createParticleEmitter() {
    this.emitter = this.add
      .particles(0, 0, "bubbles", {
        frame: ["elec1", "elec2", "elec3", "silverbubble"],
        angle: { start: 0, end: 360, steps: 32 },
        lifespan: 200,
        speed: 300,
        quantity: 32,
        scale: { start: 0.5, end: 0 },
        emitting: false,
      })
      .setDepth(1000);
  }
  createIntro() {
    const img_size = 32;
    const promises = [];
    const createCircAnim = (idx, x, y) => {
      const image = this.add
        .image(x, y, "animals", animals[idx] + ".png")
        .setOrigin(0, 0.5);

      let rate = img_size / image.width;
      image.setDisplaySize(rate * image.width, rate * image.height);
      image.setAlpha(0);
      this.tweens.add({
        targets: image,
        alpha: 1,
        delay: idx * 100,
        duration: 300,
      });
      promises.push(
        new Promise((resolve) => {
          this.tweens.add({
            targets: image,
            y: "-=90",
            ease: "sine.inOut",
            yoyo: true,
            delay: idx * 100,
            duration: 600,
            onComplete: resolve,
          });
        })
      );
      return image;
    };
    const container = this.add.container(16, this.scale.height / 2, []);

    for (let i = 0; i < 11; i++) {
      container.add(createCircAnim(i, i * img_size + 8 * i, 0));
    }
    return Promise.all(promises).then(() => {
      return new Promise((resolve) => {
        this.tweens.add({
          targets: container,
          y: 16,
          ease: "sine.inOut",
          duration: 600,
          onComplete: resolve,
        });
      });
    });
  }
  getSound(soundName) {
    if (this.sound.get(soundName)) {
      return this.sound.get(soundName);
    }
    return this.sound.add(soundName);
  }
  playNew(soundName) {
    let audio = this.sound.add(soundName);
    audio.play();
    setTimeout(() => {
      audio.stop();
      audio.destroy();
    }, audio.duration * 1000);
    return audio;
  }
  playOnce(soundName) {
    let audio = this.getSound(soundName);
    if (!audio.isPlaying) {
      audio.play();
    }
    return audio;
  }
  addScore(points) {
    this.points += points;
    this.__onScoreChange(points);
  }
  getRandPoint() {
    let total = 0;

    for (let i in this.collisionPool) {
      if (this.collisionPool[i].length > 0) {
        total += this.collisionPool[i].length;
      }
    }
    let max = 2 + parseInt(total / 4);
    return Phaser.Math.RND.between(1, max);
  }
  initPointerListener() {
    this.input.on("pointermove", (pointer) => {
      if (!this.current || this.current.dropped) {
        return;
      }
      this.current.x = pointer.x;
      this.pointer.x = pointer.x;
    });
    this.input.on("pointerdown", (pointer, gameobject) => {
      if (!this.current || gameobject.length > 0) {
        return;
      }
      this.input.once("pointerup", (pointer) => {
        if (!this.current) {
          return;
        }
        this.current.dropped = true;
        this.pointer.x = pointer.x;
        this.addScore(this.current.points);
        this.current.setIgnoreGravity(false);
        this.current.setAngle(Phaser.Math.RND.between(-45, 45));
        /* this.tweens.add({
          targets: this.current,
          angle: Phaser.Math.RND.between(-45, 45),
          duration: 300,
        }); */
        this.current = null;
        setTimeout(() => {
          this.createNew(pointer.x);
        }, 700);
      });
    });
  }
  createNextPointInfo() {
    const img_size = 32;
    const bg = this.add
      .rectangle(
        -12,
        0,
        120,
        48,
        Number(COLORS.secundary.replace("#", "0x")),
        1
      )
      .setOrigin(0, 0.5);
    const image = this.add
      .image(0, 0, "animals", animals[this.nextPointRnd - 1] + ".png")
      .setOrigin(0, 0.5);

    let rate = img_size / image.width;
    image.setDisplaySize(rate * image.width, rate * image.height);
    const text = this.add
      .text(image.x + image.displayWidth + 8, 0, "next", {
        fontFamily: "main-font",
        fontSize: 16,
        color: COLORS.text,
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0, 0.5);
    const container = this.add.container(this.scale.width - 100, 60, [
      bg,
      image,
      text,
    ]);
    this.__updateNextInfo = () => {
      image.setFrame(animals[this.nextPointRnd - 1] + ".png");
    };
  }
  createScore() {
    const text = this.add
      .text(this.scale.width / 2, 40, "0", {
        fontFamily: "main-font",
        fontSize: 48,
        color: COLORS.text,
      })
      .setShadow(2, 2, "#333333", 2, false, true);
    text.x -= text.width / 2;
    this.__onScoreChange = () => {
      text.setText([this.points]);
    };
  }
  createGameBounds() {
    this.matter.world.setBounds(
      10,
      0,
      this.scale.width - 20,
      this.scale.height - 60
    );

    this.add
      .rectangle(
        0,
        this.scale.height - 60,
        this.scale.width,
        100,
        Number(COLORS.secundary.replace("#", "0x")),
        1
      )
      .setOrigin(0);
  }
  validateCollision(bodyA, bodyB) {
    if (!(bodyA && bodyB && bodyA.scene && bodyB.scene)) {
      return;
    }
    let dist = Phaser.Math.Distance.BetweenPoints(
      { x: bodyA.x, y: bodyA.y },
      { x: bodyB.x, y: bodyB.y }
    );

    dist -= bodyA.radius;
    dist -= bodyB.radius;
    if (dist > 8) {
      return;
    }

    this.validateMerge(bodyA, bodyB);
  }
  validateMerge(objectA, objectB) {
    if (!objectA.points || !objectB.points) {
      return false;
    }
    if (objectA.points !== objectB.points) {
      return false;
    }
    let mid = {
      x: objectA.x + (objectB.x - objectA.x) / 2,
      y: objectA.y + (objectB.y - objectA.y) / 2,
    };
    let newcir = this.createCirc(mid.x, mid.y, objectA.points + 1);
    newcir.dropped = true;
    this.matter.world.remove(objectA.body);
    this.matter.world.remove(objectB.body);
    objectA.eat();
    objectB.eat();
    this.playNew("pop");
    this.addScore(objectA.points);
    this.emitter.emitParticleAt(mid.x, mid.y);
    return true;
  }
  createNew(x) {
    const rndpoints = this.nextPointRnd;
    const circle = this.createCirc(x, 120, rndpoints);
    circle.setIgnoreGravity(true);
    circle.body.velocity.y = 0;

    circle.body.onCollideCallback = (event) => {
      if (circle.body.velocity.y > 4) {
        this.playOnce("drop");
      }
    };
    this.current = circle;
    this.nextPointRnd = this.getRandPoint();
    this.__updateNextInfo();
  }
  createCirc(x, y, points = 1) {
    const picked = animals[points - 1];
    const radius = 16 + 16 * points;
    const configs = {};

    let circle = this.matter.add.sprite(x, y, "animals", picked + ".png");

    let rate = radius / circle.width;

    circle.setDisplaySize(rate * circle.width, rate * circle.height);
    circle.setCircle(radius / 2);

    if (shapes.hasOwnProperty(picked)) {
      configs.shape = shapes[picked];
      circle.setBody(shapes[picked]);
    } else {
      configs.shape = shapes.default;
    }

    circle.setFriction(0.1).setBounce(0.5, 0.1);

    circle.radius = radius / 2;
    circle.points = points;
    //  circle.setTint(COLOR_BY_POINTS[points]);
    circle.eat = () => {
      for (let i in this.collisionPool[points]) {
        if (this.collisionPool[points][i] === circle) {
          this.collisionPool[points].splice(i, 1);
          break;
        }
      }
      circle.destroy();
    };
    if (!this.collisionPool[points]) {
      this.collisionPool[points] = [];
    }
    this.collisionPool[points].push(circle);
    return circle;
  }
  update() {
    for (let i in this.collisionPool) {
      for (let j in this.collisionPool[i]) {
        let current = this.collisionPool[i][j];
        if (current.dropped) {
          for (let k in this.collisionPool[i]) {
            if (k !== j && this.collisionPool[i][k].dropped) {
              this.validateCollision(current, this.collisionPool[i][k]);
            }
          }
        }
      }
    }
  }
}
