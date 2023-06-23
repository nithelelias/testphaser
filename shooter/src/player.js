import hitAnimationFn from "./animations/hitAnimation.js";
import stepAnimationFn from "./animations/stepAnimation.js";
import WalkSwingAnim from "./animations/walkSwingAnim.js";
import Bullet from "./bullet.js";
import { getBullets, removeBullets } from "./context/data.js";
import playerWeaponBehavior from "./playerWeaponBehavior.js";
import RESOURCES from "./resources.js";
import tweenPromise from "./tweenPromise.js";
const PLAYER_SIZE = 32;
export default class Player extends Phaser.GameObjects.Container {
  static SIZE = PLAYER_SIZE;
  isPlayer = true;
  constructor(scene) {
    super(scene, 0, 0, []);
    const sprite_size = PLAYER_SIZE / 2;
    this.speed = Phaser.Math.GetSpeed(500, 0.004);
    this.head = scene.add.container(0, -sprite_size * 0.4, [
      scene.add
        .image(0, 0, "rect")
        .setTintFill(0x111)
        .setDisplaySize(sprite_size - 2, sprite_size - 2),
      scene.add
        .sprite(0, 0, RESOURCES.name, RESOURCES.frames.faces.face1)
        .setOrigin(0.5)
        .setDisplaySize(sprite_size, sprite_size),
    ]);
    this.sprite = scene.add
      .sprite(0, 0, RESOURCES.name, RESOURCES.frames.human)
      .setOrigin(0.5)
      .setDisplaySize(sprite_size, sprite_size);

    this.weapon = scene.add
      .sprite(0, 0, RESOURCES.name, RESOURCES.frames.gun.normal)
      .setOrigin(0.5)
      .setDisplaySize(sprite_size, sprite_size);

    this.add([this.sprite, this.head, this.weapon]);
    this.setSize(this.sprite.displayWidth, this.sprite.displayHeight);

    this.swingAnim = new WalkSwingAnim(this.sprite);
    this.moveAnimation = stepAnimationFn(this.sprite);
    this.hitAnimation = hitAnimationFn(this.sprite);

    var lastFired = 0,
      delayShoot = 100;
    playerWeaponBehavior.call(this, {
      onShoot: () => {
        let time = main.time.now;
        let elapsed = time - lastFired;
        if (elapsed < delayShoot) {
          return;
        }
        if (getBullets().total < 1) {
          return;
        }
        lastFired = time;

        removeBullets();

        let maxDistance = 300;
        let start = { x: this.x + this.weapon.x, y: this.y + this.weapon.y };

        let angle = Phaser.Math.Angle.Between(this.x, this.y, start.x, start.y);
        let finalTarget = {
          x: start.x + Math.cos(angle) * maxDistance,
          y: start.y + Math.sin(angle) * maxDistance,
        };
        let bullet = Bullet.shot(scene, start, finalTarget);
        bullet.fromPlayer = true;
        this.scene.addToStage(bullet);
      },
    });

    scene.add.existing(this);
  }
  addWeapon(frame) {}

  async doWalkAnim(coords) {
    this.swingAnim.play();
    await tweenPromise(this.scene, {
      targets: [this],
      x: coords.x,
      y: coords.y,
      ease: "QuintEaseIn",
      duration: 100,
    });
  }
  hit(from) {    
    this.hitAnimation();
  }

  move(velocity) {
    this.body.setVelocity(velocity.x * this.speed, velocity.y * this.speed);
    if (velocity.x != 0 || velocity.y != 0) {
      this.moveAnimation(velocity.x);
    }
  }
}
