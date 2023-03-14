import { getKnowledgeLevel } from "../Context.js";
import STATE from "../state.js";
import { ProgressBar } from "../ui/ui.js";
import { Deffered } from "../utils.js";

export default function workOnJob(scene, job, mastery) {
  scene.menu.hide();
  scene.time.timeScale = 2;
  if (STATE.ACTUAL_JOB) {
    return Promise.resolve();
  }
  var width = 300;
  var centerX = scene.scale.width / 2;
  var startY = scene.scale.height / 2 + 12;
  // CALCULAR

  let tick_value = Math.max(0.01, 1 / mastery);

  let progress = STATE.ACTUAL_JOB.progress;
  var deferred = new Deffered();
  var progressBar = new ProgressBar(
    scene,
    scene.scale.width / 2 - width / 2,
    startY,
    width,
    12
  );
  progressBar.setValue(progress);
  var progressText = scene.add
    .bitmapText(centerX, startY - 32, "font1", [progress + "%"], 32)
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1);
  var tazaText = scene.add
    .bitmapText(
      centerX,
      startY - 12,
      "font1",
      ["Taza de progreso: " + 1 + "/" + mastery],
      16
    )
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1);
  var titleBar = scene.add
    .bitmapText(centerX, startY - 150, "font1", ["ESTUDIANDO", topic.text], 16)
    .setCenterAlign()
    .setMaxWidth(width)
    .setOrigin(0.5, 1);

  const cancelButton = new Button(
    scene,
    titleBar.x,
    startY - 120,
    "Cancelar"
  ).onClick(() => {
    onended();
  });
  cancelButton.x -= cancelButton.width / 2;
  var helptext = scene.add
    .bitmapText(
      centerX,
      scene.scale.height - 12,
      "font1",
      [
        progress < 100
          ? "CLICK RAPIDO PARA ESTUDIAR"
          : "YA NO TENGO NADA MAS QUE APRENDER",
      ],
      16
    )
    .setOrigin(0.5, 1);
  //console.log("topic_cost ", topic_cost, "tick_value", tick_value);
  if (progress < 100) {
    var unbind = scene.player.onAct(() => {
      progress += tick_value;
      progressBar.setValue(progress);
      progressText.setText([parseInt(progress) + "%"]);
      if (progress >= 100) {
        unbind();
        onended();
      }
    });
  }
  const onended = () => {
    titleBar.destroy();
    progressBar.destroy();
    cancelButton.destroy();
    helptext.destroy();
    tazaText.destroy();
    progressText.destroy();
    deferred.resolve();
    scene.menu.show();
    scene.time.timeScale = 1;
    progressOnKnowledge(topic.text, progress);
  };

  return deferred.promise;
}
