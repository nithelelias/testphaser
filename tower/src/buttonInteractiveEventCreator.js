import onEvent from "./onEvent.js";
export const BUTTON_EVENTS = {
  onClick: () => {},
  onPress: () => {},
  onRelease: () => {},
  onHover: () => {},
  onHoverOut: () => {},
};
export default function ButtonInteractiveEventCreator(events = BUTTON_EVENTS) {
  const __customEvents = { ...events };
  this.setInteractive();

  this.onClick = (callbackFn) => {
    __customEvents.onClick = callbackFn;
  };
  this.onHover = (callbackFn) => {
    __customEvents.onHover = callbackFn;
  };
  let unbindevents = [
    onEvent.call(this, "pointerdown", (pointerDown) => {
      __customEvents.onPress && __customEvents.onPress(pointerDown);
      this.scene.input.once("pointerup", (pointerUp, g) => {
        __customEvents.onRelease && __customEvents.onRelease(pointerDown);
        if (g[0] === this) {
          __customEvents.onClick &&
            __customEvents.onClick({ pointerDown, pointerUp });
        }
      });
    }),
    onEvent.call(this, "pointerover", (pointer) => {
      __customEvents.onHover && __customEvents.onHover({ pointer });
    }),
    onEvent.call(this, "pointerout", (pointer) => {
      __customEvents.onHoverOut && __customEvents.onHoverOut({ pointer });
    }),
  ];
  this.on("destroy", () => {
    unbindevents.forEach((unbind) => unbind());
  });
}
