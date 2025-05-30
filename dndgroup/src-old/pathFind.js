function callbackFunction(col, row) {
  return true;
}

export default function pathFind(
  from = {
    col: 0,
    row: 0,
  },
  to = {
    col: 0,
    row: 0,
  },
  fnIsWalkable = callbackFunction
) {
  var best_path = null;

  const visited = {};

  const directions = {
    right: [1, 0],
    left: [-1, 0],
    up: [0, -1],
    down: [0, 1],
  };
  const getKey = (col, row) => {
    return `${col}_${row}`;
  };
  const isLast = (key) => {
    return key === lastKeyPosition;
  };
  const lastKeyPosition = getKey(to.col, to.row);
  const lastReturnCallPath = (path) => {
    if (best_path === null || path.length < best_path.length) {
      best_path = path;
    }
  };
  // create nodes until final position
  function Node(_parentNode, col, row) {
    this.col = col;
    this.row = row;
    this.key = getKey(col, row);

    this.returncall = (path) => {
      if (!_parentNode) {
        lastReturnCallPath(path);
        return;
      }
      _parentNode.returncall([this].concat(path));
    };
    visited[this.key] = 1;
    if (isLast(this.key)) {
      this.returncall([]);
    }
  }

  ///

  const iterateDirections = (node, walkableCallback) => {
    for (let dirName in directions) {
      let dir = directions[dirName];
      let col = node.col + dir[0];
      let row = node.row + dir[1];
      let key = getKey(col, row);
      if (isLast(key) || (!visited[key] && fnIsWalkable(col, row))) {
        walkableCallback(col, row);
      }
    }
  };
  var currentNodeList = [new Node(null, from.col, from.row)];
  while (!best_path) {
    let new_node_list = [];
    for (let node of currentNodeList) {
      iterateDirections(node, (col, row) => {
        new_node_list.push(new Node(node, col, row));
      });
    }
    currentNodeList = [...new_node_list];
    if (currentNodeList.length === 0) {
      break;
    }
  }
  if (best_path === null) {
    return [];
  }
  return best_path.map((node) => {
    return { col: node.col, row: node.row };
  });
}
