import { COLORS, animals } from "../constants.js";
import { getRanking, storeScore } from "../storage.js";
const getanimalByPoints = (max_points) => {
  let idx = max_points;

  let animal = animals[idx];
  return animal;
};
const newicon = (x, y, texture, frame, size = 32) => {
  const scene = End.current;
  let img = scene.add.image(x, y, texture, frame);
  let wrapper = scene.add.container(0, 0, [img]);

  let rate = size / img.width;
  img.setDisplaySize(rate * img.width, rate * img.height);
  img.setOrigin(0, 0.5);
  wrapper.setSize(img.displayWidth, img.displayHeight);
  wrapper.img = img;
  return wrapper;
};
export default class End extends Phaser.Scene {
  static current;
  constructor() {
    super("end");
  }
  create() {
    End.current = this;
    const points = this.game.points;
    let maxPoints = localStorage.getItem("max-points") || 0;
    let oldMaxPoints = maxPoints + 0;
    let newRecord = points > maxPoints;
    const rankinContainer = this.createRankingContainer();
    maxPoints = Math.max(maxPoints, points);
    localStorage.setItem("max-points", maxPoints);
    const container = this.add.container(0, 0, [
      this.add
        .rectangle(
          0,
          0,
          this.scale.width,
          this.scale.height,
          COLORS.accent,
          0.8
        )
        .setOrigin(0),
    ]);
    container.setDepth(1000);
    let title = this.add
      .text(this.scale.width / 2, 80, "GAME OVER", {
        fontFamily: "main-font",
        fontSize: 64,
        color: COLORS.text,
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    let totalTitle = this.add
      .text(
        this.scale.width / 2,
        title.y + title.height + 32,
        ["TOTAL POINTS"],
        {
          fontFamily: "main-font",
          fontSize: 24,
          align: "center",
          color: COLORS.text,
        }
      )
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    let pointsText = this.add
      .text(
        this.scale.width / 2,
        totalTitle.y + totalTitle.height + 32,
        [points],
        {
          fontFamily: "main-font",
          fontSize: 46,
          align: "center",
          color: COLORS.text,
        }
      )
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    let newRecordText = this.add
      .text(
        this.scale.width / 2,
        pointsText.y + pointsText.height + 16,
        newRecord ? ["¡¡NEW RECORD!!"] : [""],
        {
          fontFamily: "main-font",
          fontSize: 20,
          align: "center",
          color: COLORS.secundary,
        }
      )
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    let maxScoreTxt = this.add
      .text(
        this.scale.width / 2,
        newRecordText.y + newRecordText.height + 16,
        newRecord
          ? ["new  Best: " + oldMaxPoints + " -> " + maxPoints]
          : ["Personal Best: " + maxPoints],
        {
          fontFamily: "main-font",
          fontSize: 20,
          align: "center",
          color: "#FFFFFF",
        }
      )
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);

    let button = this.add.container(
      this.scale.width / 2,
      this.scale.height - 90,
      [
        this.add.rectangle(
          0,
          0,
          100,
          30,
          Number(COLORS.secundary.replace("#", "0x")),
          0.1
        ),
        this.add
          .text(0, 0, ["Play again"], {
            fontFamily: "main-font",
            fontSize: 22,
            align: "center",
            color: COLORS.text,
          })
          .setShadow(2, 2, "#333333", 2, false, true)
          .setOrigin(0.5),
      ]
    );
    button.list[0].setDisplaySize(
      button.list[1].width + 8,
      button.list[1].height + 8
    );
    button.setSize(button.list[1].width, button.list[1].height);
    button.setInteractive();
    button.on("pointerdown", () => {
      button.list[1].setScale(0.8);
      this.input.once("pointerup", () => {
        button.list[1].setScale(1);
      });
      button.once("pointerup", () => {
        this.resetGame();
      });
    });
    rankinContainer.y = maxScoreTxt.y + maxScoreTxt.height + 32;
    container.add([
      title,
      totalTitle,
      pointsText,
      newRecordText,
      maxScoreTxt,
      rankinContainer,
      button,
    ]);
  }
  createRankingContainer() {
    const loader = this.createLoadingContainer();
    const container = this.add.container(0, 0, [loader]);

    getRanking().then((response) => {
      if (!response) {
        return;
      }

      const ranking = JSON.parse(response).data.map((rank) => {
        rank.points = parseInt(rank.points);
        rank.max = parseInt(rank.max);
        return rank;
      });

      ranking.push({
        username: "TU NOMBRE",
        points: this.game.points,
        max: this.game.maxReach,
        input: "true",
      });
      ranking.sort((a, b) => b.points - a.points);
      if (ranking.length > 5) {
        ranking.splice(5);
      }
      container.remove(loader);
      loader.destroy();
      const table = this.createRankingTable(ranking);
      container.add(table);
    });

    return container;
  }
  createLoadingContainer() {
    const icon = newicon(this.scale.width / 2, 32, "crown", null, 128);
    icon.img.setOrigin(0.5);
    const loader = this.add.container(0, 0, [
      icon,
      this.add
        .text(this.scale.width / 2, 82, ["..."], {
          fontFamily: "alter-font",
          fontSize: 32,
          align: "center",
          color: COLORS.text,
        })
        .setOrigin(0.5),
    ]);
    return loader;
  }
  obtainRanking() {
    const rankin = [
      {
        username: "prueba 1",
        points: 30,
        max: 9,
      },
      {
        username: "prueba 2",
        points: 20,
        max: 6,
      },
      {
        username: "prueba 3",
        points: 10,
        max: 5,
      },

      {
        username: "prueba 4",
        points: 10,
        max: 4,
        input: true,
      },

      {
        username: "prueba 5",
        points: 10,
        max: 3,
      },
    ];

    this.createRankingTable(rankin);
  }

  createRankingTable(rankingList) {
    const container = this.add.container(0, 0, []);
    const newtext = (x, y, text, fontSize = 20, align = "left") => {
      return this.add
        .text(x, y, text, {
          fontFamily: "alter-font",
          fontSize,
          align,
          color: COLORS.text,
        })
        .setOrigin(0, 0.5);
      /* .setStroke(COLORS.primary, 3) */
    };

    const createRow = (rank, username, points, max, input) => {
      let wrapper = this.add.container(0, 0, []);
      let usernameTxt = newtext(0, 0, input ? "_   " : username);
      usernameTxt.setSize(100, 32);
      let row = this.add.container(0, 0, [
        newtext(0, 0, rank),
        newicon(0, 0, "animals", getanimalByPoints(max) + ".png"),
        usernameTxt,
        newtext(0, 0, points),
        newicon(0, 0, rank === 1 ? "crown" : rank < 4 ? "star" : "empty-star"),
      ]);
      let last = null;
      row.list.forEach((_entity) => {
        if (last) {
          _entity.x = last.x + Math.min(last.width, 100) + 32;
        }
        last = _entity;
      });
      row.setSize(300, 32);
      row.x = -parseInt(row.width / 2);
      let bg = this.add
        .rectangle(
          0,
          0,
          row.width + 52,
          row.height + 16,
          Number((input ? COLORS.secundary : COLORS.primary).replace("#", "0x"))
        )
        .setOrigin(0.5);
      wrapper.add([bg, row]);
      wrapper.setSize(row.width, row.height);

      if (rank === 1) {
        wrapper.setScale(1.2);
      }
      if (input) {
        wrapper.setScale(1.3);

        row.list[0].setFontSize(32).setScale(0.7);
        row.list[2].setFontSize(32).setScale(0.7);
        row.list[3].setFontSize(32).setScale(0.7);
        setTimeout(() => {
          wrapper.parentContainer.bringToTop(wrapper);
        }, 10);
        let label = newtext(
          this.scale.width / 2,
          this.scale.height / 2 + 206,
          "Save  your   name",
          42,
          "center"
        );

        label.setOrigin(0.5);
        label.setDepth(1001);
        this.createInputListener(
          usernameTxt,
          () => {
            wrapper.setScale(rank === 1 ? 1.2 : 1);

            label.destroy();
            row.list[0].setFontSize(20).setScale(1);
            row.list[2].setFontSize(20).setScale(1);
            row.list[3].setFontSize(20).setScale(1);
            this.storeToServerSide(usernameTxt.text);
          },
          () => {
            label.setFontSize(32);
            label.setText(["press   enter   to   save"]);
          }
        );
      }
      return wrapper;
    };

    rankingList.forEach((_rank, _idx) => {
      container.add(
        createRow(
          _idx + 1,
          _rank.username,
          _rank.points,
          _rank.max,
          _rank.input
        )
      );
    });

    Phaser.Actions.GridAlign(container.list, {
      width: 1,
      height: 10,
      cellWidth: 0,
      cellHeight: 52,
      x: this.scale.width / 2 - 150,
      y: 0,
    });
    container.list[0].y -= 8;
    return container;
  }
  createInputListener(textEntry, onEnd, onTypeStart) {
    textEntry.setText("");
    const unbind = () => {
      this.input.keyboard.off("keydown", onKeyDown);
      onEnd();
    };
    const onKeyDown = (event) => {
      if (event.keyCode === 13) {
        unbind();
        return;
      }

      if (event.keyCode === 8 && textEntry.text.length > 0) {
        textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
        return;
      }
      if (textEntry.text.length > 8) {
        return;
      }
      if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
        textEntry.text += event.key;
        onTypeStart();
        return;
      }
    };
    this.input.keyboard.on("keydown", onKeyDown);
  }
  storeToServerSide(username) {
    storeScore(username, this.game.points, this.game.maxReach);
  }
  resetGame() {
    this.scene.restart("main");
    this.scene.stop();
    const main = this.scene.get("main");
    main.resetGame();
  }
}
