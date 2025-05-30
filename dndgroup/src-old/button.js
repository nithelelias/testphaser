import ButtonInteractiveEventCreator, {
  BUTTON_EVENTS,
} from "./buttonInteractiveEventCreator.js";
import RESOURCES from "./resources.js";
import TextFromSprite from "./textFromSprite.js";

export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, events = BUTTON_EVENTS) {
    super(scene, x, y, [
      scene.add.image(0, 0, "rect").setOrigin(0.5).setTintFill(0xffffff),
      /*    scene.add
        .text(0, 0, text, {
          color: "#111",
        })
        .setOrigin(0.5), */
      new TextFromSprite(
        scene,
        0,
        0,
        [""],
        { name: RESOURCES.name, chars: RESOURCES.chars },
        { fontSize: 16, color: 0x111 }
      ),
    ]);
    this.ancherPosition = { x, y };
    scene.add.existing(this);
    this.background = this.list[0];
    this.text = this.list[1];
    this.padding = {
      top: 5,
      left: 5,
    };
    this.setText(text);
    ButtonInteractiveEventCreator.call(this, {
      ...events,
      onPress: () => {
        this.__pressState();
      },
      onRelease: () => {
        this.__releaseState();
      },
    });
  }
  __pressState() {
    this.background.setTintFill(0x111111);
    this.text.setColor(0xffffff);
  }
  __releaseState() {
    this.background.setTintFill(0xffffff);
    this.text.setColor(0x111);
  }
  setText(text) {
    this.text.setText(text);
    const maxw = this.text.displayWidth + this.padding.left * 2,
      maxh = this.text.displayHeight + this.padding.top * 2;
    this.setSize(maxw, maxh);
    this.setPosition(
      this.ancherPosition.x + parseInt(maxw / 2),
      this.ancherPosition.y + parseInt(maxh / 2)
    );
    this.text.setPosition(
      -parseInt(this.text.displayWidth / 2),
      -parseInt(this.text.displayHeight / 2)
    );
    this.background.setDisplaySize(maxw, maxh);
  }
}
