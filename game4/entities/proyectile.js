import Resources from "../models/resources.js";
import { Bullets } from "../models/weapons.js";

export default class Projectile extends Phaser.GameObjects.Container {
    constructor(context) {
        super(context, 0, 0, []);

        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;
        this.speed = Phaser.Math.GetSpeed(600, 0.01);
        this.sprite = context.add.sprite(0, 0, Resources.assetname, 0);
        this.add(this.sprite);
        this.setProjectileByName("bullet"); 
    }
    setProjectileByName(bulletName) {
        return this.setProjectile(Bullets[bulletName]);
    }
    setProjectile(bullet) {
        this.sprite.setFrame(bullet.frame)
        this.setSize(this.sprite.width, this.sprite.height);
        this.speed = Phaser.Math.GetSpeed(bullet.speed, 0.01);;
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
        this.destroy();
    }
    update(time, delta) {
        this.lifespan -= delta;
        this.body.setVelocity(this.incX * (this.speed * delta), this.incY * (this.speed * delta))
        if (this.lifespan <= 0) {
            this.destroy();
        }
    }

}
