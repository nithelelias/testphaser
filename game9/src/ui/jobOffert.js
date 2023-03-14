import { COLORS, COLORS_SENIORITY, MONTHS } from "../constants.js";
import { calcJobOfferSuccesProb } from "../jobOfferPool.js";
import Job from "../models/job.js";
import { Button } from "./ui.js";
const expirationTag = "expiration_date";
const addText = (scene, _text, _fontSize = 16, maxW) => {
  let t = scene.add
    .bitmapText(0, 0, "font1", _text, _fontSize)
    .setTintFill(0xf1f1f1)
    .setOrigin(0.5, 0)
    .setMaxWidth(maxW);
  return t;
};
const fontSizes = {
  big: 48,
  title: 32,
  subtitle: 24,
  normal: 16,
};
export default class JobOffert extends Phaser.GameObjects.Container {
  constructor(scene, x, y, job = new Job(), maxWidth = 200) {
    super(scene, x, y, [
      scene.add
        .image(0, 0, "rect")
        .setOrigin(0.5, 0)
        .setTintFill(0x111111)
        .setAlpha(1),

      addText(scene, "job.companyName", fontSizes.title, maxWidth),
      addText(scene, "Solicita", fontSizes.normal, maxWidth),

      addText(
        scene,
        "job.jobTitle",
        fontSizes.subtitle,
        maxWidth
      ).setCenterAlign(),
      addText(scene, "Vence:", fontSizes.normal, 100),
      addText(scene, expirationTag, fontSizes.subtitle, 100)
        .setTintFill(COLORS.yellow)
        .setDropShadow(0, 3, 0x000000, 1),

      addText(scene, "Salario: ", fontSizes.normal, 100),
      addText(scene, "job.salary", fontSizes.big)
        .setTintFill(COLORS.green)
        .setDropShadow(0, 3, 0x000000, 1),

      addText(scene, "Capacidades", fontSizes.normal, maxWidth),
      addText(scene, "job.seniority", fontSizes.title, maxWidth).setDropShadow(
        0,
        2,
        0x000000,
        1
      ),
      addText(
        scene,
        [""].concat(
          job.requirements.map((_requirement) => {
            return (
              " *  " +
              _requirement.knowledge +
              ` [ ${_requirement.knowledge_level}% ]`
            );
          })
        ),
        fontSizes.normal,
        maxWidth - 30
      ),
      new Button(scene, 0, lastY, "Aplicar", fontSizes.big),

      addText(scene, "success", fontSizes.normal, maxWidth),
    ]);
    this.applyBtn = null;
    this.rateText = null;
    var maxHeight = 50;
    var lastY = 30;
    var marginY = 12;
    var successRate = calcJobOfferSuccesProb(job);
    this.list.forEach((_element, idx) => {
      let tag = _element.isButton
        ? ""
        : [].concat(_element?.text || "").join(" ");
      if (_element.isButton) {
        this.applyBtn = _element;
      }
      if (tag === "job.seniority") {
        _element
          .setText(job.seniority)
          .setTintFill(COLORS_SENIORITY[job.seniority]);
      } else if (tag === "job.salary") {
        _element.setText("$" + job.salary + ".00");
      } else if (tag.indexOf("job.") > -1) {
        let property = tag.split(".")[1];
        if (job[property]) {
          _element.setText(job[property]);
        } else {
          console.log("property not found");
        }
      } else if (tag === expirationTag) {
        _element.setText(
          job.expirationDate.day + "-" + MONTHS[job.expirationDate.month]
        );
      } else if (tag === "success") {
        this.rateText = _element;
      }
      let height = _element.displayHeight || _element.height;
      _element.y = lastY;
      lastY = _element.y + height + marginY;
    });
    maxHeight = lastY + marginY;
    this.list[0].setDisplaySize(maxWidth, maxHeight + 20);
    this.setSize(maxWidth, maxHeight + 20);
    this.setDisplaySize(maxWidth, maxHeight + 20);
    let halfH = maxHeight / 2;
    this.list.forEach((_element, idx) => {
      _element.y -= halfH;
    });
    // RATE TEXT
    this.rate = successRate;
    this.rateText.setText("Prob. Exito " + successRate + "%");
    this.__tintSuccesRateText();
    // this.setInteractive();
    this.applyBtn.x = 0;
    this.applyBtn.y += this.applyBtn.height / 2 + marginY;
    this._onclick_callback = null;

    this.applyBtn.onClick(() => {
      if (this._onclick_callback) {
        this._onclick_callback(job, successRate);
      }
    });
  }
  __tintSuccesRateText() {
    let color = 0xffffff;
    if (this.rate < 10) {
      color = COLORS.red;
    } else if (this.rate < 40) {
      color = COLORS.yellow;
    } else if (this.rate < 60) {
      color = COLORS.orange;
    }
    this.rateText.setTintFill(color);
  }
  onClick(_callback) {
    this._onclick_callback = _callback;
  }
}
