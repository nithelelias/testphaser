import Deffered from "./deferred.js";

export default function shakeObject(
  gameObject,
  duration,
  intensity,
  { modX = 1, modY = 1 }
) {
  var originalX = gameObject.x; // Obtener la posición original del objeto
  var originalY = gameObject.y;
  var shakeInterval = 10; // Intervalo de tiempo entre cada agitación
  var shakeTime = 0; // Tiempo transcurrido de shake
  var shakeOffsetX, shakeOffsetY;
  var deferred = new Deffered();
  var eventTime = gameObject.scene.time.addEvent({
    delay: shakeInterval,
    callback: function () {
      // Calcular la nueva posición del objeto en función de la intensidad del shake
      shakeOffsetX = intensity * Phaser.Math.Between(-10, 10) * modX;
      shakeOffsetY = intensity * Phaser.Math.Between(-10, 10) * modY;

      gameObject.setPosition(
        originalX + shakeOffsetX,
        originalY + shakeOffsetY
      );

      shakeTime += shakeInterval;

      if (shakeTime >= duration) {
        gameObject.setPosition(originalX, originalY);
        // END EVENT
        eventTime.destroy();
        deferred.resolve();
      }
    },
    loop: true,
  });
  return deferred.promise;
}
