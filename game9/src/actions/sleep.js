import { isPlayerFullHP, recoverHPBySleep } from "../context.js";
import { Button } from "../ui/ui.js";
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
  var wakeUp = scene.add
    .dynamicBitmapText(
      scene.scale.width / 2,
      startY - 64,
      "font1",
      ["Deberia despertar..."],
      14
    )
    .setVisible(false)
    .setOrigin(0.5, 1);
  // SPEED TIME
  scene.time.timeScale = 8;
  const timeEvent = scene.time.addEvent({
    delay: 1200,
    loop: true,
    callback: () => {
      recoverHPBySleep();
      if (isPlayerFullHP()) {
        wakeUp.setVisible(true);
      }
    },
  });
  // END BUTTON
  const endButton = new Button(
    scene,
    scene.scale.width / 2,
    scene.scale.height - 64,
    " Despertar ",
    32
  );
  endButton.x -= endButton.width / 2;
  endButton.onClick(() => {
    timeEvent.destroy();
    titleBar.destroy();
    wakeUp.destroy();
    deferred.resolve();
    endButton.destroy();
    scene.time.timeScale = 1;
  });

  return deferred.promise;
}
