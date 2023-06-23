import { dungeon_roomCols, dungeon_roomRows } from "./constants.js";
import iterate from "./iterate.js";
import random from "./random.js";
const roomCols = dungeon_roomCols,
  roomRows = dungeon_roomRows;
const half = {
  row: parseInt(roomRows / 2) + 1,
  col: parseInt(roomCols / 2) + 1,
};
const odds = {
  row: roomRows % 2 !== 0,
  col: roomCols % 2 !== 0,
};
const DEFAULT_DUNGEON_FRAMES = {
  floor: [0],
  door: {
    close: 0,
    open: 0,
  },
  walls: [
    [18, 19, 20],
    [67, 68, 69],
    [116, 117, 118],
  ],
};
var seed = [];

function doRandom(min, max) {
  //return useSeed.shift();
  let rnd = random(min, max);
  seed.push(rnd);
  return rnd;
}
function randomOfList(list) {
  return list[doRandom(0, list.length - 1)];
}
function getWallFrameByPosition(col, row, cols, rows, wallFrames) {
  let limitCol = col == 0 || col === cols - 1;
  let limitRow = row == 0 || row === rows - 1;

  // IS NOT A WALL
  if (!limitCol && !limitRow) {
    return null;
  }
  let wallCol = 1;
  let wallRow = 1;
  if (col === 0) {
    wallCol = 0;
  }
  if (col === cols - 1) {
    wallCol = 2;
  }
  if (row === 0) {
    wallRow = 0;
  }
  if (row === rows - 1) {
    wallRow = 2;
  }

  // DEFAULT
  return wallFrames[wallRow][wallCol];
}
function generateRoom(cols = 5, rows = 6, dungeonFRAMES) {
  let data = [];
  const floorframes = new Array(10).fill(0).concat(dungeonFRAMES.floor);
  for (let row = 0; row < rows; row++) {
    data.push([]);
    for (let col = 0; col < cols; col++) {
      let wallFrame = getWallFrameByPosition(
        col,
        row,
        cols,
        rows,
        dungeonFRAMES.walls
      );

      if (wallFrame) {
        // IS WALL :  now put wall by position.
        // IF IS LEFT CORNER
        data[row].push(wallFrame);
      } else {
        // IS FLOOR
        data[row].push(randomOfList(floorframes));
      }
    }
  }

  return data;
}
function generateStructure(maxRooms = 5) {
  const dirOpts = [
    [1, 0], //right
    [-1, 0],
    [0, -1],
    [0, 1],
  ];
  const rows = maxRooms * 2,
    cols = maxRooms * 2;
  const map = [];
  var pointers = [];
  var countRoom = 0;
  iterate(rows, (row) => {
    map.push([]);
    iterate(cols, () => {
      map[row].push(0);
    });
  });
  //
  const addRoom = (col, row) => {
    if (countRoom >= maxRooms) {
      return;
    }
    if (row < 0 || col < 0) {
      return;
    }
    if (row >= rows || col >= cols) {
      return;
    }
    if (map[col][row] !== 0) {
      return;
    }
    countRoom++;
    pointers.push([col, row]);
    map[col][row] = countRoom;
    addCloseRoom(col, row);
  };
  const addCloseRoom = (col, row) => {
    if (countRoom >= maxRooms) {
      return;
    }
    dirOpts.forEach((dir) => {
      if (countRoom >= maxRooms) {
        return;
      }
      if (doRandom(0, 10) > 8) {
        addRoom(col + dir[0], row + dir[1]);
      }
    });
  };

  addRoom(doRandom(0, cols - 1), doRandom(0, rows - 1));
  let limitBreak = 100;
  while (countRoom < maxRooms && limitBreak > 0) {
    // PICK RANDOM ROOM
    let pointer = pointers[doRandom(0, pointers.length - 1)];
    addCloseRoom(pointer[0], pointer[1]);
    limitBreak--;
  }

  return cleanMap(pointers, map);
}
function cleanMap(pointers, map) {
  let colsArra = pointers.map((p) => p[0]).sort((a, b) => a - b),
    rowsArra = pointers.map((p) => p[1]).sort((a, b) => a - b);

  let minCol = colsArra.shift(),
    maxCol = colsArra.pop(),
    minRow = rowsArra.shift(),
    maxRow = rowsArra.pop();

  let cut = map.slice(minCol, Math.min(maxCol + 1, map.length)).map((arr) => {
    return arr.slice(minRow, Math.min(maxRow + 1, arr.length));
  });
  return cut;
}
const getFrameAtData = (_data, _row, _col) => {
  try {
    if (_row < 0 || _col < 0) {
      return null;
    }
    if (_data.length <= _row) {
      return null;
    }
    if (_data[_row].length <= _col) {
      return null;
    }
    return _data[_row][_col];
  } catch (e) {
    console.log(_data.length, _row, _col);
    return null;
  }
};

function drawRoomOnStructure(structure, dungeonFRAMES) {
  let rows = structure.length * roomCols;
  let cols = structure[0].length * roomRows;

  let data = [];
  const getRandomEmpty = () => {
    return dungeonFRAMES.empty[doRandom(0, dungeonFRAMES.empty.length - 1)];
  };
  // FILL data with empty
  iterate(rows, (row) => {
    data.push([]);
    iterate(cols, () => {
      data[row].push(getRandomEmpty());
    });
  });
  const validateConnection = (_row, _col, [dirRow, dirCol]) => {
    let frame = getFrameAtData(data, _row + dirRow, _col + dirCol);
    if (frame != null && !dungeonFRAMES.empty.includes(frame)) {
      data[_row + dirRow][_col + dirCol] = dungeonFRAMES.door.close;
      data[_row][_col] = dungeonFRAMES.door.close;
    }
  };
  const putRoomAt = (fromCol, fromRow) => {
    const room = generateRoom(roomCols, roomRows, dungeonFRAMES);
    room.forEach((cols, row) => {
      cols.forEach((_frame, col) => {
        data[fromRow + row][fromCol + col] = _frame;
      });
    });
    // CONNECT ADYACENT ROOMS.
    // CENTER ROOM DOORS
    let centerCol = fromCol + parseInt(roomCols / 2);
    let centerRow = fromRow + parseInt(roomRows / 2);

    // LOOK UP
    validateConnection(fromRow, centerCol, [-1, 0]);
    // LOOK DOWN
    validateConnection(fromRow + roomRows, centerCol, [1, 0]);
    // LOOK LEFT
    validateConnection(centerRow, fromCol, [0, -1]);
    // LOOK RIGHT
    validateConnection(centerRow, fromCol + roomCols, [0, 1]);
  };
  // get start coordenate of room
  structure.forEach((cols, row) => {
    cols.forEach((roomType, col) => {
      if (roomType !== 0) {
        putRoomAt(col * roomCols, row * roomRows);
      }
    });
  });

  return data;
}
export function dungeonGenerator(
  numberOfRooms,
  dungeonFRAMES = DEFAULT_DUNGEON_FRAMES
) {
  let totalRooms = Array.isArray(numberOfRooms)
    ? doRandom(numberOfRooms[0], numberOfRooms[1])
    : numberOfRooms;
  let map = generateStructure(totalRooms);
  const data = drawRoomOnStructure(map, dungeonFRAMES);
  const dicRooms = {};
  map.forEach((rows, row) => {
    rows.forEach((roomNumber, col) => {
      dicRooms[roomNumber] = { row, col };
    });
  });
  const getRoom = (roomNumber) => {
    if(!roomNumber){
      return null
    }
    const minusOneIfOdd = {
      col: odds.col ? -1 : 0,
      row: odds.row ? -1 : 0,
    };
    let position = dicRooms[Math.max(0, Math.min(totalRooms, roomNumber))];
    let initRow = position.row * roomRows,
      initCol = position.col * roomCols;
    let row = initRow + half.row,
      col = initCol + half.col;

    let roomIdx = {
      row: [row - half.row, row + half.row + minusOneIfOdd.row],
      col: [col - half.col, col + half.col + minusOneIfOdd.col],
    };
    const roomData = data
      .slice(roomIdx.row[0], roomIdx.row[1])
      .map((columns) => columns.slice(roomIdx.col[0], roomIdx.col[1]));
    const doors = {
      top: null,
      bottom: null,
      left: null,
      right: null,
    };

    roomData.forEach((rows, rowIdx) => {
      rows.forEach((frame, colIdx) => {
        if (frame == dungeonFRAMES.door.close) {
          let at = "top";
          if (rowIdx === roomRows + minusOneIfOdd.row) {
            at = "bottom";
          }
          if (colIdx === roomCols + minusOneIfOdd.col) {
            at = "right";
          }
          if (colIdx === 0) {
            at = "left";
          }
          doors[at] = {
            row: roomIdx.row[0] + rowIdx,
            col: roomIdx.col[0] + colIdx,
          };
        }
      });
    });

    // RETURN ROOM CENTER
    return {
      roomNumber,
      data: roomData,
      row,
      col,
      doors,
      initCol,
      initRow,
      position,
    };
  };
  const getLastRoom = () => {
    return getRoom(totalRooms);
  };
  return {
    dungeonFRAMES,
    totalRooms,
    data,
    map,
    getRoom,
    getLastRoom,
    rows: map.length,
    cols: map[0].length,
    //seed,
    roomSize: {
      width: roomCols,
      height: roomRows,
    },
  };
}
