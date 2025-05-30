import Deffered from "./deferred.js";

export default function tweenPromise(scene, settings) {
  let deferred = new Deffered();
  scene.add.tween({
    ...settings,
    onComplete: () => {
      deferred.resolve();
      settings.onComplete && settings.onComplete();
    },
  });

  return deferred.promise;
}
