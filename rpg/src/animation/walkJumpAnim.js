import tweenPromise from "../tweenPromise.js";

export default function WalkJumpAnim(elem, base, max) {
  let lastTween = null;
  this.play = async () => {
    if (lastTween) {
      lastTween.remove();
    }
    const scene = elem.scene;
    elem.y = base;
    return tweenPromise(
      scene,

      {
        targets: [elem],
        y: `-=${max}`,
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
