export default function onResize(_callback) {
  const resize_listener = (evt) => _callback(evt);
  addEventListener("resize", resize_listener);
  return () => {
    removeEventListener("resize", resize_listener);
  };
}

export function onResizeUntilDestroy(element, _callback) {
  if (!element.on) {
    throw "not gameObject element with on event";
    return;
  }
  const unbindResizeEvent = onResize(_callback);

  element.on("destroy", () => {
    unbindResizeEvent();
  });
}
