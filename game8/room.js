function iterateUntil(min, max, callback) {
  let i = min + 0;
  while (i < max) {
    if (callback(i) === false) {
      break;
    }
    i++;
  }
}
export default function Room(map, cols, rows, frames) {
  iterateUntil(0, cols, (x) => {
    iterateUntil(0, rows, (y) => {
      map.putTileAt(frames["0"], x, y);
    });
  });
  var matrix=[];
  // FOLLOW MATRIX
  matrix.forEach((row, y) => {
    row.forEach((frameKey, x) => {
      let _frame = 0;
      if (frameKey == 1) {
        // WALL
        _frame = 2;
      }
      map.putTileAt(_frame, x, y);
    });
  });
}
