import Cursor from "./cursor.js";
import getTileAtCoords from "./getTileAtCoords.js";
const defaultListener = {
  onPointerDown: () => null,
  onPointerMove: () => null,
};
export default function cursorMovement(scene, listeners) {
  ///

  const historyListener = [defaultListener];
  const dispatchListener = (method, pos, pointer, objects) => {
    var current = historyListener[historyListener.length - 1];
    if (current[method]) {
      current[method](pos, pointer, objects);
    }
  };
  const cursor = new Cursor(scene);

  cursor.clearListeners = () => {
    console.log("clear listeners");
    if (historyListener.length > 1) {
      historyListener.pop();
    }
  };
  cursor.listen = (_listener = defaultListener) => {
    historyListener.push(_listener);
    return {
      remove: () => {
        historyListener.pop();
      },
    };
  };
  ///
  console.log(historyListener, listeners);
  if (listeners) {
    historyListener.push(listeners);
    console.log(historyListener, listeners);
  }

  scene.input.on("pointerdown", (_pointer, objects) => {
    if (objects.length > 0) {
      return;
    }
    let pos = getTileAtCoords(_pointer.x, _pointer.y);
    // PUT WALLL

    dispatchListener("onPointerDown", pos, _pointer, objects);
  });
  scene.input.on("pointermove", (_pointer, objects) => {
    let pos = getTileAtCoords(_pointer.x, _pointer.y);
    cursor.x = pos.x;
    cursor.y = pos.y;

    dispatchListener("onPointerMove", pos, _pointer, objects);
  });
  return cursor;
}
