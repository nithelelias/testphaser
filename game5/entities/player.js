import Resources from "../models/resources.js";
import hitAnimationFn from "../utils/hitAnimation.js";
import stepAnimationFn from "../utils/stepAnimation.js";

export default class Player extends Phaser.GameObjects.Container {
    constructor(context, x, y) {
        super(context, x, y, []);
        this.speed = 200;
        this.scale = 2;
        this.invencible = false;
        this.sprite = this.scene.add.sprite(0, 0, Resources.assetname, Resources.guy);
        this.add(this.sprite);
        this.moveAnimation = stepAnimationFn(this);
        this.hitAnimation = hitAnimationFn(this.sprite);
      //  this.sprite.setTint(0x00ff12)
        this.setSize(this.sprite.width, this.sprite.height);


    }

    move(velocity) {
        this.body.setVelocity(velocity.x * this.speed, velocity.y * this.speed);
        if (velocity.x != 0 || velocity.y != 0) {
            this.moveAnimation(velocity.x);
        }
    }
    addWeapon(weapon) {
        this.weapon = weapon;
        this.add(weapon);
    }
    onHit(fromTarget) {
        if (this.invencible) {
            return;
        }
        this.invencible = true;
        this.hitAnimation({
            x:( this.x-fromTarget.x)/10,
            y:(this.y-fromTarget.y)/10
        }).then(() => {
            this.invencible=false;
        });
    }
    update() {

    }
}
