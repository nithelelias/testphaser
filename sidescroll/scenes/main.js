import lockToFullScaleLandScape from "../src/lockToFullScaleLandScape.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
    this.platform_velocity = 0.001;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet("fullscreen", "assets/fullscreen.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }
  create() {
    const maxHeight = this.game.scale.height;
    let center = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };
    this.center = center;
    this.add
      .image(center.x, center.y, "sky")
      .setDisplaySize(this.scale.width, this.scale.height);
    const platformcontainer = this.add.container(0, 0, []);
    this.platformcontainer = platformcontainer;
    //  The platforms group contains the ground and the 2 ledges we can jump on
    const platforms = this.physics.add.group();

    this.platforms = platforms;

    const player = this.physics.add.sprite(100, center.y - 50, "dude", 5);
    this.player = player;
    player.jumpMax = 200;
    player.is_touching_down = false;
    player.isDown = () => {
      if (player.body.touching.down) {
        player.is_touching_down = true;
        clearTimeout(player.cartoonTime_playerisdown_lastTimeoutId);
        player.cartoonTime_playerisdown_lastTimeoutId = setTimeout(() => {
          player.is_touching_down = false;
        }, 100);
      }
      return player.is_touching_down;
    };
    //
    {
      const bottom = center.y * 1.8;
      const right = this.scale.width;
      var lastPlatform = this.addPlatForm(player.x + 50, bottom, 100, 30);

      this.time.addEvent({
        delay: 10,
        loop: true,
        callback: () => {
          if (lastPlatform.x + lastPlatform.displayWidth < right) {
            lastPlatform = this.addPlatForm(
              lastPlatform.x + 100,
              Phaser.Math.Between(bottom, bottom - player.jumpMax),
              Phaser.Math.Between(30, 100),
              30
            );
          }
        },
      });
    }
    this.physics.add.collider(player, platforms);

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on("pointerdown", (e, g) => {
      if (g.length > 0 || !player.body.touching.down) {
        return;
      }
      player.jumpvel = player.jumpMax + 0;
      player.jumping = true;
    });
    this.input.on("pointerup", () => {
      player.jumping = false;
    });
    this.fsbutton();
  }
  addPlatForm(x, y, width, height) {
    const platform = this.platforms
      .create(x, y, "ground")
      .setDisplaySize(width, height);

    //platform.body.x = platform.x - width / 2;
    platform.body.setAllowGravity(false);
    platform.body.immovable = true;

    platform.body.checkCollision.left = false;
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.right = false;
    platform.body.velocity.x = -50;
    // Automatically kill the pipe when it's no longer visible
    platform.checkWorldBounds = true;
    platform.outOfBoundsKill = true;
    this.platformcontainer.add(platform);
    return platform;
  }
  fsbutton() {
    if (!this.scale.fullscreen.available) {
      return;
    }
    const button = this.add
      .image(this.scale.width - 16, 16, "fullscreen", 0)
      .setDisplaySize(16, 16)
      .setOrigin(1, 0)
      .setInteractive();

    button.on(
      "pointerup",
      function () {
        if (this.scale.isFullscreen) {
          button.setFrame(0);
          this.scale.stopFullscreen();
        } else {
          button.setFrame(1);
          lockToFullScaleLandScape();
        }
      },
      this
    );
  }
  blurFx() {
    // Add the BlurPostFX effect to the camera
    const blurFactor = 2; // Adjust this value to control the blur intensity
    return this.cameras.main.setPostPipeline(
      Phaser.Renderer.WebGL.Pipelines.FX.Blur,
      {
        intensity: blurFactor,
      }
    );
  }
  unBlurFx() {
    this.cameras.main.resetPostPipeline();
  }
  checkOrientation() {
    const orientation = screen.orientation.type;

    if (orientation !== Phaser.Scale.LANDSCAPE) {
      this.blurFx();
      this.scene.pause();
      this.scene.sendToBack();
      this.scene.run("lockportrait");
      this.scene.get("lockportrait").scene.setActive(true);
      this.scene.get("lockportrait").onEnd(() => {
        this.unBlurFx();
      });
    }
  }
  update(t, d) {
    this.checkOrientation();
    this.player.body.velocityX = 100 - this.player.x;
    if (this.player.jumping) {
      if (this.player.jumpvel > 1) {
        this.player.setVelocityY(-this.player.jumpvel);
        const gravity = 1.2;
        this.player.jumpvel = Math.max(0, this.player.jumpvel - gravity);
      }
    }
    if (this.player.y > this.scale.height + 10) {
      this.player.y = 100;
    }
  }
}
