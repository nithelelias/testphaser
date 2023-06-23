import ActionBarButtonOption from "./ActionBarButtonOption.js";
import { GRIDSIZE } from "./constants.js";
import RESOURCES from "./resources.js";
const width = GRIDSIZE * 6,
  height = GRIDSIZE * 4;
export default class BottomUIComponent extends Phaser.GameObjects.Container {
  constructor(scene, {}) {
    super(
      scene,
      scene.scale.width / 2 - width / 2,
      scene.scale.height - height,
      [
        scene.add
          .image(0, 0, "rect")
          .setOrigin(0)
          .setTintFill(0xfff000)
          .setAlpha(0.1)
          .setDisplaySize(width, height),
      ]
    );
    scene.add.existing(this);

    // PUT AT TOP

    let actions = [
      {
        frame: RESOURCES.frames.wall.normal,
        action: () => {
          scene.clickevent.type = 1;
        },
      },
      {
        frame: RESOURCES.frames.bullet.normal,
        action: () => {
          scene.clickevent.type = 2;
        },
      },
      {
        frame: RESOURCES.frames.bullet.fire,
        action: () => {
          scene.clickevent.type = 3;
        },
      },
      {
        frame: RESOURCES.frames.potion,
        action: () => {
          scene.clickevent.type = 0;
          scene.tower.life += 100;
        },
      },
    ];
    this.actionBar = scene.add.container(
      width / 2,
      32,
      actions.map(
        (action, idx) =>
          new ActionBarButtonOption(
            scene,

            idx * ActionBarButtonOption.BUTTON_SIZE,
            0,
            action.frame,
            { onClick: action.action }
          )
      )
    );

    const emitConfig = {
      color: [0x96e0da, 0x937ef3],
      colorEase: "quart.out",
      lifespan: 600,
      angle: { min: -100, max: -80 },
      scale: { start: 1, end: 0, ease: "sine.in" },
      speed: { min: 5, max: 100 },
      advance: 100,
      blendMode: "ADD",
    };
    const flameWrapper = scene.add
      .image(0, 0, "circle")
      .setAlpha(0.5)
      .setDisplaySize(32, 32);
    const flame = scene.add.particles(0, 0, "circle-small", emitConfig);
    flame.updateConfig = (settings) => {
      flame.setConfig({ ...emitConfig, ...settings });
    };
    flame.setLevel = (level) => {
      // level=1-100
      let p = Math.min(150, level) / 100;
      let c = {
        ...emitConfig,
        scale: { ...emitConfig.scale, start: 1.2 * p },
        lifespan: 600 * p,
      };
      flame.setConfig(c);
      return c;
    };
    window.flame = flame;

    this.add([flameWrapper, flame, this.actionBar]);
  }
}
