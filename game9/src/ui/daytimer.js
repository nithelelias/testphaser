import { COLORS } from "../constants.js";
import STATE from "../state.js";
import { padStartNum } from "../utils.js";

export default function DayTimer(scene, x, y, width, sprite_size = 64) {
  width = width || scene.scale.width * 0.8;

  var radius = 0 + width / 2;

  if (!scene.textures.list.hasOwnProperty("daytime_circ_mask")) {
    let g = scene.make.graphics({ add: false });
    g.fillStyle(0xffaa11);
    g.arc(
      radius,
      radius,
      radius,
      Phaser.Math.DegToRad(180),
      Phaser.Math.DegToRad(360),
      false
    );
    g.fill();
    g.generateTexture("daytime_circ_mask", width, width);
    g.clear();
    g.fillStyle(0xffaa11);
    g.arc(radius, radius, radius, 0, Phaser.Math.DegToRad(360), false);
    g.fill();
    g.generateTexture("daytime_circl_bg", width, width);
    g.clear();

    g.destroy();
  }

  const mask = scene.make.image({
    x: x,
    y: y,
    key: "daytime_circ_mask",
    add: false,
  });
  const bg = scene.make.image({
    x: 0,
    y: 0,
    key: "daytime_circl_bg",
    add: false,
  });
  bg.setTintFill(COLORS.evening, COLORS.night, COLORS.sunny, COLORS.day);
  const sun = scene.make
    .sprite({ x: 0, y: radius / 2, key: "sun", add: true })
    .setOrigin(0.5)
    .setDisplaySize(sprite_size, sprite_size);

  const moon = scene.make
    .sprite({ x: 0, y: -radius / 2, key: "moon", add: true })
    .setOrigin(0.5)
    .setDisplaySize(sprite_size, sprite_size);
  var clockText = scene.add
    .bitmapText(0, 22, "font1", ["00:00"], 32)
    .setLetterSpacing(4)
    .setOrigin(0.5);
  sun.mask = new Phaser.Display.Masks.BitmapMask(scene, mask);
  moon.mask = new Phaser.Display.Masks.BitmapMask(scene, mask);
  bg.mask = new Phaser.Display.Masks.BitmapMask(scene, mask);
  const layerBodys = scene.add.container(0, 0, [bg, sun, moon]);
  const container = scene.add.container(x, y, [layerBodys, clockText]);
  var clockEvent = scene.time.addEvent({
    delay: 600,
    loop: true,
    callback: () => {
      clockEvent.odd = !clockEvent.odd;
      update();
    },
  });
  clockEvent.odd = false;
  const update = () => {
    let dots = clockEvent.odd ? " " : ":";
    let progress = STATE.DATE.hour / 24;
    let deg = 360 * progress;

    sun.setAngle(-deg);
    moon.setAngle(-deg);
    layerBodys.setAngle(deg);
    clockText.setText(`${padStartNum(STATE.DATE.hour)}${dots}00`);
  };

  this.getContainer = () => {
    return container;
  };

  this.destroy = () => {
    sun.destroy();
    moon.destroy();
    layerBodys.destroy();
    mask.destroy();
    container.destroy();
  };

  update();
}
