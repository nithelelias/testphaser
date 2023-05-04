import getTileSize from "./getTileSize.js";

const threshold = 8;
function getPerfectCellPosition(pointer) {
  const tileSize = getTileSize();
  const halfTileSize = tileSize / 2;

  return {
    x: parseInt(pointer.x / tileSize) * tileSize + halfTileSize,
    y: parseInt(pointer.y / tileSize) * tileSize + halfTileSize,
  };
}
export default function Interactions(scene, { putFrameAt, onpointermove }) {
  var downpointer = { x: 0, y: 0 };
  var pressed = false;
  const onPress = (_pointer) => {
    if (putFrameAt && pressed) {
      putFrameAt(getPerfectCellPosition(_pointer));
    }
  };
  scene.input.on("pointermove", (_pointer) => {
    if (onpointermove) {
      onpointermove(getPerfectCellPosition(_pointer));
    }
    onPress(_pointer);
  });
  scene.input.on("pointerdown", (_downpointer) => {
    downpointer = { x: _downpointer.x + 0, y: _downpointer.y + 0 };
    pressed = true;
    onPress(_downpointer);
    scene.input.once("pointerup", () => {
      pressed = false;
    });
  });
}
