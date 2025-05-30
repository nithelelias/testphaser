export default function (
  gameObject,
  dir,
  onHit,
  vel = 8,
  waitTimeEnd = 200,
  delay = 100,
  duration = 100,
  hold = 200
) {
  return new Promise((resolve) => {
    let tween = gameObject.scene.add.tween({
      targets: gameObject,
      x: "+=" + dir.x * vel,
      y: "+=" + dir.y * vel,
      yoyo: true,
      delay,
      duration,

      onYoyo: () => {
        tween.pause();
        onHit();
        setTimeout(() => {
          tween.resume();
        }, hold);
      },

      onComplete: () => {
        setTimeout(() => {
          resolve();
        }, waitTimeEnd);
      },
    });
  });
}
