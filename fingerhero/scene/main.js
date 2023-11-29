import ASSET_MAPTILE from "../assets/maptile.js";
const rail_colors = [0xff0000, 0x00ff00, 0x0000ff, 0xfff000, 0x00ffff];

class RailSprite extends Phaser.GameObjects.Container {
  progress = 1; //0 -> 1
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
        .rectangle(0, 0, desire_size, desire_size, 0xff1111, 0.1)
        .setOrigin(0.5),
      this.sprite,
    ]);
    this.rail = rail;
    this.update();
  }
  disabled() {
    this.setAlpha(0.5);
    this.sprite.setTintFill(0xf1f1f1);
  }
  enabled() {
    this.setAlpha(0.5);
    if (this.color === -1) {
      this.sprite.clearTint();
    } else {
      this.sprite.setTintFill(this.color);
    }
  }
  setProgress(p) {
    this.progress = p;
    this.update();
  }
  update() {
    let _scale = Math.max(0.5, this.sprite.scale_rate * this.progress);
    this.sprite.setScale(_scale);
    let start = this.rail.start;
    let end = {
      x: this.rail.end.x - start.x,
      y: this.rail.end.y - start.y,
    };
    this.x = start.x + end.x * this.progress;
    this.y = start.y + end.y * this.progress;
  }
}
class Track extends Phaser.GameObjects.Container {
  constructor(scene, rails) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    this.rails = rails;
  }
  addOne(_railIdx = 0, seconds = 1) {
    let one = new RailSprite(this.scene, "arrow_left", {
      start: this.rails.start[_railIdx],
      end: this.rails.end[_railIdx],
    });
    one.setProgress(0.1);
    const total_time = seconds * 1000;
    one.startTime = Date.now();
    one.endTime = Date.now() + total_time;
    one.updateProgressTime = () => {
      let time = Date.now();
      let dif_time = (time = one.startTime);
      let progress = dif_time / total_time;
      console.log(progress);
      one.setProgress(progress);
    };
    this.add(one);
  }
  update(time, delta) {
    this.list.forEach((_one) => {
      _one.updateProgressTime(time, delta);
    });
  }
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
export default class Main extends Phaser.Scene {
  arrow_actives = [false, false, false, false];
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
  }
  create() {
    window.main = this;
    this.initRails();
    this.createLines();
    this.createDownArrows();
    this.createKeyInputListener();
    this.track = new Track(this, this.rails);
    this.track.addOne(0, 1);
  }
  initRails() {
    let steps = parseInt(this.scale.width / 4);

    let center_x = parseInt(this.scale.width / 2);
    let start_y = 200;
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
      start: [
        { x: center_x - parseInt(railsX[0] / 2), y: start_y },
        { x: center_x - parseInt(railsX[1] / 3), y: start_y },
        { x: center_x + parseInt(railsX[2] / 3), y: start_y },
        { x: center_x + parseInt(railsX[3] / 2), y: start_y },
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

    for (let i = 0; i < 4; i++) {
      const rail_start = this.rails.start[i];
      const rail_end = this.rails.end[i];
      graphics.lineStyle(2, rail_colors[i]);

      graphics.strokeLineShape(
        new Phaser.Geom.Line(rail_start.x, rail_start.y, rail_end.x, rail_end.y)
      );

      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          rail_end.x,
          rail_end.y,
          rail_end.x,
          this.scale.height
        )
      );
    }
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        0,
        this.rails.start_y,
        this.scale.width,
        this.rails.start_y
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
    const arrows = [
      new RailSprite(this, "arrow_left", {
        start: this.rails.start[0],
        end: this.rails.end[0],
      }),
      new RailSprite(this, "arrow_up", {
        start: this.rails.start[1],
        end: this.rails.end[1],
      }),
      new RailSprite(this, "arrow_down", {
        start: this.rails.start[2],
        end: this.rails.end[2],
      }),
      new RailSprite(this, "arrow_right", {
        start: this.rails.start[3],
        end: this.rails.end[3],
      }),
    ];

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
  }

  createKeyInputListener() {
    const cursors = this.input.keyboard.createCursorKeys();
    const directions = ["left", "up", "down", "right"];
    const validate = () => {
      for (let i in directions) {
        let dir = directions[i];
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

  update() {
    this.arrow_actives.forEach((active, idx) => {
      this.arrows[idx].setActive(active);
    });
  }
}
