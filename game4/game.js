
import Enemy from "./entities/enemy.js";
import UserKeyControls from "./entities/userKeyControls.js";
import Player from "./entities/player.js";
import Projectile from "./entities/proyectile.js";
import Viewport from "./entities/viewport.js";
import Weapon from "./entities/weapon.js";
import Resources from "./models/resources.js";

function JsonPacked() {
    const json = {
        "frames": []
    };
    const size = 16;
    const dim = [784, 352];
    const maxX = dim[0] / size;
    const maxY = dim[1] / size;

    for (let i = 0; i < maxX; i++) {
        for (let j = 0; j < maxY; j++) {
            json.frames.push({
                "filename": "f" + i + "_" + j,
                "rotated": false,
                "trimmed": false,
                "frame": {
                    "x": i * size,
                    "y": j * size,
                    "w": size,
                    "h": size
                }
            });
        }
    }

    return json;
}

class Boot extends Phaser.Scene {
    constructor() {
        super("boot");
        // AQUI SE INICIA TODO /precarga
    }

    init() {

    }

    preload() {
        this.load.atlas("pack", "../common-assets/colored-transparent_packed.png", JsonPacked());
    }

    create() {
        setTimeout(() => {

            this.scene.start("world")
        }, 100);
    }
}

class World extends Phaser.Scene {
    constructor() {
        super("world");
        this.enemyWaves = 0;
        window.$world = this;
    }
    create() {
        this.userKeyControl = new UserKeyControls(this);

        this.enemys = this.physics.add.group({
            classType: Enemy, runChildUpdate: true
        });
        this.playerProjectiles = this.physics.add.group({
            classType: Projectile, runChildUpdate: true
        });

        this.stage = this.add.group({
            runChildUpdate: true
        });
        this.player = new Player(this, config.width / 2, config.height / 2);
        // adding physincs...
        this.stage.add(this.physics.add.existing(this.add.existing(this.player)));
        // WEAPON
        this.player.addWeapon(new Weapon(this, this.player, "gun", this.playerProjectiles));
        this.stage.add(this.player.weapon);
        // bullet boom 
        {
            let frames = Resources.blow.map(frame => ({ key: Resources.assetname, frame }));

            this.anims.create({
                key: 'blow',
                frames,
                frameRate: 3
            });
        }
        // -- viepowr
        this.viewport = new Viewport(this, config.width, config.height, this.player);
        //-- COLLISIONS....
        this.physics.add.overlap(this.enemys, this.playerProjectiles, (enemy, bullet) => {

            this.addbulletBlow(  bullet);

            enemy.onHit(bullet).then(() => {
                setTimeout(() => {
                    this.addEnemyWaves();
                }, 1000)
            })
            bullet.hit();


            this.addEnemyWaves()
        }, null, this);


        this.physics.add.collider(this.player, this.enemys, (avatarPlayer, enemy) => {
            this.player.onHit(enemy);
        }, null, this);

        // __ game start now. 
        this.addEnemyWaves();

    }
    addbulletBlow(pos) {
        this.add.sprite(pos.x, pos.y, Resources.assetname, Resources.blow[0]) 
            .on("animationstart", (_, _2, self) => {
               
                this.tweens.add({
                    ease: "power2",
                    targets: self,
                    scale: 2,
                    alpha: 0,
                    onComplete: () => {
                        self.destroy();
                    }
                })

            }).play("blow")
    }
    addEnemyWaves() {
        if (this.enemys.getTotalUsed() > 0) {
            return;
        }
        this.enemyWaves += 1;
        while (this.enemys.getTotalUsed() < this.enemyWaves) {
            this.addEnemy();
        }
    }

    addEnemy() {

        const p = { x: Phaser.Math.Between(10, config.width - 50), y: Phaser.Math.Between(10, config.height - 100) };
        var enemy = this.enemys.create();
        enemy.setPosition(p.x, p.y);
        enemy.setTarget(this.player);
        // console.log(enemy)
        return enemy

    }

    update(time, delta) {
        this.viewport.update(time, delta);
        this.userKeyControl.update(time, delta);

        this.player.move(this.userKeyControl.getMovingVelocity());
    }
}

var config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 50,
    height: window.innerHeight - 100,

    pixelArt: true,
    parent: document.querySelector(".game__wrapper"),
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
    scene: [Boot, World],
};

const game = new Phaser.Game(config);
