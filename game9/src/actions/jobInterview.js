import { typedMessage } from "../ui/ui.js";
import { random, tweenOnPromise, waitTimeout } from "../utils.js";

export default async function jobInterview(scene, job, successRate) {
  let accepted = successRate > random(0, 100);
  scene.menu.hide();
  var width = 300;
  var centerX = scene.scale.width / 2 - width / 2;
  var startY = scene.scale.height / 2 - 64;
  let message1 = typedMessage(scene, ["Hola mundo!"], centerX, startY, 32);
  await message1.promise;
  let message2 = typedMessage(
    scene,
    ["Esperando respuesta de la oferta laboral", "..."],
    centerX,
    startY + message1.bitmapText.height
  );
  message2.bitmapText.setMaxWidth(width);
  await message2.promise;

  await tweenOnPromise(scene, {
    targets: [message1.bitmapText, message2.bitmapText],
    duration: 1000,
    alpha: 0,
    delay: 1000,
  });

  message1.bitmapText.setText(accepted ? "ACEPTADO" : "Lo siento No..");
  message1.bitmapText.x = scene.scale.width / 2;
  message1.bitmapText.setAlpha(1);
  message1.bitmapText.setOrigin(0.5);
  message1.bitmapText.setCenterAlign();
  await tweenOnPromise(scene, {
    targets: [message1.bitmapText],
    duration: 200,
    scale: 3,
    yoyo: true,
    rotation: "+=10",
    ease: "BounceInOut",
  });
  await tweenOnPromise(scene, {
    targets: [message1.bitmapText, message2.bitmapText],
    duration: 1000,
    alpha: 0,
    delay: 1000,
  });
  message1.destroy();
  message2.destroy();
  scene.menu.show();

  return accepted;
  //
}
