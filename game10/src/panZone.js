import ArrowPan from "./arrowPan.js";

export default function panZone({ movePan }) {
  const size = 64,
    halfSize = parseInt(size / 2);

  let arrows = {
    up: new ArrowPan(this, 1058, [0, -1]).onActive(movePan),
    down: new ArrowPan(this, 1060, [0, 1]).onActive(movePan),
    left: new ArrowPan(this, 1061, [-1, 0]).onActive(movePan),
    right: new ArrowPan(this, 1059, [1, 0]).onActive(movePan),
  };

 
  const fitPositions = () => {
    let center = {
      x: parseInt(this.game.scale.width / 2 - halfSize),
      y: parseInt(this.game.scale.height / 2 - halfSize),
    };
    let bounding = {
      up: [center.x, halfSize],
      down: [center.x, parseInt(this.game.scale.height - halfSize )],
      left: [halfSize, center.y],
      right: [parseInt(this.game.scale.width - halfSize), center.y],
    };
    for (let i in arrows) {
      let arrow = arrows[i];
      let pos = bounding[i];

      arrow.setPosition(pos[0], pos[1]);
    }
  };

  fitPositions();
  addEventListener("resize", (event) => {
    fitPositions();
  });
}
