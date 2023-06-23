import Bullet from "./bullet.js";
import calcDistance from "./calcDistance.js";
import RESOURCES from "./resources.js";

export default function shotBullet(fromEntity, toCoords, type = 0) {
  let method = {
    0: "shot",
    1: "shotTo",
  }[type];
  let bulletOptions = {
    0: {
      frame: RESOURCES.frames.bullet.normal,
      angle: -180,
      tint: 0xffff00,
    },
    1: { frame: RESOURCES.frames.bullet.fire, angle: 180, tint: 0xff0000 },
  }[type];
  
   
  let bullet = Bullet[method](
    this.scene,
    fromEntity,
    toCoords,
    bulletOptions,
    calcDistance(toCoords, fromEntity)
  );
  this.add(bullet);
  return bullet;
}
