export default function tintAnimation(target, fromColor, toColor) {
  return new Promise((onComplete) => {
    if (!target.scene) {
      onComplete();
      return;
    }
    target.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 200,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: 1,
      onUpdate: function (tween) {
        const value = tween.getValue();

        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(fromColor),
          Phaser.Display.Color.ValueToColor(toColor),
          100,
          value
        );
        const color = Phaser.Display.Color.GetColor(
          colorObject.r,
          colorObject.g,
          colorObject.b
        );
        // --  console.log(value,color,"=>",colorObject,fromColor,toColor)
        target.setTint(color);
      },
      onComplete,
    });
  });
}
