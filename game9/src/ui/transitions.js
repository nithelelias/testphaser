import { tweenOnPromise } from "../utils.js";

export function AnimFadeIn(scene, onComplete = () => {}, duration = 3000) {
  let bg = scene.add
    .image(0, 0, "rect")
    .setTintFill(0)
    .setOrigin(0)
    .setDisplaySize(scene.scale.width, scene.scale.height)
    .setDepth(1000)
    .setAlpha(0);

  this.destroy = () => {
    bg.destroy();
  };
  this.play = () => {
    bg.setAlpha(1);
    return tweenOnPromise(scene, {
      targets: bg,
      alpha: 0,
      duration,
    });
  };

  this.play().then(onComplete);
}

export function AnimFadeOut(scene, onComplete = () => {}, duration = 3000) {
  let bg = scene.add
    .image(0, 0, "rect")
    .setTintFill(0)
    .setOrigin(0)
    .setDepth(1000)
    .setDisplaySize(scene.scale.width, scene.scale.height)
    .setAlpha(0);

  this.destroy = () => {
    bg.destroy();
  };
  this.play = async () => {
    bg.setAlpha(0);
    return tweenOnPromise(scene, {
      targets: bg,
      alpha: 1,
      duration,
    });
  };

  this.play().then(onComplete);
}
