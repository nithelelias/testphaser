export function random(m1, m2) {
  return Phaser.Math.Between(m1, m2);
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
export function spriteConfigPack(
  frame_size = 16,
  resource_dimension = [128, 128],
  preName = ""
) {
  const json = {
    frames: [],
  };
  const size = frame_size;
  const dim = resource_dimension;
  const maxX = dim[0] / size;
  const maxY = dim[1] / size;
  let n = 0;
  for (let i = 0; i < maxX; i++) {
    for (let j = 0; j < maxY; j++) {
      n++;
      json.frames.push({
        filename: preName + n,
        rotated: false,
        trimmed: false,
        frame: {
          x: j * size,
          y: i * size,
          w: size,
          h: size,
        },
      });
    }
  }

  return json;
}
