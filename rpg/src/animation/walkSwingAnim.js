import tweenPromise from "../tweenPromise.js";

export default function WalkSwingAnim(elem) {
  let lastDirSwing = 1;
  let lastTween = null;
  this.play = async () => {
    if (lastTween) {
      lastTween.remove();
    }
    lastDirSwing *= -1;
    elem.setAngle(0);
    return tweenPromise(
      elem.scene,
      {
        targets: [elem],
        angle: 15 * lastDirSwing,
        yoyo: true,
        ease: "BackEaseInOut",
        duration: 100,
      },
      (_tween) => {
        lastTween = _tween;
      }
    );
  };
}
