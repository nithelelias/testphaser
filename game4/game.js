
import Enemy from "./entities/enemy.js";
import UserKeyControls from "./entities/userKeyControls.js";
import Player from "./entities/player.js";
import Projectile from "./entities/proyectile.js";
import Weapon from "./entities/weapon.js";
import Resources from "./models/resources.js";
import Map from "./entities/map.js";
import random from "../common-utils/random.js";

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
        this.interactions = {};
        window.$world = this;
    }
    create() {
        this.doors = [];
        this.totalWaves = 1;// Phaser.Math.Between(3, 5);
        this.userKeyControl = new UserKeyControls(this);
        this.scale = 4;
        this.map = new Map(this);
        this.enemys = this.physics.add.group({
            classType: Enemy, runChildUpdate: true
        });
        this.interactions = this.physics.add.group();
        this.playerProjectiles = this.physics.add.group({
            classType: Projectile, runChildUpdate: true,
        });
        this.worldlayer = this.physics.add.group();
        // physics

        this.stage = this.add.group({
            runChildUpdate: true
        })
        this.player = new Player(this, 0, 0);
        // adding physincs... 
        this.stage.add(this.physics.add.existing(this.add.existing(this.player)))
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

        this.physics.add.collider(this.player, this.map.layer);
        this.physics.add.collider(this.enemys, this.map.layer);
        this.physics.add.collider(this.playerProjectiles, this.map.layer, (bullet) => {
            bullet.hit();
            this.addbulletBlow(bullet);
        }, null, this);

        this.physics.add.overlap(this.enemys, this.playerProjectiles, (enemy, bullet) => {
            this.addbulletBlow(bullet);
            // --console.log(enemy)
            enemy.onHit(bullet).then(() => {
                setTimeout(() => {
                    this.clearWave();
                }, 1000)
            })
            bullet.hit();



        }, null, this);

        this.physics.add.overlap(this.player, this.interactions, (player, interactor) => {

            if (interactor.act) {
                interactor.act();
            }
        }, null, this);

        this.physics.add.collider(this.player, this.enemys, (avatarPlayer, enemy) => {
            this.player.onHit(enemy);
        }, null, this);


        // CAMARA 
        this.cameras.main.startFollow(this.player);

        //  
        this.changeRoom();
    }
    changeRoom() {


        this.map.generateRoom();
        this.map.removeWallsAt(this.getNextDoorsTiles(true));
        this.updateScale(3);
        this.addNextDoors();
        this.fitPlayer();
        this.addEnemyWaves();

    }

    fitPlayer() {
        const bounds = this.map.getBounds();
        this.player.x = this.map.getCenterTileToWorld().x;
        this.player.y = bounds.y + bounds.height * .92
    }
    updateScale(_scale) {
        this.scale = _scale;
        this.enemys.scale = _scale;
        this.map.setScale(this.scale);
        this.player.setScale(this.scale);
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
    clearWave() {
        if (this.enemys.getTotalUsed() > 0) {
            return
        }
        //
        this.totalWaves--;
        if (this.totalWaves > 0) {
            this.addEnemyWaves();
        } else if (this.totalWaves === 0) {

            this.addMiddleChest();
            this.openDoors();
        }
    }
    openDoors() {
        this.doors.forEach((door) => door.open())
    }
    getNextDoorsTiles(full = false) {
        const centerTile = this.map.getCenterTilePosition();
        return ([
            {
                x: (centerTile.x - 5),
                y: (0)
            }, {
                x: (centerTile.x + 4),
                y: (0)
            }
        ]).concat(full ? ([
            {
                x: (centerTile.x - 4),
                y: (0)
            }, {
                x: (centerTile.x + 5),
                y: (0)
            }
        ]) : [])
    }
    addNextDoors() {

        this.getNextDoorsTiles().map((tile) => {
            return {
                x: this.map.getWorlPositionFromTilePosition(tile.x),
                y: this.map.getWorlPositionFromTilePosition(tile.y),
            }
        }).forEach(doorItem => {
            const door = this.interactions.create(doorItem.x - this.map.tileSize
                ,
                doorItem.y + (this.map.tileSize*(this.scale-1)),
                Resources.assetname,
                Resources.door.close);
            door.setScale(this.scale*2)
            door.setDepth(1);
            door.setOrigin(0, 1);
            door.body.moves = false;
            let open = false;
            door.open = () => {
                open = true;
                door.setFrame(Resources.door.open);
            };
            door.act = () => {
                if (open) {
                    this.goNextRoom();
                }
            };
            this.physics.add.collider(this.player, door);
            this.doors.push(door)
        });
    }
    goNextRoom() {
        this.scene.restart();
    }
    addMiddleChest() {
        /// 
        const center = this.map.getCenterTileToWorld()
        let chest = this.interactions.create(center.x, center.y, Resources.assetname, Resources.chest.close);
        chest.scale = this.scale;
        chest.setDepth(1);
        chest.setOrigin(0.5, 1);
        chest.busy = false;
        chest.open = false;
        chest.act = () => {
            if (chest.busy) {
                return;
            }
            if (chest.open) {
                return;
            }
            chest.open = true;
            this.tweens.add({
                targets: chest,
                scale: this.scale * 3,
                duration: 305,
                ease: "Bounce.easeOut",
                onComplete: () => {
                    chest.setFrame(Resources.chest.open);
                    setTimeout(() => {
                        this.tweens.add({
                            targets: chest, scale: this.scale, delay: 300, ease: "Bounce.Out", duration: 100,
                            onComplete: () => chest.bounceDown()
                        });
                    }, 500)
                }
            });

        };
        chest.bounceDown = () => {
            if (chest.busy) {
                return
            }
            let bounceAngle = 15;

            chest.busy = true;
            let shake = () => {
                this.tweens.add({
                    targets: chest,
                    angle: bounceAngle,
                    duration: 100,
                    ease: "Bounce",
                    onComplete: () => {
                        if (bounceAngle !== 0) {
                            bounceAngle *= -.7;
                            if (Math.abs(bounceAngle) < .5) {
                                bounceAngle = 0;
                            }
                            shake();
                        } else {
                            chest.busy = false;
                        }
                    }
                });
            }

            shake();

        }
        this.tweens.add({
            targets: chest,
            scale: this.scale + 2,
            duration: 205,
            yoyo: true,
            onComplete: () => chest.bounceDown()
        });

    }
    addEnemyWaves() {
        console.log("enemy waves add")
        this.enemyWaves += 1;
        while (this.enemys.getTotalUsed() < this.enemyWaves) {
            this.addEnemy();
        }
    }

    addEnemy() {
        const bounds = this.map.getTileMapBounds();
        const p = {
            x: this.map.getWorlPositionFromTilePosition(random(2, bounds.width - 2)),
            y: this.map.getWorlPositionFromTilePosition(random(2, bounds.height - 5))
        };
        var enemy = this.enemys.create();
        enemy.setPosition(p.x, p.y);
        enemy.setTarget(this.player);
        // console.log(enemy)
        return enemy

    }

    update(time, delta) {
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
            tileBias: 16,
        },
    },
    scene: [Boot, World],
};

const game = new Phaser.Game(config);
