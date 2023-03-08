import { ProgressBar } from "../ui.js";
import { Deffered } from "../utils.js";

export default function LookingJobState(scene) {
  // add progress bar of day at top
  var deferred = new Deffered();
  console.log("START DAY");
  var startY = 100;
  var titleBar = scene.add
    .bitmapText(scene.scale.width / 2, startY, "font1", ["Dia en progreso"], 16)
    .setOrigin(0.5, 1);
  var progressBar = ProgressBar(
    scene,
    10,
    startY + 20,
    scene.scale.width - 20,
    12
  );
  progressBar.setTimeout(3000).then(() => {
    console.log("END DAY");
    titleBar.destroy();
    progressBar.destroy();
    deferred.resolve();
  });

  return deferred.promise;
}
