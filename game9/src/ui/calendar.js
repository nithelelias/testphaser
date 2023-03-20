import { MONTHS } from "../constants.js";
import STATE from "../state.js";
import { padStartNum } from "../utils.js";

export default function Calendar(scene, x, y) {
  const calendarBg = scene.add
    .image(0, 0, "calendar")
    .setDisplaySize(128, 128)
    .setOrigin(0);
  const calendarMonthText = scene.add
    .dynamicBitmapText(64, 36, "font1", ["Fecha:..."], 28)
    .setLetterSpacing(4)
    .setCenterAlign()
    .setOrigin(0.5);
  const dateText = scene.add
    .dynamicBitmapText(64, 78, "font1", ["Fecha:..."], 48)
    .setCenterAlign()
    .setLetterSpacing(4)
    .setTint(0x111111)
    .setOrigin(0.5);
  const container = scene.add.container(x, y, [
    calendarBg,
    calendarMonthText,
    dateText,
  ]);

  this.update = () => {
    calendarMonthText.setText([MONTHS[STATE.DATE.month]]);
    dateText.setText([padStartNum(STATE.DATE.day)]);
  };
  this.getContainer = () => {
    return container;
  };
  this.destroy = () => {
    calendarBg.destroy();
    dateText.destroy();
    calendarMonthText.destroy();
    container.destroy();
  };

  this.update();
}
