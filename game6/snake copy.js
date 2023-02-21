export default class Snake {
  constructor(context, grid, initx, inity) {
    this.context = context;
    this.speed = 500;
    this.grid = grid;
    this.halfGridSize = grid.size / 2;
    this.moving = false;
    this.body = context.add.group();
    this.head = context.add
      .sprite(0, 0, "snake", "head")
      .setDisplaySize(this.grid.size, this.grid.size);
    this.head.setDepth(3);
    {
      let point = this.getCellPosition(0, 0);
      this.head.setPosition(point.x, point.y);
      this.head.cell = { x: 0, y: 0 };
    }
    this.body.add(this.head);
    this.positions = [{ x: 0, y: 0 }];
    this.direction = {
      x: 0,
      y: 0,
    };
    this.grow();
    this.grow();

    this.graphics = context.add.graphics();
    this.graphics.setDepth(1);
    window.snake = this;
  }
  setDirection(dir) {
    this.direction = { ...dir };
  }
  grow() {
    let newpart = this.context.add.sprite(
      this.head.x,
      this.head.y,
      "snake",
      "body"
    );
    //.setDisplaySize(this.grid.size, this.grid.size);
    newpart.cell = { ...this.positions[this.positions.length - 1] };
    newpart.setDepth(2);
    newpart.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.positions.push(newpart.cell);
    this.body.add(newpart);
  }
  getCellPosition(col, row) {
    return {
      x: this.grid.x + col * this.grid.size + this.halfGridSize,
      y: this.grid.y + row * this.grid.size + this.halfGridSize,
    };
  }
  update() {
    this.graphics.clear();
    let last = null;
    let total = this.positions.length;
    this.positions.forEach((cell, index) => {
      let point = this.getCellPosition(cell.x, cell.y);
      
       
        if ( last) {
          let tick = 1 - index / total;

          this.graphics.lineStyle(this.grid.size * tick, 0x00ff00, 1);
          this.graphics.lineBetween(last.x, last.y, point.x, point.y);
        }
       
      
      last = { ...point };
    });
  }

  init() {
    let lastdir = { x: 0, y: 0 };
    const getDirOfValue = (v) => {
      return v != 0 ? Math.abs(v) / v : 0;
    };
    const getRotationFromDir = (dx, dy) => {
      if (dx != 0) {
        return dx > 0 ? 90 : -90;
      }
      if (dy != 0) {
        return dy > 0 ? 180 : 0;
      }
    };
    const moveSnake = () => {
      let dir = { ...this.direction };
      let vx = dir.x != -lastdir.x ? dir.x : lastdir.x;
      let vy = dir.y != -lastdir.y ? dir.y : lastdir.y;
      if (vx === 0 && vy === 0) {
        setTimeout(() => moveSnake(), this.speed);
        return;
      }
      let x = this.positions[0].x + vx;
      let y = this.positions[0].y + vy;

      this.idle = false;
      let parts = this.body.getChildren();
      let total = parts.length;
      this.positions.unshift({
        x,
        y,
      });
      if (this.positions.length > total+1) {
        this.positions.pop();
      }

      parts.forEach((element, index) => {
        let cell = this.positions[index];
        let point = this.getCellPosition(cell.x, cell.y);

        let angle = getRotationFromDir(
          getDirOfValue(element.cell.x - cell.x),
          getDirOfValue(element.cell.y - cell.y)
        );
        element.cell = { ...cell };

        if (index == total - 1) {
          element.setFrame("tail");
          // FIX TAIL INVERT DESIGN
          angle = angle === 0 ? -180 : angle === 180 ? 0 : -angle;
        } else if (index > 0) {
          let prev = this.positions[index - 1];
          let dx = cell.x - prev.x;
          let dy = cell.y - prev.y;
          if (dx != 0 && dy != 0) {
            element.setFrame(dx > 0 ? "right" : "left");
          } else {
            element.setFrame("body");
          }
        }

        element.setAngle(angle);

        this.context.tweens.add({
          targets: element,
          x: point.x,
          y: point.y,
          duration: this.speed,
          onUpdate: () => {},
        });
      });

      lastdir.x = vx;
      lastdir.y = vy;
      setTimeout(() => moveSnake(), this.speed);
    };
    moveSnake();
  }
}
