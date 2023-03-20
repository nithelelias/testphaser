export function random(m1, m2) {
  return Phaser.Math.Between(m1, m2);
}
export function iterate(total, callback) {
  let i = 0;
  while (i < total) {
    let result = callback(i);
    if (result === false) {
      break;
    }
    i++;
  }
}
export function Deffered() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
export function tweenOnPromise(scene, config) {
  let deferred = new Deffered();
  let onCompleteCallback = config.onComplete || null;
  config.onComplete = () => {
    deferred.resolve();
    if (onCompleteCallback) {
      onCompleteCallback();
    }
  };
  scene.tweens.add(config);

  return deferred.promise;
}
export function definePropertyToChild(self, prop, child) {
  Object.defineProperty(self, prop, {
    set: function (_v) {
      child[prop] = _v;
    },
    get: function () {
      return child[prop];
    },
  });
}
export function minutesToMilliseconds(m) {
  return m * 60 * 1000;
}

export function padStartNum(num, total = 2, preNum = "0") {
  return num.toString().padStart(total, preNum);
}

export function waitTimeout(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function shakeObject(gameObject, duration, intensity) {
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
      shakeOffsetX = intensity * Phaser.Math.Between(-10, 10);
      shakeOffsetY = intensity * Phaser.Math.Between(-10, 10);

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

export function repeatFlash(scene, iterations = 3, delay = 100) {
  var deferred = new Deffered();
  let iteration = 0;
  let intervalId = setInterval(() => {
    iteration++;
    scene.cameras.main.flash(100);
    if (iteration > iterations) {
      clearInterval(intervalId);
      deferred.resolve();
    }
  }, delay);
  return deferred.promise;
}
