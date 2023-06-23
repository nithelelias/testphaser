import Cursor from "./cursor.js";
import getTileAtCoords from "./getTileAtCoords.js";

export default function cursorMovement(scene, { onPointerDown }) {
  ///
  const cursor = new Cursor(scene);
  ///
  scene.input.on("pointerdown", (_pointer, g) => {
    if (g.length > 0) {
      return;
    }
    let pos = getTileAtCoords(_pointer.x, _pointer.y);
    // PUT WALLL
    onPointerDown && onPointerDown(pos);
  });
  scene.input.on("pointermove", (_pointer) => {
    let pos = getTileAtCoords(_pointer.x, _pointer.y);
    cursor.x = pos.x;
    cursor.y = pos.y;
  });
  return cursor;
}
