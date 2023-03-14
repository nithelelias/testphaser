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
  this.promise = new Promise((resolve) => {
    this.resolve = resolve;
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
