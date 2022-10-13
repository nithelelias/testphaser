import Resources from "../models/resources.js";
import hitAnimationFn from "../utils/hitAnimation.js";
import stepAnimationFn from "../utils/stepAnimation.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(context) {
        super(context, 0, 0, Resources.assetname, Resources.mobs.scorpion);
        this.target = null;
        this.speed = 50;//Phaser.Math.GetSpeed(900, 1);
        this.moveAnimation = stepAnimationFn(this);
        this.hitAnimation = hitAnimationFn(this);
        this.life = Phaser.Math.Between(1, 3);
        this.stun = false;
        this.scale=this.life;
    }
    
    setTarget(target) {
        this.target = target;
    }
    remove() {

        this.destroy();
    }
    onHit(fromTarget) {
        this.stun = true;
        this.body.setVelocity(0,0);
        this.life -= 1;
        return this.hitAnimation({
            x: (this.x - fromTarget.x) / 10,
            y: (this.y - fromTarget.y) / 10
        }).then(async () => {


           
            if (this.life <= 0) {
                this.remove();
                return;
            }
           
                this.stun = false;
            
        })
    }
    update(time, delta) {
        if (!this.target || this.stun) {
            return
        }

        const ang = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.engage = true;
        let vel = {
            x: Math.cos(ang),
            y: Math.sin(ang)
        }
        this.body.setVelocity(vel.x * this.speed, vel.y * this.speed);
        this.flipX = this.target.x < this.x;
        if (vel.x != 0 || vel.y != 0) {
            this.moveAnimation(vel.x);
        }
    }
}
