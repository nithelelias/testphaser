import { calcDirection } from "./calcDistance.js";
import Deffered from "./deferred.js";

export default function moveMeToPosition(
  me,
  position,
  velocity,
  duration,
  plusSettings = {}
) {
  let deferred = new Deffered();

  const dir = calcDirection(me, position);

  me.scene.add.tween({
    targets: [me],
    ...plusSettings,
    x: me.x + velocity * dir.x,
    y: me.y + velocity * dir.y,
    duration,
    ease: "Linear",

    onComplete: () => {
      deferred.resolve();
    },
  });

  return deferred.promise;
}
