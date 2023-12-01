import ASSET_MAPTILE from "../assets/maptile.js";
import BeatBeat from "../beat.js";
const rail_colors = [0xff0000, 0x00ff00, 0x0000ff, 0xfff000, 0x00ffff];
const rail_border_color = 0xffffff;
const control_directions = ["left", "down", "right", "up"];
const song_name="MYKKA"
function getTimeNow() {
  return Main.current.time.now;
}
function addClickListenerAt(
  scene,
  gameObject,
  onClick,
  onPress = () => null,
  onRelease = () => null
) {
  const ondown = () => {
    onPress();
    gameObject.once("pointerup", () => {
      onClick();
    });
    scene.input.once("pointerup", () => {
      onRelease();
    });
  };
  gameObject.setInteractive();
  gameObject.on("pointerdown", ondown);

  return () => {
    gameObject.off("pointerdown", ondown);
  };
}
class RailSprite extends Phaser.GameObjects.Container {
  progress = 1; //0 -> 1
  is_enable = true;
  constructor(scene, sprite_name, rail, desire_size = 128) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    this.desire_size = desire_size;
    this.offset = desire_size / 2;
    this.color = -1;
    this.sprite = scene.add
      .sprite(0, 0, ASSET_MAPTILE.name, ASSET_MAPTILE.frames[sprite_name])
      .setOrigin(0.5);
    let rate = desire_size / this.sprite.width;
    this.sprite.setDisplaySize(
      rate * this.sprite.width,
      rate * this.sprite.height
    );
    this.sprite.scale_rate = rate;
    this.setSize(desire_size, desire_size);
    this.add([
      scene.add
        .rectangle(0, 0, desire_size, desire_size, 0xff1111, 0)
        .setOrigin(0.5),
      this.sprite,
    ]);
    this.rail = rail;
    this.update();
  }
  setColor(_color) {
    this.color = _color;
    if (this.is_enable) {
      this.enabled();
    } else {
      this.disabled();
    }
  }
  setSprite(sprite_name) {
    this.sprite.setFrame(ASSET_MAPTILE.frames[sprite_name]);
  }
  setRail(_rail) {
    this.rail = _rail;
    this.update();
  }
  disabled() {
    this.is_enable = false;
    this.setAlpha(0.5);
    this.sprite.setTintFill(0xf1f1f1);
  }
  enabled() {
    this.is_enable = true;
    this.setAlpha(0.5);
    if (this.color === -1) {
      this.sprite.clearTint();
    } else {
      this.sprite.setTintFill(this.color);
    }
  }
  setProgress(p) {
    this.progress = Math.max(0, p);
    this.update();
  }
  update() {
    let _scale = Math.max(0.1, this.sprite.scale_rate * this.progress);
    this.sprite.setScale(_scale);
    let start = this.rail.start;
    let end = {
      x: this.rail.end.x - start.x,
      y: this.rail.end.y - start.y,
    };
    let _offset = this.offset * this.progress;
    this.x = start.x + end.x * this.progress;
    this.y = Math.max(
      start.y + this.offset,
      start.y + end.y * this.progress + _offset
    );
  }
}
class Track extends Phaser.GameObjects.Container {
  started = false;
  constructor(scene, rails, onChallenge = () => null) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    this.rails = rails;
    this.track = [];
    this.onChallenge = onChallenge;
    this.startTime = 0;
  }
  addOne() {
    let one = new RailSprite(this.scene, "dot", {
      start: this.rails.start[0],
      end: this.rails.end[0],
    });
    one.setProgress(0);
    one.startTime = 0;
    one.endTime = 0;
    one.total_time = 1000; // one second
    one.idle = true;

    one.putAtRail = (_railIdx) => {
      let _rail = {
        start: this.rails.start[_railIdx],
        end: this.rails.end[_railIdx],
      };
      one._railIdx = _railIdx;
      one.setRail(_rail);
    };
    one.setSeconds = (_seconds = 1) => {
      one.total_time = _seconds > 900 ? _seconds : _seconds * 1000;
    };
    one.stop = () => {
      one.idle = true;
      one.setVisible(false);
    };
    one.start = (_seconds) => {
      if (_seconds) {
        one.setSeconds(_seconds);
      }
      let eventName = "press-rail-" + one._railIdx;
      let tween;
      let unbind;
      const holderProgress = {
        t: 0,
      };
      const onPressRail = () => {
        if (holderProgress.t < 0.9) {
          this.onChallenge(0);
          return;
        }
        if (holderProgress.t < 1) {
          this.onChallenge(1);
        } else {
          this.onChallenge(2);
        }
        end();
      };
      const end = () => {
        tween.stop();
        one.stop();
        this.scene.events.off(eventName, onPressRail, this.scene);
        //tween.destroy();
      };
      this.scene.events.on(eventName, onPressRail, this.scene);

      one.idle = false;
      tween = this.scene.add.tween({
        targets: holderProgress,
        t: 1.2,
        duration: one.total_time,
        onUpdate: () => {
          one.setVisible(true);
          one.setProgress(holderProgress.t);

          if (one.progress >= 1.2) {
            console.log("MISS!");
            end();
          }
        },
      });
    };

    one.stop();
    this.add(one);
    return one;
  }

  getOne() {
    for (let i in this.list) {
      if (this.list[i].idle) {
        return this.list[i];
      }
    }
    //
    return this.addOne();
  }
  getTotalActives() {
    let total = 0;
    for (let i in this.list) {
      if (!this.list[i].idle) {
        total++;
      }
    }
    return total;
  }
  setTrack(_track) {
    this.track = _track;
  }
  start() {
    this.startTime = getTimeNow();
    this.started = true;
    let durationSeconds = 2000;
    let parsedTrack = this.track.map((_section) => {
      return {
        at: _section.t,
        run: () => {
          for (let i in _section.k) {
            let one = this.getOne();
            let rail_idx = _section.k[i];

            one.putAtRail(rail_idx);
            one.start(durationSeconds);
          }
        },
      };
    });

    const timeline = this.scene.add.timeline(parsedTrack);

    timeline.play();
  }
  update(time, delta) {
    if (!this.started) {
      return;
    }
    /*  let timestamp = getTimeNow() - this.startTime;
    let wait_t = -1;
    let total_expected = this.track.length;
    if (total_expected > 0) {
      wait_t = this.track[0].t;
      if (this.track[0].t <= timestamp) {
        console.log("GO");
        let section = this.track.shift();
        for (let i in section.k) {
          let one = this.getOne();
          let rail_idx = section.k[i];
          console.log(rail_idx);
          one.putAtRail(rail_idx);
          one.start();
        }

        //this.track.push(section);
      }
    }
    
    let total = this.getTotalActives();
    if (total > 0 || total_expected > 0) {
      this.list.forEach((_one) => {
        _one.updateProgressTime(time, delta);
      });
    } else {
      this.started = false;
      console.log("ended");
    } */
  }
}

export default class Main extends Phaser.Scene {
  arrow_actives = [false, false, false, false];
  started = false;
  static current;
  constructor() {
    super({
      key: "main",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: true,
        },
      },
    });
  }
  preload() {
    this.load.spritesheet(ASSET_MAPTILE.name, "./assets/maptile.png", {
      frameWidth: ASSET_MAPTILE.sprite_size,
      frameHeight: ASSET_MAPTILE.sprite_size,
    });
    this.load.audio("music", "./assets/music/"+song_name+".mp3");
  }
  create() {
    Main.current = this;
    window.main = this;
    this.points = 0;
    this.started = false;
    this.initRails();
    this.started = true;
    this.createLines();
    this.createDownArrows();
    this.createKeyInputListener();
    this.track = new Track(this, this.rails, (_challengScore) => {
      this.points = Math.max(0, this.points + _challengScore);
    });
    this.caption = this.add.text(16, 16, "HOLA MUNDO", {
      fill: "#7fdbff",
      fontFamily: "monospace",
      lineSpacing: 4,
    });
    this.createIntroStart();
  }
  createIntroStart() {
    let introText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "click to start", {
        fill: "#7fdbff",
        fontFamily: "monospace",
        lineSpacing: 4,
      })
      .setOrigin(0.5);
    this.input.once("pointerdown", () => {
      introText.destroy();

      this.startLevel();
    });
  }

  initRails() {
    let steps = parseInt(this.scale.width / 4);

    let center_x = parseInt(this.scale.width / 2);
    let start_y = 16;
    let end_y = this.scale.height - 130;
    let railsX = [
      parseInt(steps * 0.5),
      parseInt(steps * 1.5),
      parseInt(steps * 2.5),
      parseInt(steps * 3.5),
    ];
    this.rails = {
      start_y,
      end_y,
      steps,
      start: [
        { x: center_x - parseInt(steps * 0.6), y: start_y },
        { x: center_x - parseInt(steps * 0.2), y: start_y },
        { x: center_x + parseInt(steps * 0.2), y: start_y },
        { x: center_x + parseInt(steps * 0.6), y: start_y },
      ],
      end: [
        { x: railsX[0], y: end_y },
        { x: railsX[1], y: end_y },
        { x: railsX[2], y: end_y },
        { x: railsX[3], y: end_y },
      ],
    };
    return this.rails;
  }
  createLines() {
    const graphics = this.add.graphics();
    let _offset = 64;

    let _top_x_step = (this.rails.start[1].x - this.rails.start[0].x) / 2;
    for (let i = 0; i < 4; i++) {
      const rail_start = this.rails.start[i];
      const rail_end = this.rails.end[i];
      graphics.lineStyle(2, rail_colors[i], 0.1);

      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          rail_start.x,
          rail_start.y + _offset,
          rail_end.x,
          rail_end.y
        )
      );

      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          rail_end.x,
          rail_end.y,
          rail_end.x,
          this.scale.height
        )
      );

      graphics.lineStyle(2, rail_border_color);
      let _x = this.rails.steps * i;
      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          rail_start.x - _top_x_step,
          rail_start.y + _offset,
          _x,
          rail_end.y
        )
      );
      if (i === 3) {
        graphics.strokeLineShape(
          new Phaser.Geom.Line(
            rail_start.x + _top_x_step,
            rail_start.y + _offset,
            _x + this.rails.steps,
            rail_end.y
          )
        );
      }
    }
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        0,
        this.rails.start_y + _offset,
        this.scale.width,
        this.rails.start_y + _offset
      )
    );
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        0,
        this.rails.end_y,
        this.scale.width,
        this.rails.end_y
      )
    );
  }
  createDownArrows() {
    const arrows = control_directions.map((dir, idx) => {
      return new RailSprite(this, "arrow_" + dir, {
        start: this.rails.start[idx],
        end: this.rails.end[idx],
      });
    });

    arrows.forEach((_arrow, _idx) => {
      _arrow.disabled();
      _arrow.color = rail_colors[_idx];
      let debounce = 0;
      _arrow.setActive = (active) => {
        if (active) {
          _arrow.setScale(0.8);
          _arrow.enabled();
        } else {
          _arrow.setScale(1);
          _arrow.disabled();
        }
      };
      addClickListenerAt(
        this,
        _arrow,
        () => {
          // --clicked
        },
        () => {
          this.triggerRailAt(_idx);
        },
        () => {
          this.triggerRailAt(_idx, false);
        }
      );
    });

    this.arrows = arrows;
  }
  triggerRailAt(idx, state = true) {
    //console.log("trigger rail at ", idx);
    this.arrow_actives[idx] = state;
    this.events.emit("press-rail-" + idx);
  }

  createKeyInputListener() {
    const cursors = this.input.keyboard.createCursorKeys();

    const validate = () => {
      for (let i in control_directions) {
        let dir = control_directions[i];
        this.triggerRailAt(i, cursors[dir].isDown);
      }
    };
    this.input.keyboard.on("keydown", validate);
    this.input.keyboard.on("keyup", validate);

    return () => {
      this.input.keyboard.off("keydown", validate);
      this.input.keyboard.off("keyup", validate);
    };
  }
  async startLevel() {
    const sound = new BeatBeat(
      new AudioContext(),
      "./assets/music/"+song_name+".mp3",
      {
        filterFrequency: 1000,
        threshold: 0.5,
      }
    );
    await sound.load();
    let parsedTrack = [];
    let firstEntryNote = -1;
    const mapDatSound = (channelIdx) => {
      sound.channels[channelIdx].forEach((data) => {
        if (firstEntryNote === -1 || data.time < firstEntryNote) {
          firstEntryNote = data.time;
        }
        parsedTrack.push({
          t: data.time * 1000,
          k: [channelIdx],
        });
      });
    };
    mapDatSound(0);
    mapDatSound(1);
    mapDatSound(2);
    mapDatSound(3);
    let delay = firstEntryNote * 1000 + 0;
    console.log("delay", delay);

    this.track.setTrack(parsedTrack);
    this.track.start();
    let music = this.sound.add("music");
    setTimeout(() => {
      music.play();
    }, delay);
  }
  update(time, delta) {
    if (!this.started) {
      return;
    }
    this.arrow_actives.forEach((active, idx) => {
      this.arrows[idx].setActive(active);
    });
    this.track.update(time, delta);
    this.caption.setText(` points: ${this.points}`);
  }
}
