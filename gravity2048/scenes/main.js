import { COLORS, animals, shapes } from "../constants.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super({
      key: "main",
      physics: {
        matter: {
          //debug: true,
          gravity: { y: 3 },
        },
      },
    });
  }
  START_Y = 220;
  __unbind_listener = () => null;
  __onScoreChange = () => null;
  __updateNextInfo = () => null;

  create() {
    window.main = this;
    this.points = 0;
    this.maxReach = 0;
    this.current = null;
    this.pointer = { x: 0, y: 0 };
    this.nextPointRnd = this.getRandPoint();
    this.collisionPool = {};
    this.bonusEvent = {
      cocodrile: {
        wait: Phaser.Math.Between(100, 1000),
        count: 0,
        ready: false,
        busy: false,
        deploy: false,
        reset: function () {
          this.deploy = false;
          this.busy = false;
          this.ready = false;
          this.count++;
          this.wait = Phaser.Math.Between(100, 1000) * (this.count * 2);
        },
      },
    };
    this.createParticleEmitter();
    this.createNextPointInfo();
    this.createScore();
    this.createGameBounds();
    this.createMusicBg();
    this.createReloadButton();
    this.createRankingButton();

    //
    this.initPointerListener();
    this.createIntro().then(() => {
      this.createNew(this.scale.width / 2);
    });

    this.matter.world.on("collisionstart", (_event, objectA, objectB) => {
      if (objectA.gameObject && objectB.gameObject) {
        //this.validateCollision(objectA.gameObject, objectB.gameObject);
        this.evaluateCollisionPool();
      } else if (objectB.gameObject) {
        objectB.gameObject.dropEffect();
      }
    });
  }
  createUIButton(x, y, image, onClick) {
    const img_size = 32;
    const control = this.add.image(x, y, image);

    const rate = img_size / control.width;
    control.setDisplaySize(rate * control.width, rate * control.height);
    control.setInteractive();
    control.on("pointerdown", (event) => {
      onClick();
    });
    return control;
  }
  createMusicBg() {
    let storage = localStorage.hasOwnProperty("music_on")
      ? localStorage.getItem("music_on")
      : 1;
    storage = isNaN(storage) ? 1 : parseInt(storage);
    let music_on = storage !== 0;
    const music = this.sound.get("music") || this.sound.add("music");
    music.setVolume(0.5);
    music.loop = true;
    music.stop();
    if (!music.isPlaying && music_on) {
      music.play();
    }

    const control = this.createUIButton(
      this.scale.width - 32,
      24,
      "sound-playing",
      () => {
        if (music.isPlaying) {
          music.stop();
        } else {
          music.play();
        }
        localStorage.setItem("music_on", music.isPlaying ? 1 : 0);
        control.update();
      }
    );
    control.update = () => {
      if (music.isPlaying) {
        control.setTexture("sound-playing");
      } else {
        control.setTexture("sound-muted");
      }
    };

    control.update();
  }
  createReloadButton() {
    this.createUIButton(this.scale.width - 92, 24, "replay", () => {
      this.endGame();
    });
  }
  createRankingButton() {
    this.createUIButton(32, 24, "crown", () => {
      this.scene.pause();
      this.scene.run("ranking");
    }).setTintFill(0xffffff);
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
          y: 64,
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
    let audio;
    let pool = this.sound.sounds.filter((_audio) => _audio.key === soundName);
    if (pool.length < 3) {
      audio = this.sound.add(soundName);
    } else {
      for (let i in pool) {
        if (!pool[i].isPlaying) {
          audio = pool[i];
          break;
        }
      }
      if (!audio) {
        audio = pool[0];
        audio.stop();
      }
    }

    audio.play();
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
    let max = 2 + parseInt(total / 8);
    return Phaser.Math.RND.between(1, max);
  }
  initPointerListener() {
    const on_pointermove = (pointer) => {
      if (!this.current || this.current.dropped) {
        return;
      }
      this.current.x = pointer.x;
      this.pointer.x = pointer.x;
    };
    const on_pointerdown = (pointer, gameobject) => {
      if (this.current && this.current.go) {
        this.current.go();
        return;
      }
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
    };
    this.input.on("pointermove", on_pointermove);
    this.input.on("pointerdown", on_pointerdown);
    this.__unbind_listener = () => {
      this.input.off("pointermove", on_pointermove);
      this.input.off("pointerdown", on_pointerdown);
    };
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
    const container = this.add.container(this.scale.width - 100, 120, [
      bg,
      image,
      text,
    ]);
    let unbinds = () => null;
    this.__updateNextInfo = () => {
      if (
        this.bonusEvent.cocodrile.ready &&
        !this.bonusEvent.cocodrile.deploy
      ) {
        this.bonusEvent.cocodrile.deploy = true;
        this.playOnce("dragon-roar");
        unbinds = this.makeItCocoGlow(image);
      } else {
        unbinds();
        image.setFrame(animals[this.nextPointRnd - 1] + ".png");
      }
    };
  }
  createScore() {
    const text = this.add
      .text(this.scale.width / 2, 100, "0", {
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

    this.add
      .rectangle(
        0,
        this.START_Y,
        this.scale.width,
        3,
        Number(COLORS.secundary.replace("#", "0x")),
        1
      )
      .setOrigin(0);
  }
  validateCollision(bodyA, bodyB) {
    if (!(bodyA && bodyB && bodyA.scene && bodyB.scene)) {
      return;
    }
    if (!bodyA.dropped || !bodyB.dropped) {
      return;
    }
    let dist = Phaser.Math.Distance.BetweenPoints(
      { x: bodyA.x, y: bodyA.y },
      { x: bodyB.x, y: bodyB.y }
    );

    dist -= bodyA.radius;
    dist -= bodyB.radius;
    if (dist > 12) {
      return false;
    }

    if (this.validateMerge(bodyA, bodyB)) {
      this.playNew("pop");
    } else {
      //this.playNew("drop");
    }
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
    this.addScore(objectA.points);
    this.emitter.emitParticleAt(mid.x, mid.y);

    return true;
  }
  createNew(x) {
    if (this.bonusEvent.cocodrile.deploy) {
      if (!this.bonusEvent.cocodrile.busy) {
        this.bonusEvent.cocodrile.busy = true;
        this.__updateNextInfo();
        let coco = this.createCocodrileEat(x, this.START_Y, () => {
          this.bonusEvent.cocodrile.reset();
          this.createNew(x);
        });
        this.current = coco;
      }
      return;
    }
    const rndpoints = this.nextPointRnd;
    const circle = this.createCirc(x, this.START_Y, rndpoints);
    circle.setIgnoreGravity(true);
    circle.body.velocity.y = 0;
    let firstDrop = true;
    circle.body.onCollideCallback = () => {
      if (firstDrop) {
        firstDrop = false;
        this.playOnce("drop");
      }
    };

    this.current = circle;
    this.nextPointRnd = this.getRandPoint();
    this.__updateNextInfo();
    this.validateGameEnd();
    this.triggerSomeEvent();
  }
  createCirc(x, y, points = 1) {
    this.maxReach = Math.max(this.maxReach, points);
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
    let effect_busy = false;
    circle.dropEffect = () => {
      if (effect_busy) {
        return;
      }
      effect_busy = true;
      let audio = this.playNew("drop");
      setTimeout(() => {
        effect_busy = false;
      }, audio.duration * 1000);
    };
    if (!this.collisionPool[points]) {
      this.collisionPool[points] = [];
    }
    this.collisionPool[points].push(circle);
    return circle;
  }

  evaluateCollisionPool() {
    for (let i in this.collisionPool) {
      for (let j in this.collisionPool[i]) {
        let current = this.collisionPool[i][j];

        for (let k in this.collisionPool[i]) {
          if (k !== j && this.collisionPool[i][k].dropped) {
            this.validateCollision(current, this.collisionPool[i][k]);
          }
        }
      }
    }
  }
  validateGameEnd() {
    for (let i in this.collisionPool) {
      for (let j in this.collisionPool[i]) {
        let current = this.collisionPool[i][j];
        if (current.dropped && current.y + current.points < this.START_Y) {
          this.endGame();
          return;
        }
      }
    }
  }
  triggerSomeEvent() {
    this.bonusEvent.cocodrile.wait--;
    if (this.bonusEvent.cocodrile.wait < 0) {
      this.bonusEvent.cocodrile.ready = Phaser.Math.Between(0, 10) > 5;
    }
  }
  endGame() {
    this.__unbind_listener();
    this.scene.pause();
    this.game.points = this.points;
    this.game.maxReach = this.maxReach;
    this.scene.run("end");
  }
  resetGame() {
    //this.sound.stopAll();
    this.scene.restart();
  }

  makeItCocoGlow(image) {
    image.setFrame("crocodile.png");
    image.setTint(0xfff000);
    image.preFX.setPadding(32);
    const fx = image.preFX.addGlow();
    let tween = this.tweens.add({
      targets: fx,
      outerStrength: 10,
      yoyo: true,
      loop: -1,
      ease: "sine.inout",
    });
    return () => {
      image.clearTint();
      tween.destroy();
      fx.destroy();
    };
  }
  createCocodrileEat(x, y, onEnd) {
    this.current = null;
    let activated = false;
    let coco = this.add.sprite(x, y, "animals", "crocodile.png").setOrigin(0.5);
    coco.radius = 128;
    coco.eat_dist = 64;
    let rate = coco.radius / coco.width;
    coco.setDisplaySize(rate * coco.width, rate * coco.height);
    let unbind = this.makeItCocoGlow(coco);
    let validateCollision = () => {
      let toBeEated = [];
      for (let i in this.collisionPool) {
        for (let j in this.collisionPool[i]) {
          let mob = this.collisionPool[i][j];
          if (mob.dropped) {
            let dist = Phaser.Math.Distance.BetweenPoints(
              { x: mob.x, y: mob.y },
              { x: coco.x, y: coco.y }
            );

            dist -= mob.radius;
            dist -= coco.eat_dist;
            if (dist < 12) {
              toBeEated.push(mob);
            }
          }
        }
      }
      if (toBeEated.length > 0) {
        this.playOnce("eat");

        for (let i in toBeEated) {
          this.addScore(toBeEated[i].points);
          toBeEated[i].eat();
        }
      }
    };
    coco.go = () => {
      if (activated) {
        return;
      }
      activated = true;
      let finalY = this.scale.height * 1.2;
      let speed = 200;
      let steps = parseInt(finalY / speed);
      let duration = 2000 / steps;
      let tweens = new Array(steps).fill(1).map((_, idx) => {
        return {
          delay: 100,
          y: "+=" + speed,
          ease: "quart.in",
          duration,
          onComplete: () => {
            this.cameras.main.shake(300, 0.01);
            this.playOnce("stomp");
            validateCollision();
          },
        };
      });

      this.tweens.chain({
        targets: coco,
        tweens,

        onComplete: () => {
          coco.destroy();
          unbind();
          onEnd();
        },
      });
    };
    return coco;
  }
}
