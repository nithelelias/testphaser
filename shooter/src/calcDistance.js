export default function calcDistance(point1, point2) {
  return Phaser.Math.Distance.BetweenPoints(point1, point2);
}

export function calcDirection(point1, point2) {
  const dif = {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  };
  const dir = {
    x: dif.x === 0 ? 0 : dif.x / Math.abs(dif.x),
    y: dif.y === 0 ? 0 : dif.y / Math.abs(dif.y),
  };
  return dir;
}
