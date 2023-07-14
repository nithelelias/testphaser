import calcDistance from "./calcDistance.js";
import PoolAliveManager from "./poolAliveManager.js";
import random from "./random.js";
import RESOURCES from "./resources.js";
const poolManager = new PoolAliveManager();
const STATES = {
  normal: "normal",
  aimto: "aimto",
};
const BULLET_OPTIONS = {
  frame: RESOURCES.frames.bullet.normal,
  angle: -180,
  tint: 0xffffff,
  speed: 100,
};
export default class Bullet extends Phaser.GameObjects.Sprite {
  static BULLET_OPTIONS = BULLET_OPTIONS;
  isBullet = true;
  owner = null;
  constructor(scene, x, y) {
    super(scene, x, y, RESOURCES.name, RESOURCES.frames.bullet.normal);

    this.setOrigin(0.5);
    scene.add.existing(this);

    this.speed = Phaser.Math.GetSpeed(500, 0.01);
    this.targetPosition = null;
    this.type = STATES.normal;
    this.lifespan = 100;
    this.velocity = [0, 0];
  }
  static shot(scene, from, targetPosition, bulletOptions = BULLET_OPTIONS) {
    const { x, y } = from;
    const bullet = poolManager.create(scene, Bullet);
    bullet.type = STATES.normal;
    bullet.setPosition(from.x, from.y);
    bullet.setTarget(targetPosition);
    bullet.setScale(0.5); //?

    bullet.setLifeSpan(calcDistance(from, targetPosition));
    bullet.setVisible(true);

    let angle = Phaser.Math.Angle.Between(
      x,
      y,
      targetPosition.x,
      targetPosition.y
    );
    bullet.__initAngle = angle;

    bullet.setFrame(bulletOptions.frame);
    bullet.setRotation(bulletOptions.angle + angle);
    bullet.setTintFill(bulletOptions.tint);
    bullet.speed = Phaser.Math.GetSpeed(bulletOptions.speed, 0.01);
    bullet.velocity = [Math.cos(angle), Math.sin(angle)];
    bullet.setAlive(true);
    setTimeout(() => {
      bullet.body.setEnable(true);
    }, 1);
    return bullet;
  }
  static shotTo(
    scene,
    from,
    targetPosition,
    bulletOptions = BULLET_OPTIONS,
    vel = 0.2
  ) {
    let bullet = Bullet.shot(
      scene,
      from,
      targetPosition,
      bulletOptions,

      vel
    );
    const maxDistance = bullet.lifespan;
    bullet.type = STATES.aimto;
    bullet.setLifeSpan(maxDistance * 2);
    let escapeAngDir = [-1, 1][random(0, 1)];
    let calcControlPoint = (p = 0.5) => {
      let middistance = parseInt(maxDistance * p);
      let escapeAngle =
        bullet.__initAngle + (random(0, 180) / 360) * escapeAngDir;
      let escape_x = from.x + Math.cos(escapeAngle) * middistance;
      let escape_y = from.y + Math.sin(escapeAngle) * middistance;
      let controlPoint = new Phaser.Math.Vector2(escape_x, escape_y);
      return controlPoint;
    };

    let curve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(from.x, from.y),
      calcControlPoint(0.35),
      calcControlPoint(0.65),
      new Phaser.Math.Vector2(targetPosition.x, targetPosition.y)
    );
    let total = Math.min(64, parseInt(maxDistance / 4));
    let path = curve.getPoints(total);
    let cursor = { t: 0, i: 0 };

    if (!bullet.lockat) {
      bullet.lockat = scene.add.sprite(
        targetPosition.x,
        targetPosition.y,
        RESOURCES.name,
        RESOURCES.frames.lock
      );
    }
    bullet.lockat.setPosition(targetPosition.x, targetPosition.y);
    bullet.lockat.setVisible(true);
    bullet.__aimtoMove = (delta) => {
      if (cursor.i >= total) {
        bullet.explode();

        return;
      }
      let point = path[parseInt(cursor.i)];
      if (!point) {
        return;
      }
      let angle = Phaser.Math.Angle.Between(
        bullet.x,
        bullet.y,
        point.x,
        point.y
      );
      bullet.setRotation(bulletOptions.angle + angle);
      cursor.t = cursor.i / total;
      bullet.x = point.x;
      bullet.y = point.y;

      bullet.body.setEnable(cursor.t > 0.7);
      cursor.i++;
    };

    return bullet;
  }
  setOwner(entity) {
    this.owner = entity;
  }
  setLifeSpan(_life) {
    this.lifespan = _life;
  }

  setFrom(_from) {
    this.from = _from;
  }
  setTarget(_target) {
    this.targetPosition = _target;
  }
  explode() {
    if (!this.__alive) {
      return;
    }
    this.owner = null;
    this.lifespan = 0;
    this.__alive = false;
    this.setVisible(false);

    if (this.lockat) {
      this.lockat.setVisible(false);
    }
    this.body.setEnable(false);
    this.body.setVelocity(0, 0);
  }
  __moveUpdate(t, delta) {
    if (this.type === STATES.aimto) {
      this.__aimtoMove(delta);
      return;
    }

    // STATES.normal
    this.body.setVelocity(
      this.velocity[0] * this.speed * delta,
      this.velocity[1] * this.speed * delta
    );
    // move towards taret position.
    /*   this.x += this.velocity[0] * delta;
    this.y += this.velocity[1] * delta; */
  }
  hit(entity) {
    this.body.setVelocity(0, 0);
    this.explode();
  }
  update(t, delta) {
    if (!this.__alive) {
      return;
    }
    if (!this.targetPosition) {
      return;
    }
    this.__moveUpdate(t, delta);
    this.lifespan--;
    if (this.lifespan < 1) {
      this.explode();
    }
  }
}
