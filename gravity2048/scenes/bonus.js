import { COLORS } from "../constants.js";
const rndm = (min, max) => Phaser.Math.RND.between(min, max);
export default class Bonus extends Phaser.Scene {
  constructor() {
    super({
      key: "bonus",
      physics: {
        matter: {
          debug: true,
          gravity: { y: 1 },
        },
      },
    });
  }
  create() {
    this.catchChickens();
  }
  createAnimal(x, y, animal) {
    let mob = this.matter.add.sprite(x, y, "animals", animal + ".png");

    let radius = 32;
    let rate = radius / mob.width;
    mob.setDisplaySize(rate * mob.width, rate * mob.height);
    mob.setCircle(radius / 2);
    mob.setBounce(0.95);

    return mob;
  }
  catchChickens_test() {
    this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);

    window.mob = this.createAnimal(100, 100, "chick");
    window.mob.setVelocity(rndm(-3, 3), rndm(-3, 3));
  }
  catchChickens() {
    let points = 0;
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, COLORS.primary, 0.5)
      .setOrigin(0);

    this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height);

    let counter = this.add
      .text(this.scale.width / 2, this.scale.height / 2, ["!BONUS TIME!"], {
        fontFamily: "main-font",
        fontSize: 64,
        color: COLORS.text,
        align: "center",
      })
      .setStroke("#de77ae", 16)
      .setShadow(2, 2, "#333333", 2, true, true)
      .setOrigin(0.5);

    const start = () => {
      let mobList = [];
      let total = 6; //
      let seconds = total - 1;
      counter.setText(seconds);
      counter.setFontSize(92);
      counter.y = 80;
      let timeEvent = this.time.addEvent({
        delay: 1000,
        repeat: 4,
        callback: () => {
          seconds--;
          counter.setText(seconds);
          if (seconds <= 0) {
            lose();
          }
        },
      });
      const win = () => {
        timeEvent.destroy();
        counter.setText("WIN!!");
        counter.setPosition(counter.x, this.scale.height / 2);

        this.end(true);
      };
      const lose = () => {
        counter.setPosition(counter.x, this.scale.height / 2);
        counter.setText("LOSE");
        for (let i in mobList) {
          mobList[i].destroy();
        }
        timeEvent.destroy();
        this.end(false);
      };
      for (let i = 0; i < total; i++) {
        let mob = this.createAnimal(rndm(0, this.scale.width), 10, "chick");

        mob.setVelocity(rndm(-2, 2), rndm(-2, 2));
        mob.setInteractive();
        mobList.push(mob);
        mob.on("pointerdown", () => {
          mob.destroy();
          points++;
          if (points >= total) {
            win();
          }
        });
      }
    };

    this.time.addEvent({
      delay: 2000, 
      callback: () => {
        start();
      },
    });
  }

  clear() {
    while (this.children.list.length > 0) {
      this.children.list[0].destroy();
    }
  }

  end(win) {
    console.log("end ", win);
    setTimeout(() => {
      const main = this.scene.get("main");
      this.scene.stop();
      main.resumeFromBonus(win);
    }, 1200);
  }
}
