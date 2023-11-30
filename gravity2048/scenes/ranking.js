import { COLORS, animals } from "../constants.js";
import { getRanking } from "../storage.js";

const getanimalByPoints = (max_points) => {
  let idx = max_points;

  let animal = animals[Math.min(idx, animals.length - 1)];
  return animal;
};
const newicon = (x, y, texture, frame, size = 32) => {
  const scene = Ranking.current;
  let img = scene.add.image(x, y, texture, frame);
  let wrapper = scene.add.container(0, 0, [img]);

  let rate = size / img.width;
  img.setDisplaySize(rate * img.width, rate * img.height);
  img.setOrigin(0, 0.5);
  wrapper.setSize(img.displayWidth, img.displayHeight);
  wrapper.img = img;
  return wrapper;
};
export default class Ranking extends Phaser.Scene {
  static current;
  constructor() {
    super("ranking");
  }
  create() {
    Ranking.current = this;
    this.add
      .rectangle(
        0,
        0,
        this.scale.width,
        this.scale.height,
        Number(COLORS.secundary.replace("#", "0x")),
        0.8
      )
      .setOrigin(0);

    const icon = newicon(this.scale.width / 2, 64, "crown", null, 128);
    icon.img.setOrigin(0.5);
    let title = this.add
      .text(this.scale.width / 2, icon.y + icon.height + 16, "RANKING", {
        fontFamily: "main-font",
        fontSize: 64,
        color: COLORS.text,
      })
      .setShadow(2, 2, "#333333", 2, false, true)
      .setOrigin(0.5);
    let container = this.createRankingContainer();
    container.y = title.y + title.height + 32;
    let button = this.createButton(title.x, container.y + 400, "Volver", () => {
      this.scene.stop();
      this.scene.resume("main");
    });
  }
  createButton(x, y, text, callback) {
    let button = this.add.container(x, y, [
      this.add.rectangle(
        0,
        0,
        100,
        30,
        Number(COLORS.secundary.replace("#", "0x")),
        0.1
      ),
      this.add
        .text(0, 0, text, {
          fontFamily: "main-font",
          fontSize: 22,
          align: "center",
          color: COLORS.text,
        })
        .setShadow(2, 2, "#333333", 2, false, true)
        .setOrigin(0.5),
    ]);
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
        callback();
      });
    });

    return button;
  }
  createRankingContainer() {
    const loader = this.createLoadingContainer();
    const container = this.add.container(0, 0, [loader]);

    // container.add(this.obtainTestRanking());
    this.requestRankingToServerSide(container).then(() => {
      container.remove(loader);
      loader.destroy();
    });
    return container;
  }
  requestRankingToServerSide(container) {
    return getRanking().then((response) => {
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

      const table = this.createRankingTable(ranking);
      container.add(table);
    });
  }
  createLoadingContainer() {
    const loader = this.add.container(0, 0, [
      this.add
        .text(this.scale.width / 2, 82, ["Loading the chiks and pigs . . ."], {
          fontFamily: "alter-font",
          fontSize: 16,
          align: "center",
          color: COLORS.text,
        })
        .setStroke(0x111111 , 3)
        .setOrigin(0.5),
    ]);
    return loader;
  }
  obtainTestRanking() {
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

    return this.createRankingTable(rankin);
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
      usernameTxt.setSize(70, 32);
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
}
