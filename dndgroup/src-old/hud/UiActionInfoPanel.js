import { COLORS } from "../constants.js";
import RESOURCES from "../resources.js";
import TextFromSprite from "../textFromSprite.js";

const PADDING = 16,
  HALF_PADDING = 8;
var current = null;
const itemsResourceFrame = RESOURCES.frames.resource_icons;
function parseItemsToString(dicItems, prepend = null) {
  const array = [];
  for (let name in dicItems) {
    let value = dicItems[name];
    let frame = itemsResourceFrame[name];
    array.push(
      `:frame(${frame}) ` + (prepend ? prepend : value > 0 ? "+" : "") + value
    );
  }
  return array.join(" ");
}
export const DATA_INFO = {
  icon: 100,
  title: "titulo",
  description: "descripcion",
  no_cost: true,
  gold_cost: 0,
  food_cost: 0,
};

export default class UiActionInfoPanel extends Phaser.GameObjects.Container {
  static width = 200;
  static height = 180;

  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add
        .rectangle(
          0,
          0,
          UiActionInfoPanel.width + PADDING,
          UiActionInfoPanel.height + PADDING,
          COLORS.UI_BACKGROUND1,
          0.5
        )
        .setOrigin(0),
    ]);
    this.icon = scene.add.image(PADDING, PADDING, RESOURCES.name, 100);
    this.life = new TextFromSprite(
      scene,
      UiActionInfoPanel.width - PADDING - 16,
      8,
      "life",
      {
        name: RESOURCES.name,
        chars: RESOURCES.chars,
      },
      {
        fontSize: 16,
        spacing: 10,
      }
    );
    this.life.onUpdate((chars) => {
      chars.forEach((char) => {
        if (char.data_character.frame === RESOURCES.frames.heart) {
          char.setTintFill(COLORS.red);
        }
      });
    });

    this.title = scene.add
      .bitmapText(UiActionInfoPanel.width / 2, PADDING / 2, "font1", "", 16)
      .setTint(COLORS.white)
      .setDropShadow(1, 1)
      .setOrigin(0.5, 0);

    this.description = scene.add
      .bitmapText(UiActionInfoPanel.width / 2, 32, "font1", "", 12)
      .setTint(COLORS.white)
      .setDropShadow(1, 1)
      .setOrigin(0.5, 0);

    this.bodyinfo = new TextFromSprite(
      scene,
      8,
      64,
      "resources",
      {
        name: RESOURCES.name,
        chars: RESOURCES.chars,
      },
      {
        fontSize: 16,
        spacing: 9,
      }
    );
    this.bodyinfo.onUpdate((chars) => {
      chars.forEach((char) => {
        if (char.data_character.character === "+") {
          char.setTintFill(COLORS.green);
          return;
        }
        if (char.data_character.character === "-") {
          char.setTintFill(COLORS.red);
          return;
        }
        if (char.data_character.frame === itemsResourceFrame.gold) {
          char.setTintFill(COLORS.yellow);
          return;
        }
        if (char.data_character.frame === itemsResourceFrame.food) {
          char.clearTint();
          return;
        }
      });
    });
    this.add([
      this.icon,
      this.life,
      this.title,
      this.description,
      this.bodyinfo,
    ]);
    this.hide();

    scene.add.existing(this);
    current = this;
  }
  static hide() {
    current.hide();
  }
  static setInfo(info = DATA_INFO) {
    current.setInfo(info);
  }
  hide() {
    this.setVisible(false);
  }
  setInfo(entity = null, info = DATA_INFO) {
    this.current_info = info;
    this.icon.setFrame(info.icon);
    this.title.setText(info.title);
    this.life.setText(
      ":frame(" +
        RESOURCES.frames.heart +
        ")" +
        (entity ? entity.life : info.life)
    );
    this.life.x = UiActionInfoPanel.width - this.life.width - HALF_PADDING;
    this.description.setText(info.description);
    let body_text = [];

    if (info.add) {
      body_text.push("add:");
      body_text.push(" " + parseItemsToString(info.add, "+"));
      body_text.push("");
    }
    if (info.cost) {
      body_text.push("cost:");
      body_text.push(" " + parseItemsToString(info.cost, "-"));
      body_text.push("");
    }

    if (info.every) {
      body_text.push("every tick: ");
      body_text.push(" " + parseItemsToString(info.every));
      body_text.push(" ");
    }
    if (info.attack) {
      body_text.push("attack: ");
      let attack_info_string = Object.keys(info.attack).map(
        (prop) =>
          `${info.attack[prop]}:frame(${RESOURCES.frames.attack_icons[prop]})`
      ).join("  ")
      body_text.push(attack_info_string);
    }

    this.bodyinfo.setText(body_text);
    this.setVisible(true);
  }
}
