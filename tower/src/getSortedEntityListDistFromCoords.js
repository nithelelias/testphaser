import calcDistance from "./calcDistance.js";
import calcPathToCoords from "./calcPathToCoords.js";
import WORLD from "./world.js";

export function getCloseEntityPosibleFromList(from, list) {
  // NOW VAIDATE IF PATH IS POSIBLE
  let found = null;

  for (let i in list) {
    let path = calcPathToCoords(from, list[i]);
    if (path.length > 0) {
      found = list[i];
      break;
    }
  }
  return found;
}
function getValueOfTarget(_entity) {
  if (_entity.iamTower) {
    return 0;
  }
  if (_entity.iamWall) {
    return 50;
  }

  return 100;
}
export default function getSortedEntityListDistFromCoords(from) {
  var list = [];
  const world = WORLD.getAll();
  const canCalc = (entity) => {
    return !(
      entity === from ||
      entity.iamEnemyMob ||
      !entity.isAlive ||
      !entity.isAlive()
    );
  };
  const calcClosest = (entity) => {
    // TOO EXPENSIVE;
    list.push({
      entity,
      dist: calcDistance(entity, from),
      value: getValueOfTarget(entity),
    });
  };
  for (let worldKey in world) {
    if (canCalc(world[worldKey])) {
      const entity = world[worldKey];
      calcClosest(entity);
    }
  }

  return list
    .sort((a, b) => {
      return a.dist + a.value - (b.dist + b.value);
    })
    .map((wrapper) => {
      return wrapper.entity;
    });
}
