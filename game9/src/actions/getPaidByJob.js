import { COLORS } from "../constants.js";
import { Deffered, tweenOnPromise, waitTimeout } from "../utils.js";

async function hereCOmesTheMOney(scene) {
  //FADE OUT
  scene.sounds.moneyCome.setVolume(1);
  scene.sounds.moneyCome.play();
  await waitTimeout((scene.sounds.moneyCome.duration - 1) * 1000);
  scene.tweens.add({
    targets: scene.sounds.moneyCome,
    volume: 0,
    duration: 500,
    onComplete: () => {
      scene.sounds.moneyCome.stop();
    },
  });
}
export default async function getPaidByJob(scene, job) {
  let iteration = 0;
  let intervalId = setInterval(() => {
    iteration++;
    scene.cameras.main.flash(100);
    if (iteration > 3) {
      clearInterval(intervalId);
    }
  }, 100);

  // HIDE EVERYTHING
  scene.hideUI();
  scene.sounds.melody1.pause();
  hereCOmesTheMOney(scene);
  await waitTimeout(2000);
  const salaryDigits = job.salary.toString().length;
  const fontSize = parseInt(scene.scale.width / ((salaryDigits + 2) * 2));
  const maxWIdth = fontSize * 5;
  const quantity = salaryDigits / 100;
  const moneyText = scene.add
    .bitmapText(scene.scale.width / 2, 150, "font1", ["$00.00"], fontSize)
    .setTintFill(COLORS.green)
    .setCenterAlign()
    .setMaxWidth(maxWIdth)
    .setDropShadow(1, 2, 0x111111, 1)
    .setOrigin(0.5, 1);
  const particles = scene.add.particles("icons", [
    {
      frame: 0,
      x: scene.player.parentContainer.x,
      y: scene.player.parentContainer.y,
      angle: { min: 180, max: 360 },
      speed: 200,
      gravityY: -350,
      lifespan: 3000,
      quantity,
      scale: { min: 0.1, max: 1 },
    },
    {
      frame: 1,
      x: scene.player.parentContainer.x,
      y: scene.player.parentContainer.y,
      angle: { min: 180, max: 360 },
      speed: 300,
      gravityY: -350,
      lifespan: 3000,
      quantity,
      tint: COLORS.green,
      scale: { min: 1, max: 3 },
    },
  ]);
  particles.setDepth(-1);
  let valueHolder = 0;
  let max = job.salary;
  let delay = 100;
  let unitValue = job.salary / 100;

  var deferred = new Deffered();
  let eventT = scene.time.addEvent({
    delay,
    loop: true,
    callback: () => {
      valueHolder = Math.min(max, valueHolder + unitValue);
      moneyText.setText("$" + valueHolder.toFixed(2));
      scene.sounds.money.play();
      if (valueHolder >= max) {
        eventT.destroy();
        deferred.resolve();
      }
    },
  });
  var moneyTextScale = tweenOnPromise(scene, {
    targets: moneyText,
    scale: 2,
    y: 300,
    duration: 2000,
  });

  await Promise.all([deferred.promise, moneyTextScale]);
  scene.sounds.moneyCome.setVolume(0.03);
  particles.emitters.list.forEach((emitter) => emitter.explode());

  await tweenOnPromise(scene, {
    targets: moneyText,
    alpha: 0,
    duration: 2000,
  });
  moneyText.destroy();
  particles.destroy();
  await waitTimeout(1000);
  // SHOW EVERYTHING
  scene.showUI();

  // FADE IN
  scene.sounds.melody1.setVolume(0);
  scene.sounds.melody1.play();
  scene.tweens.add({
    targets: scene.sounds.melody1,
    volume: 0.01,
    duration: 500,
    onComplete: () => {},
  });
}
