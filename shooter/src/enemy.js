import hitAnimationFn from "./animations/hitAnimation.js";
import stepAnimationFn from "./animations/stepAnimation.js";
import { calcDirection } from "./calcDistance.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";
const poolManager = new PoolAliveManager();
export default class Enemy extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, []);
    this.target = null;
    this.speed = 32;
    this.sprite = this.scene.add.sprite(
      0,
      0,
      RESOURCES.name,
      RESOURCES.frames.mobs.scorpion
    );
    this.add(this.sprite);
    this.setSize(this.sprite.width, this.sprite.height);
    this.moveAnimation = stepAnimationFn(this.sprite);
    this.hitAnimation = hitAnimationFn(this.sprite);
    this.life = 1;
    this.stun = false;
    this.scale = this.life;
    this.onKill = () => {};
    scene.add.existing(this);
  }
  static create(scene, x, y) {
    const enemy = poolManager.create(scene, Enemy);
    enemy.setPosition(x, y);
    enemy.setVisible(true);
    enemy.stun = false;
    enemy.life = 1;
    enemy.onKill = () => {};
    setTimeout(() => {
      enemy.body.setEnable(true);
    }, 1);
    return enemy;
  }
  setTarget(target) {
    this.target = target;
  }
  kill() {
    this.__alive = false;
    this.setVisible(false);
    this.body.setEnable(false);
    this.body.setVelocity(0, 0);
    this.onKill();
  }
  hit(fromTarget) {
    if (this.life < 1) {
      return;
    }
    this.stun = true;
    this.body.setVelocity(0, 0);
    this.life -= 1;
    return this.hitAnimation({
      x: (this.x - fromTarget.x) / 10,
      y: (this.y - fromTarget.y) / 10,
    }).then(async () => {
      if (this.life <= 0) {
        this.kill();
        return;
      }

      this.stun = false;
    });
  }
  update(time, delta) {
    if (!this.target || this.stun) {
      return;
    }

    this.engage = true;
    let dir = calcDirection(this, this.target);
    this.body.setVelocity(dir.x * this.speed, dir.y * this.speed);
    this.flipX = this.target.x < this.x;
    if (dir.x != 0 || dir.y != 0) {
      this.moveAnimation(dir.x);
    }
  }
}
