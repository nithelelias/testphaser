import { FONTS } from "../constants/values.js";
import Enemy from "../components/enemy.js";
import words from "../constants/words.js";
import Bullet from "../components/bullet.js";
import debounceMessage from "../components/speechPool.js";
const random = Phaser.Math.Between;
const desordedWORDS = words.sort(() => random(-10, 10));
const GAME_STATES = {
  idle: 1,
  spawing: 2,
  spawn_end: 3,
  end: 4,
};
const KEYSOUNDS = ["key-down", "key-down-2"];

export default class MainScene extends Phaser.Scene {
  enemiPool = [];
  bulletPool = [];
  level = 1;
  center = { x: 0, y: 0 };
  caption;
  explodeEmitter;
  levelTitle;
  started = false;
  lifes = 5;
  points = 0;
  currentState = GAME_STATES.idle;
  firstGame = true;

  constructor() {
    super({
      key: "main",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
    });
  }
  create() {
    this.enemiPool = [];
    this.bulletPool = [];
    this.center = {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
    };
    this.createExplosionEmitter();
    this.createCaption();
    this.createLevelTitle();
    this.createTextButtonOnce(
      this.center.x,
      this.center.y + 200,
      "START",
      () => {
        this.levelStart();
      }
    );
  }
  createTextButtonOnce(x, y, label, callback) {
    const btnText = this.add
      .text(x, y, label, {
        fontFamily: FONTS.font1,
        fontSize: 32,
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: "#fff",
        color: "#000",
        wordWrap: {
          width: 500,
        },
      })
      .setOrigin(0.5);
    const onComplete = () => {
      this.input.keyboard?.off("keydown", onKeyDown);
      btnText.off("pointerdown", onPointerDown);
      btnText.destroy();
      callback();
    };
    const onPointerDown = () => {
      btnText.setScale(0.8);
      btnText.once("pointerout", () => {
        btnText.setScale(1);
      });
      btnText.once("pointerup", () => {
        btnText.setScale(1);

        onComplete();
      });
    };
    btnText
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", onPointerDown);
    const onKeyDown = (a) => {
      this.keyDownSound();
      if (btnText.text[0].toLowerCase() === a.key.toLowerCase()) {
        btnText.setText(btnText.text.slice(1));
        debounceMessage(a.key);
        this.cameras.main.shake(60, 0.02);
        this.explodeAt(btnText.x, btnText.y);
      }
      if (btnText.text.length === 0) {
        onComplete();
      }
    };
    this.input.keyboard?.on("keydown", onKeyDown);
  }
  keyDownSound() {
    const soundName = KEYSOUNDS[random(0, KEYSOUNDS.length - 1)];
    this.sound.play(soundName, {
      volume: 0.5,
      rate: random(0.8, 1.2),
    });
  }
  createLevelTitle() {
    this.levelTitle = this.add
      .text(this.center.x, this.center.y, "LEVEL " + this.level, {
        fontFamily: FONTS.font1,
        fontSize: 64,
        align: "center",
        wordWrap: {
          width: 500,
        },
      })
      .setOrigin(0.5);
    if (this.firstGame) {
      this.levelTitle.setText("Escribe usa el teclado");

      this.firstGame = false;
    }
  }

  levelStart() {
    this.levelTitle?.setText("LEVEL " + this.level);
    this.tweens.add({
      targets: this.levelTitle,
      y: 100,
      duration: 1000,
      onComplete: () => {
        this.started = true;
        this.spawnEnemies();
      },
    });

    this.createPlayer();
    this.listenToKeyBoard();
  }
  createExplosionEmitter() {
    this.explodeEmitter = this.add.particles(0, 0, "__WHITE", {
      speed: 100,
      scale: { start: 3, end: 0 },
      tint: 0xff0000,
      tintFill: true,
      blendMode: "ADD",
      lifespan: 500,
      gravityY: 200,
      emitting: false,
    });
  }
  explodeAt(x, y) {
    this.explodeEmitter.explode(20, x, y);
  }
  spawnEnemies() {
    this.createEnemy();
    this.currentState = GAME_STATES.spawing;
    const repeat = 10;
    let current = repeat + 0;
    const event = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.createEnemy();
        current--;
        if (current == 0) {
          this.currentState = GAME_STATES.spawn_end;
          event.destroy();
        }
      },

      repeat,
    });
  }
  createCaption() {
    this.caption = this.add.text(20, 20, "", {
      fontFamily: FONTS.font1,
      fontSize: 32,
      wordWrap: {
        width: 500,
      },
    });
  }
  createPlayer() {
    const center = this.center;
    const playerSprite = this.add
      .image(center.x, center.y, "__WHITE")
      .setDisplaySize(32, 60);

    return playerSprite;
  }

  getNewEnemy(x, y) {
    const avaibleEnemy = this.enemiPool.find((enemy) => !enemy.active);
    if (avaibleEnemy) {
      avaibleEnemy.respawn(x, y);
      return avaibleEnemy;
    } else {
      const enemy = new Enemy(this, x, y);
      this.physics.add.existing(enemy);
      this.enemiPool.push(enemy);
      return enemy;
    }
  }
  getNewBullet(x, y) {
    const avaibleBullet = this.bulletPool.find((bullet) => !bullet.active);
    if (avaibleBullet) {
      avaibleBullet.respawn(x, y);
      return avaibleBullet;
    } else {
      const bullet = new Bullet(this, x, y);
      this.physics.add.existing(bullet);
      this.bulletPool.push(bullet);
      return bullet;
    }
  }

  createEnemy() {
    const x = random(0, 10) % 2 == 0 ? 20 : this.scale.width - 20,
      y = random(20, this.scale.height - 20);
    const enemy = this.getNewEnemy(x, y);

    const charsToBeat = desordedWORDS[random(0, desordedWORDS.length - 1)];
    enemy.setMyChar(charsToBeat);
    enemy.setSpeedLevel(random(this.level, this.level * 3));
  }
  shotBulletTo(enemy) {
    const bullet = this.getNewBullet(this.center.x, this.center.y);
    this.physics.moveTo(bullet, enemy.x, enemy.y, 2000);
    const angle = Phaser.Math.Angle.BetweenPoints(this.center, {
      x: enemy.x,
      y: enemy.y,
    });

    bullet.setAngle(angle);

    const kill = () => {
      bullet.kill();
      this.physics.moveTo(bullet, bullet.x, bullet.y, 0);
    };
    const hitEnemy = () => {
      kill();
      this.explodeAt(enemy.x, enemy.y);
      enemy.takeDamage();
      if (enemy.hasBeenKilled()) {
        this.killEnemy(enemy);
        this.addPoints(1);
      }
    };
    this.tweens.add({
      targets: bullet,
      x: enemy.x,
      y: enemy.y,
      duration: 100,
      ease: "sine.in",
      easeParams: [3, 4],
      onComplete: () => {
        hitEnemy();
      },
    });
  }

  listenToKeyBoard() {
    this.input.keyboard?.on("keydown", (a) => {
      this.keyDownSound();
      let succed = false;
      const char = a.key.toLowerCase();
      this.enemiPool.forEach((enemy) => {
        if (enemy.active) {
          const has = enemy.checkChar(char);
          if (has) {
            succed = true;
            this.shotBulletTo(enemy);
          }
        }
      });
      if (succed) {
        debounceMessage(char);
      }
    });
  }
  hitPlayer() {
    this.lifes--;
    this.cameras.main.shake(60, 0.02);
  }
  killEnemy(enemy) {
    this.explodeAt(enemy.x, enemy.y);
    enemy.kill();
    this.physics.moveTo(enemy, enemy.x, enemy.y, 0);
  }
  followEnemiesToCenter() {
    const center = this.center;

    this.enemiPool.forEach((enemy) => {
      if (enemy.active) {
        this.physics.moveTo(enemy, center.x, center.y, enemy.speed);
        if (Phaser.Math.Distance.BetweenPoints(enemy, center) < 50) {
          this.killEnemy(enemy);
          this.hitPlayer();
        }
      }
    });
  }
  addPoints(points) {
    this.points += points;
  }
  updateInfo() {
    this.caption.setText(`LIFES: ${this.lifes}\nPOINTS: ${this.points}`);
  }
  levelEnd(win) {
    this.started = false;
    this.currentState = GAME_STATES.end;
    this.tweens.add({
      targets: this.levelTitle,
      y: this.center.y - 100,
      duration: 1000,
      onComplete: () => {
        const message = win ? "YOU WIN" : "YOU LOSE";
        this.levelTitle.setText(message);
        if (win) {
          this.nextLevel();
        } else {
          this.lifes = 3;
          this.scene.restart();
        }
      },
    });
  }
  nextLevel() {
    this.level++;
    this.scene.restart();
  }
  validateGameWin() {
    if (this.currentState !== GAME_STATES.spawn_end) return;
    for (let i in this.enemiPool) {
      if (this.enemiPool[i].active) {
        return;
      }
    }

    this.levelEnd(true);
  }
  validateGameLose() {
    if (this.lifes < 1) {
      this.levelEnd(false);
    }
  }
  onUpdate() {
    this.followEnemiesToCenter();
    this.updateInfo();
    this.validateGameWin();
    this.validateGameLose();
  }
  update() {
    if (!this.started) return;
    this.onUpdate();
  }
}
