import SOUNDS from "../sounds.js";
import { typedMessage } from "../ui/ui.js";
import { random, repeatFlash, tweenOnPromise } from "../utils.js";

function fireWorks() {
  var centerX = this.scale.width / 2;
  var centerY = this.scale.height / 2 + 256;
  var p0 = new Phaser.Math.Vector2(centerX - 100, centerY - 200);
  var p1 = new Phaser.Math.Vector2(centerX - 100, centerY - 100);
  var p2 = new Phaser.Math.Vector2(centerX + 100, centerY - 100);
  var p3 = new Phaser.Math.Vector2(centerX + 100, centerY - 200);

  var curve = new Phaser.Curves.CubicBezier(p0, p1, p2, p3);

  var max = 28;
  var points = [];
  var tangents = [];

  for (var c = 0; c <= max; c++) {
    var t = curve.getUtoTmapping(c / max);

    points.push(curve.getPoint(t));
    tangents.push(curve.getTangent(t));
  }

  var tempVec = new Phaser.Math.Vector2();

  var spark0 = this.add.particles("red");
  var spark1 = this.add.particles("blue");
  var emitters = [];
  for (var i = 0; i < points.length; i++) {
    var p = points[i];

    tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p);

    var angle = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.BetweenPoints(p, tempVec)
    );

    var particles = i % 2 === 0 ? spark0 : spark1;

    var emitter = particles.createEmitter({
      x: tempVec.x,
      y: tempVec.y,
      angle: angle,
      speed: { min: -100, max: 500 },
      gravityY: 200,
      scale: { start: 0.4, end: 0.1 },
      lifespan: 800,
      blendMode: "SCREEN",
    });
    emitters.push({ particles, emitter });
  }
  return () => {
    emitters.forEach((emitter) => {
      emitter.emitter.explode();
    });

    setTimeout(() => {
      spark0.destroy();
      spark1.destroy();
      emitters.forEach((emitter) => {
        emitter.emitter.stop();
        emitter.particles.destroy();
      });
    }, 1000);
  };
}
export default async function jobInterview(scene, job, successRate) {
  let accepted = successRate > random(0, 100);
  SOUNDS.melody1.stop();

  var width = 300;
  var centerX = scene.scale.width / 2 - width / 2;
  var startY = scene.scale.height / 2 - 64;
  let message1 = typedMessage(scene, ["Hola mundo!"], centerX, startY, 32);
  await message1.promise;
  let message2 = typedMessage(
    scene,
    ["Esperando respuesta de la oferta de trabajo", "..."],
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
  await repeatFlash(scene, 3, 200);
  if (accepted) {
    if (accepted) {
      SOUNDS.victory.play();
    }

    let bg = scene.add
      .image(0, 0, "rect")
      .setOrigin(0)
      .setDepth(0)
      .setDisplaySize(scene.scale, width, scene.scale.height);
    bg.setScale(0);

    var unbindFireworks = fireWorks.call(scene);

    await tweenOnPromise(scene, {
      targets: SOUNDS.victory,
      volume: 0,
      duration: 500,
      delay: SOUNDS.victory.duration * 1000 - 500,
    });
    unbindFireworks();
    message1.bitmapText.setFontSize(64);
  }
  message1.bitmapText.setText(accepted ? "ACEPTADO!" : "Lo siento No..");
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
  SOUNDS.melody1.play();
  if (accepted) {
    SOUNDS.victory.stop();
  }
  return accepted;
  //
}
