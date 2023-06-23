export default function tweenPromise(scene, settings, onTween) {
  return new Promise((_resolve) => {
    let onCompleteTemp = settings.onComplete;
    let tween = scene.add.tween({
      ...settings,
      onComplete: () => {
        if (onCompleteTemp) {
          onCompleteTemp();
        }
        _resolve(tween);
      },
    });
    if (onTween) {
      onTween(tween);
    }
  });
}
