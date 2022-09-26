var config = {
  type: "customEnvironment",
  customEnvironment: true,
  canvas: document.querySelector(".game__canvas"),
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var player_is_touchingDown = false,
  cartoontime_timeout = 100,
  cartoonTime_playerisdown_lastTimeoutId = null;
const player_jump_vel = 300;
var game = new Phaser.Game(config);
const sounds = {};
function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("pared", "assets/pared.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
  // AUDIO
  this.load.audio("jump", "./assets/audio/jump.mp3");
  this.load.audio("step", "./assets/audio/step.mp3");
  this.load.audio("pickup", "./assets/audio/pickup.mp3");
  this.load.audio("lose", "./assets/audio/lose.mp3");
  this.load.audio("jinggle", "./assets/audio/jinggle.mp3");
}

function create() {
  sounds.jump = this.sound.add("jump", { loop: false, volume: 0.2 });
  sounds.step = this.sound.add("step", { loop: false, volume: 0.2, rate: 3 });
  sounds.pickup = this.sound.add("pickup", { loop: false, volume: 0.2 });
  sounds.lose = this.sound.add("lose", { loop: false, volume: 0.2 });
  sounds.jinggle = this.sound.add("jinggle", { loop: false, volume: 0.2 });
  //  A simple background for our game
  this.add.image(400, 300, "sky");

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, "ground");
  platforms.create(50, 220, "ground");
  platforms.create(750, 220, "ground");
  platforms.create(0, 400, "ground").setScale(0.5, 1).refreshBody();
  platforms.create(300, 350, "ground").setScale(0.2, 1).refreshBody();
  // PARED
  const pared = platforms
    .create(400, 360, "pared")
    .setScale(1, 1.5)
    .refreshBody();
  //.setAngle(90).setWidth(32).setHeight(400);
  // The player and its settings
  player = this.physics.add.sprite(100, 450, "dude");

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  //player.setCollideWorldBounds(true);

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: "star",
    repeat: 14,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child, i) {
    if (i == 12) {
      child.x = 500;
      child.y = 400;
    }
    if (i == 13) {
      child.x = 580;
      child.y = 400;
    }
    if (i == 14) {
      child.x = 640;
      child.y = 400;
    }
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  bombs = this.physics.add.group();

  //  The score
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

  window.$player = player;
  window.$sounds = sounds;
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }
  playerIsWalking();
  playerIsDown();
  if (cursors.up.isDown && player_is_touchingDown) {
    player.setVelocityY(-player_jump_vel);
    sounds.jump.play();
  }

  // MIRROR HORIZONTAL
  if (player.body.velocity.x < 0 && player.x < 1) {
    player.x = config.width - 1;
  } else if (player.body.velocity.x > 0 && player.x > config.width) {
    player.x = 1;
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);
  sounds.pickup.play();
  if (stars.countActive(true) === 0) {
    sounds.jinggle.play();
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");
  sounds.lose.play();
  gameOver = true;
}

function playerIsDown() {
  if (player.body.touching.down) {
    player_is_touchingDown = true;
    clearTimeout(cartoonTime_playerisdown_lastTimeoutId);
    cartoonTime_playerisdown_lastTimeoutId = setTimeout(() => {
      player_is_touchingDown = false;
    }, cartoontime_timeout);
  }
  return player_is_touchingDown;
}

function playerIsWalking() {
  if (player.body.velocity.x != 0 && player.body.touching.down) {
    if (!sounds.step.isPlaying) {
      sounds.step.play();
    }
  }
}
