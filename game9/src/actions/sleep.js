import { TICK_HOUR } from "../constants.js";
import { ProgressBar } from "../ui/ui.js";
import { Deffered } from "../utils.js";

export default function Sleep(scene) {
  // add progress bar of day at top
  var deferred = new Deffered();
  var startY = scene.scale.height / 2 + 12;
  var wave = 0;
  var titleBar = scene.add
    .dynamicBitmapText(scene.scale.width / 2, startY, "font1", ["zzzzz"], 16)
    .setDisplayCallback((data) => {
      data.scale = 1 + 0.1 * data.index;
      data.y = 1 - 5 * data.index;
      data.y = Math.cos(wave + (1 - 5 * data.index)) * 10;
      wave += 0.01;
      return data;
    })
    .setOrigin(0.5, 1);
  var progressBar = new ProgressBar(
    scene,
    scene.scale.width / 2 - 64,
    startY + 64,
    128,
    12
  );
  scene.time.timeScale = 8;
  progressBar
    .setTimeout(8, (progress) => {
      scene.recoverHPBySleep();
    })
    .then(() => {
      titleBar.destroy();
      progressBar.destroy();
      deferred.resolve();
      scene.time.timeScale = 1;
    });

  return deferred.promise;
}
