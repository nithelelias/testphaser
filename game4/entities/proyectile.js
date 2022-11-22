import Resources from "../models/resources.js";
import { Bullets } from "../models/weapons.js";

export default class Projectile extends Phaser.GameObjects.Container {
  constructor(context) {
    super(context, 0, 0, []);

    this.incX = 0;
    this.incY = 0;
    this.lifespan = 0;
    this.bounce = 2;
    this.speed = Phaser.Math.GetSpeed(600, 0.01);
    this.sprite = context.add.sprite(0, 0, Resources.assetname, 0);
    this.rebounce_delay = 0;
    this.add(this.sprite);
    this.setProjectileByName("bullet");
  }
  setProjectileByName(bulletName) {
    return this.setProjectile(Bullets[bulletName]);
  }
  setProjectile(bullet) {
    this.sprite.setFrame(bullet.frame);
    this.setSize(this.sprite.width, this.sprite.height);
    this.speed = Phaser.Math.GetSpeed(bullet.speed, 0.01);
    this.scale = bullet.scale || 1;
    this.lifespan = bullet.lifespan || 1000;
    this.sprite.setRotation(bullet.ang);
  }
  fire(angle) {
    this.setActive(true);
    this.setVisible(true);

    this.setRotation(angle);

    this.incX = Math.cos(angle);
    this.incY = Math.sin(angle);
  }

  hit() {
    if (this.rebounce_delay > 0) {
      return;
    }
    if (this.bounce > 0) {
      this.bounce--;
      this.lifespan = 1000;
      this.rebounce_delay = 5;
      console.log(this.rotation);
      let mag =
        this.rotation == 0 ? 1 : this.rotation / Math.abs(this.rotation);
      this.fire(this.rotation - 180 * mag);
      //   let absX = Math.abs(this.incX),
      //     absY = Math.abs(this.incY);
      //   if (absX > absY) {
      //     this.incX *= -1;
      //   } else if (absX < absY) {
      //     this.incY *= -1;
      //   }
      //   this.setRotation(-this.rotation);
      //   this.rebounce_delay = 5;
      return;
    }
    this.destroy();
  }
  update(time, delta) {
    this.lifespan -= delta;
    this.rebounce_delay -= this.rebounce_delay > 0 ? 1 : 0;
    this.body.setVelocity(
      this.incX * (this.speed * delta),
      this.incY * (this.speed * delta)
    );
    if (this.lifespan <= 0) {
      this.destroy();
    }
  }
}
