import Main from "../scenes/main.js";
import Bullet, { BULLET_OPTIONS } from "./bullet.js";
import calcDistance from "./calcDistance.js";
import { GRIDSIZE } from "./constants.js";
import { getAliveEnemies } from "./enemy.js";

export default function shotClosestEnemy(
  fromEntity,
  properties = { bulletOptions: null, distance: 5, damage: 1 }
) { 
  let closestEnemyList = getAliveEnemies()
    .map((target) => {
      return { target, d: calcDistance(fromEntity, target) / GRIDSIZE };
    })
    .filter((a) => {
      return a.d <= properties.distance;
    })
    .sort((a, b) => {
      return b.d - a.d;
    });

  if (closestEnemyList.length === 0) {
    return false;
  }
  let closestEnemy = closestEnemyList[0]; //{ target: this.input.mousePointer }; //
  let bullet = Bullet.shot(
    fromEntity.scene,
    fromEntity,
    closestEnemy.target,
    properties.bulletOptions
  );
  bullet.setTint(0xffff00);
  Main.current.bulletGroup.add(bullet);
  return true
}
