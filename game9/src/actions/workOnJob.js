import { MONTHS } from "../constants.js";
import { calcJobOfferSuccesProb, isJobExpired } from "../jobOfferPool.js";
import STATE from "../state.js";
import { Button, ProgressBar, typedMessage } from "../ui/ui.js";
import { Deffered, iterate, tweenOnPromise } from "../utils.js";

async function jobExpired(scene, job) {
  const width = 300;
  const centerX = 12;
  const startY = 202;
  let message1 = typedMessage(
    scene,
    ["El trabajo HA EXPIRADO!!"],
    centerX,
    startY,
    48
  );
  message1.bitmapText.setMaxWidth(width);

  await message1.promise;

  await tweenOnPromise(scene, {
    targets: [message1.bitmapText],
    duration: 1000,
    alpha: 0,
    delay: 1000,
  });

  message1.destroy();

  return { expired: true, finished: false };
}

function doJob(scene, job) {
  scene.time.timeScale = 2;

  const mastery = calcJobOfferSuccesProb(job);
  const width = 300;
  const centerX = scene.scale.width / 2;
  const startY = scene.scale.height / 2 + 12;

  const tick_value = Math.max(0.01, mastery / 200);

  let progress = Math.min(100, job.progress);
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
    .bitmapText(centerX, startY - 32, "font1", [parseInt(progress) + "%"], 32)
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1);
  var tazaText = scene.add
    .bitmapText(
      centerX,
      startY - 12,
      "font1",
      ["Taza de progreso: " + tick_value],
      16
    )
    .setCenterAlign()
    .setTint(0xfff1a1)
    .setOrigin(0.5, 1)
    .setVisible(false);
  var titleBar = scene.add
    .bitmapText(
      centerX,
      startY - 150,
      "font1",
      [
        "TRABAJANDO",
        job.jobTitle,
        "Fecha Limite:",
        job.expirationDate.day + "-" + MONTHS[job.expirationDate.month],
      ],
      16
    )
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
      [progress < 100 ? "CLICK RAPIDO PARA TRABAJAR" : "TRABAJO TERMINADO"],
      16
    )
    .setOrigin(0.5, 1);
  const advance = () => {
    progress += tick_value;
    progressBar.setValue(progress);
    progressText.setText([parseInt(progress) + "%"]);
    if (progress >= 100) {
      onended();
    }
  };
  var unbind = scene.player.onAct(() => {
    iterate(STATE.WORKING.activeLevel, advance);
  });

  var unbindFaint = scene.player.onFaint(() => {
    onended();
  });
  var unbinIdleAdvance = (() => {
    const timeEvent = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        scene.player.doTyping();
        iterate(STATE.WORKING.passiveLevel, advance);
      },
    });
    return () => timeEvent.destroy();
  })();
  const unbindAll = () => {
    unbindFaint();
    unbind();
    unbinIdleAdvance();
    titleBar.destroy();
    progressBar.destroy();
    cancelButton.destroy();
    helptext.destroy();
    tazaText.destroy();
    progressText.destroy();

    scene.time.timeScale = 1;
    job.progress = progress;
  };
  const onended = () => {
    unbindAll();

    deferred.resolve({ expired: false, finished: progress >= 100, progress });
  };
  return deferred.promise;
}

export default function workOnJob(scene, job) {
  if (!job) {
    return Promise.resolve({ expired: false, finished: false });
  }

  // IS JOB EXPIRED?
  if (isJobExpired(job)) {
    return jobExpired(scene, job);
  } else {
    return doJob(scene, job);
  }
}
