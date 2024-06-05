import isMobile from "../src/isMobile.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
    this.level = 1;
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
  addLevel() {
    this.level += 1;
    this.events.emit("levelUp");
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
    const platforms = this.physics.add.group({ runChildUpdate: true });
    const floor = this.physics.add.group({ runChildUpdate: true });

    this.platforms = platforms;

    //this.createFloor(floor);
    const player = this.physics.add.sprite(100, center.y - 50, "dude", 5);
    player.doJump = () => {
      if (!player.body.touching.down) {
        return;
      }
      player.jumpvel = player.jumpMax + 0;
      player.jumping = true;
    };
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
      var firstPlatform = this.addPlatForm(player.x + 50, bottom, 100, 30);
      var lastPlatform = firstPlatform;
      var i = 8;
      while (i > 0) {
        let newplatform = this.addPlatForm(
          lastPlatform.x + 100,
          Phaser.Math.Between(bottom, bottom - player.jumpMax),
          Phaser.Math.Between(30, 100),
          30,
          lastPlatform
        );
        lastPlatform = newplatform;
        i--;
      }
      firstPlatform.setLastPlatform(lastPlatform);
      /* this.time.addEvent({
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
      }); */
    }
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, floor);

    //  Input Events

    console.log("MOBILE");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on("pointerdown", (e, g) => {
      if (g.length > 0) {
        return;
      }
      player.doJump();
    });
    this.input.on("pointerup", () => {
      player.jumping = false;
    });

    console.log("PC");
    var spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    spaceBar.on("down", () => {
      player.doJump();
    });
    spaceBar.on("up", () => {
      player.jumping = false;
    });

    this.fsbutton();
  }
  createFloor(floorGroup) {
    const floor = floorGroup
      .create(0, this.scale.height, "ground")
      .setDisplaySize(this.scale.width, 10);

    //platform.body.x = platform.x - width / 2;
    floor.body.setAllowGravity(false);
    floor.body.setSize(platform.width, 10);

    return platform;
  }
  addPlatForm(x, y, width, height, _lastplatform) {
    const platform = this.platforms
      .create(x, y, "ground")
      .setDisplaySize(width, height);

    //platform.body.x = platform.x - width / 2;
    platform.body.setAllowGravity(false);
    platform.body.setSize(platform.width + this.player.width * 2, height);
    platform.body.immovable = true;
    platform.id = this.platforms.children.entries.length;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.right = false;
    platform.body.velocity.x = -50 * this.level;
    platform.lastplatform = _lastplatform;
    // Automatically kill the pipe when it's no longer visible
    platform.setLastPlatform = (lastPlatform) => {
      platform.lastplatform = lastPlatform;
    };
    const onLevelUp = () => {
      platform.body.velocity.x = -50 + -10 * this.level;
    };
    this.events.on("levelUp", onLevelUp);

    platform.update = () => {
      if (!platform.lastplatform) {
        console.log("no last platform", platform.id);
        return;
      }
      if (platform.x < -platform.displayWidth / 2) {
        platform.x =
          platform.lastplatform.x + platform.lastplatform.displayWidth + 100;
        if (platform.id === 5) {
          console.log("LEVEL UP");
          this.addLevel();
        }
      }
    };
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
          //toggleFullScreen(true)
          this.scale.startFullscreen();
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

  update(t, d) {
    this.player.body.velocityX = 100 - this.player.x;
    if (this.player.jumping) {
      if (this.player.jumpvel > 1) {
        const gravity = 1.2;
        this.player.setVelocityY(-this.player.jumpvel);
        if (!this.player.gravity_force) {
          this.player.gravity_force = 0;
        }
        this.player.gravity_force = Math.min(
          gravity,
          this.player.gravity_force + 0.01
        );
        this.player.jumpvel = Math.max(-gravity, this.player.jumpvel - gravity);
      }
    }
    if (this.player.y > this.scale.height + 10) {
      this.player.y = 10;
    }
  }
}
