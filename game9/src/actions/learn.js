import { SENIORITY_LEVELS } from "../constants.js";
import { getKnowledgeLevel, progressOnKnowledge } from "../Context.js";
import STATE from "../state.js";
import { Button, ProgressBar } from "../ui/ui.js";
import { Deffered } from "../utils.js";

export default function learn(scene, topic) {
  // add progress bar of day at top

  scene.menu.hide();
  var width = 300;
  var centerX = scene.scale.width / 2;
  var startY = scene.scale.height / 2 + 12;
  let topic_cost = topic.cost;
  let advance_value = Math.max(0.01, STATE.ACTION_STUDY / topic_cost);

  let progress = getKnowledgeLevel(topic.text);
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
    .bitmapText(
      centerX,
      startY - 32,
      "font1",
      ["Taza de progreso: " + STATE.ACTION_STUDY + "/" + topic_cost],
      16
    )
    .setTint(0xfff1a1)
    .setOrigin(0.5, 0);

  var titleBar = scene.add
    .bitmapText(
      centerX,
      progressText.y,
      "font1",
      ["ESTUDIANDO", topic.text],
      16
    )
    .setMaxWidth(width)
    .setOrigin(0.5, 1);

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

  const cancelButton = new Button(
    scene,
    centerX - 20,
    startY - 120,
    "Cancelar"
  ).onClick(() => {
    onended();
  });

  //console.log("topic_cost ", topic_cost, "advance_value", advance_value);
  if (progress < 100) {
    var unbind = scene.player.onAct(() => {
      progress += advance_value;
      progressBar.setValue(progress);
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
    progressText.destroy();
    deferred.resolve();
    scene.menu.show();
    progressOnKnowledge(topic.text, progress);
  };

  return deferred.promise;
}
