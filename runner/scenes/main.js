const CARRILES = {
  center: "center",
  left: "left",
  right: "right",
};
function random(m1, m2) {
  return Phaser.Math.Between(m1, m2);
}

class Gem extends Phaser.GameObjects.Sprite {
  constructor(scene, carril, x, y, type) {
    super(scene, x, y, "gems");
    this.setOrigin(0.5);
    this.carril = carril;
    this.startY = y;
    this.startX = this.scene.scale.width / 2;
    this.x = this.startX;
    this.endX = x;
    this.progress = 0;
    this.setScale(0);
    this.play(type);
    this.progress = 0;
    scene.add.existing(this);
  }

  update() {
    this.progress += 0.005;
    if (this.progress > 1.5) {
      this.destroy();
      return;
    }
    //console.log(this.progress);
    const maxY = this.scene.scale.height * 0.9;
    const maxYDistance = maxY - this.startY;
    const maxXDistance = this.endX - this.startX;
    this.y = this.startY + maxYDistance * this.progress;
    this.x = this.startX + maxXDistance * this.progress;

    this.setDepth(this.progress * 10);
    this.setScale(this.progress);
    if (this.progress > 0.8 && this.progress < 1) {
      if (this.scene.player.carril === this.carril) {
        this.scene.addPoint();
        this.destroy();
      }
    }
  }
}

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
  }
  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.animation("gemData", "assets/gemsData.json");
    this.load.atlas("gems", "assets/gems.png", "assets/gems.json");
    this.load.spritesheet("player", "assets/sonic.png", {
      frameWidth: 36,
      frameHeight: 48,
    });
  }

  create() {
    this.points = 0;
    const center = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };
    this.add.image(center.x, center.y-100, "bg").setOrigin(0.5);
    this.groupGems = this.add.group({
      runChildUpdate: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    //
    // ---
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNames("player", {
        start: 4,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "player-turn-right",
      frames: this.anims.generateFrameNames("player", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "player-turn-left",
      frames: this.anims.generateFrameNames("player", {
        start: 8,
        end: 12,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.player = this.add
      .sprite(center.x, this.scale.height - 100)
      .setOrigin(0.5)
      .play("player-run")
      .setScale(2)
      .setDepth(22);
    this.player.busy = false;
    this.player.carril = CARRILES.center;

    this.caption = this.add.text(16, 16, "").setScrollFactor(0);

    this.time.addEvent({
      delay: 600,
      callback: () => {
        this.addGem(["center", "left", "right"][random(0, 2)]);
      },
      loop: true,
    });
  }
  addPoint() {
    this.points++;
  }
  getXByCarril(carril) {
    return (
      {
        left: 0.15,
        center: 0.5,
        right: 0.9,
      }[carril] * this.scale.width
    );
  }
  addGem(carril, type) {
    const floorY = this.scale.height / 2 - 80;

    this.groupGems.add(
      new Gem(this, carril, this.getXByCarril(carril), floorY, "diamond")
    );
  }
  updateCaption(delta) {
    this.caption.setText([
      `POINTS:${this.points}
       carril :  ${this.player.carril}
       MOVE:  ${
         this.cursors.left.isDown
           ? "LEFT"
           : this.cursors.right.isDown
           ? "RIGHT"
           : ""
       }
       

       
        `,
    ]);
  }
  movePlayer() {
    const player = this.player;
    const cursors = this.cursors;
    if (player.busy) {
      return;
    }
    if (cursors.left.isDown && player.carril === CARRILES.left) {
      return;
    }
    if (cursors.right.isDown && player.carril === CARRILES.right) {
      return;
    }

    player.busy = true;
    if (cursors.left.isDown) {
      player.carril = {
        [CARRILES.right]: CARRILES.center,
        [CARRILES.center]: CARRILES.left,
      }[player.carril];
      player.play("player-turn-left", true);
    }
    if (cursors.right.isDown) {
      player.carril = {
        [CARRILES.left]: CARRILES.center,
        [CARRILES.center]: CARRILES.right,
      }[player.carril];
      player.play("player-turn-right", true);
    }
    [player.carril];

    player.x = this.getXByCarril(player.carril);

    setTimeout(() => {
      player.play("player-run", true);
      player.busy = false;
    }, 300);
  }
  update() {
    this.movePlayer();
    this.updateCaption();
  }
}
