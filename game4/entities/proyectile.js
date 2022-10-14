import Resources from "../models/resources.js";
import   { Bullets } from "../models/weapons.js";

export default class Projectile extends Phaser.GameObjects.Container {
    constructor(context) {
        super(context, 0, 0, []);

        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0; 
        this.speed = Phaser.Math.GetSpeed(600, 1);
        
        this.setProjectileByName("bullet");

    }
    setProjectileByName(bulletName) {
        return this.setProjectile(Bullets[bulletName]);
    }
    setProjectile(bullet) {
        this.sprite = this.scene.add.sprite(0, 0, Resources.assetname, bullet.frame);
        this.add(this.sprite);
        this.setSize(this.sprite.width, this.sprite.height);
        this.speed=Phaser.Math.GetSpeed(bullet.speed, 1);;
        this.scale=bullet.scale || 1;
        this.lifespan=bullet.lifespan || 1000;
        this.sprite.setRotation(bullet.ang);
    }
    fire(angle) {
        this.setActive(true);
        this.setVisible(true);


        this.setRotation(angle);

        this.incX = Math.cos(angle);
        this.incY = Math.sin(angle); 
    }
     
    hit(){
        this.destroy(); 
    }
    update(time, delta) {
        this.lifespan -= delta;

        this.x += this.incX * (this.speed * delta);
        this.y += this.incY * (this.speed * delta);

        if (this.lifespan <= 0) {
            this.remove();
        }
    }

}
