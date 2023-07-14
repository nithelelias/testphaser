import Deffered from "../deferred.js";
import MapLayer from "../mapLayer.js";
const gridSize = MapLayer.getGridSize();
export default function jumpDropAwayAnimation(scene, element, x, y) {
  var deferred = new Deffered();
  let difX = (x - element.x) / 2;

  const tween = scene.tweens.chain({
    targets: element,
    tweens: [
      {
        x: { value: x - difX, ease: "Sine.in" },
        y: { value: y - gridSize * 2, ease: "power1" },
        duration: 200,
      },
      {
        x: { value: x, ease: "Sine.out" },
        y: { value: y, ease: "Cubic.out" },
        duration: 200,
      },
    ],

    onComplete: () => {
      deferred.resolve();
    },
  });
  return { promise: deferred.promise, tween };
}
