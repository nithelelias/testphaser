import ButtonInteractiveEventCreator, {
  BUTTON_EVENTS,
} from "./buttonInteractiveEventCreator.js";
import RESOURCES from "./resources.js";
const BUTTON_SIZE = 32;
const BUTTON_INNER_SIZE = parseInt(BUTTON_SIZE * 0.5);
export default class ActionBarButtonOption extends Phaser.GameObjects
  .Container {
  static BUTTON_SIZE = BUTTON_SIZE;
  constructor(
    scene,
    x,
    y,
    frame,
    { onClick = () => {}, onHover = () => null, onHoverOut = () => null }
  ) {
    super(scene, x, y, [
      scene.add
        .sprite(0, 0, RESOURCES.name, RESOURCES.frames.button.idle)
        .setOrigin(0.5)
        .setDisplaySize(BUTTON_SIZE, BUTTON_SIZE),
      scene.add
        .sprite(0, 0, RESOURCES.name, frame)
        .setOrigin(0.5)
        .setDisplaySize(BUTTON_INNER_SIZE, BUTTON_INNER_SIZE)
        .setTint(0x111),
    ]);
    this.setSize(BUTTON_SIZE, BUTTON_SIZE);
    const background = this.list[0];
    const img = this.list[1];
    this.icon = img;
    let pressed = false;
    ButtonInteractiveEventCreator.call(this, {
      onClick,
      onHover: () => {
        this.setScale(1.2);
        onHover && onHover();
      },
      onHoverOut: () => {
        if (pressed) {
          return;
        }
        this.setScale(1);
        onHoverOut && onHoverOut();
      },
      onPress: () => {
        pressed = true;
        this.setScale(0.9);

        img.setTint(0xffffff);
        background.setFrame(RESOURCES.frames.button.press);
      },
      onRelease: () => {
        pressed = false;
        background.setFrame(RESOURCES.frames.button.idle);
        this.setScale(1);
        img.setTint(0x111);
      },
    });
  }
}
