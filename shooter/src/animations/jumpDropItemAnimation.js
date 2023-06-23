import Deffered from "../deferred.js";
import random from "../random.js";
export default function jumpDropItemAnimation(sprite) {
  let deferred = new Deffered();
  let dir = 1;
  let total = random(4, 9) * 2;
  let upvel = 8;
  let shakeBounce = new Array(total).fill(1).map((_, idx) => {
    dir *= -1;
    let p = 1 - idx / total;
    return {
      angle: 15 * p * dir,
      x: "+=" + 2 * p * dir,
      ease: "power1",
      duration: 60,
      yoyo: true,
    };
  });
  sprite.scene.tweens.chain({
    targets: sprite,
    tweens: [
      {
        y: "-=" + upvel,
        scale: "+=.25",
        angle: -15,
        ease: "back.easeOut",
        duration: 120,
      },
      {
        y: "+=" + upvel,
        angle: 0,
        scale: "-=.25",
        ease: "bounce",
        duration: 60,
      },
      ...shakeBounce,
      {
        angle: 0,
        ease: "back",
        duration: 100,
      },
    ],
    onComplete: () => {
      deferred.resolve();
    },
  });
  return deferred.promise;
}
