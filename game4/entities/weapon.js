import Weapons from "../models/weapons.js";

export default class Weapon extends Phaser.GameObjects.Sprite {
    constructor(context, owner, weaponName, pool) {
        super(context, 0, 0, Weapons.assetname, Weapons[weaponName].frame)

        this.weaponName = weaponName;
        const bullet_start_position = {
            x: 0, y: 0
        }
        var isDown = false;
        const cam = context.cameras.main
        const size = this.width * 2;
        const dist_to_owner = this.width;;
        const getBulletStartPosition = () => {
            return {
                x: owner.x + bullet_start_position.x,
                y: owner.y + bullet_start_position.y
            }
        };
        const getDelay = () => {
            return Weapons[weaponName].delay;
        };
        const getPointer = () => {
            return context.input.mousePointer;
        };
        const getOwnerGlobalPos = () => {
            return {
                x: owner.x - cam.scrollX,
                y: owner.y - cam.scrollY
            }
        }
        const getPointerAngle = () => {
            const pointer = getPointer();
            const ownerpos = getOwnerGlobalPos();
            return Phaser.Math.Angle.Between(ownerpos.x, ownerpos.y, pointer.x, pointer.y);
        }
        const shot = () => {

            let bullet = pool.create();
            bullet.setProjectileByName(Weapons[weaponName].bullet)
            const position = getBulletStartPosition();
            bullet.setPosition(position.x, position.y);
            
            bullet.fire(getPointerAngle());
             

        }

        const move = () => {
            const pointer = getPointer();
            const ownerPos=getOwnerGlobalPos();
            const ang = getPointerAngle();
            this.setRotation(ang);
            let vx = Math.cos(ang), vy = Math.sin(ang)
            this.x = (vx * dist_to_owner);
            this.y = (vy * dist_to_owner);
            bullet_start_position.x = vx * (dist_to_owner + size);
            bullet_start_position.y = vy * (dist_to_owner + size);
            this.flipY = pointer.x < ownerPos.x;

        }


        context.input.on('pointerdown', (pointer) => {
            isDown = true;
        });
        context.input.on('pointerup', () => {
            isDown = false;
        });
        context.input.on('pointermove', (pointer) => {

            //  move();
        });
        let lastFired = 0;
        this.update = (time, delta) => {
            if (isDown) {
                if (time > lastFired) {
                    shot();
                    lastFired = time + getDelay();
                }
            }
            move();
        }
    }

}