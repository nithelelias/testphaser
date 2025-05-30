import Hud from "../scenes/hud.js";
import { COLORS } from "./constants.js";
import Deffered from "./deferred.js";
import PoolAliveManager from "./poolAliveManager.js";
import RESOURCES from "./resources.js";

const poolManager = new PoolAliveManager();
var arrayPopMessage = { active: false, list: [] };

function addToArrayPopMessage(fnCall) {
  arrayPopMessage.list.push(fnCall);

  if (!arrayPopMessage.active) {
    nextPopUpMessage();
  }
}
function nextPopUpMessage() {
  if (arrayPopMessage.list.length === 0) {
    return;
  }
  let nextFn = arrayPopMessage.list.shift();
  arrayPopMessage.active = true;
  nextFn().then(() => {
    arrayPopMessage.active = false;
    nextPopUpMessage();
  });
}
export default class PopMessage extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0, [
      scene.add.rectangle(0, 0, 100, 100, COLORS.UI_BACKGROUND1).setOrigin(0),
      scene.add
        .bitmapText(0, 0, "font1", "", 16)
        .setTint(COLORS.white)
        .setDropShadow(1, 1)
        .setOrigin(0),
      scene.add.image(0, 0, RESOURCES.name, 0).setOrigin(0),
    ]);
    this.background = this.list[0];
    this.text = this.list[1];
    this.icon = this.list[2];
    scene.add.existing(this);
  }
  static create(
    x,
    y,
    text,
    priority = false,
    fontSettings = { fontSize: 16 },
    animationSettings = {},
    settings = {}
  ) {
    const fnCall = () => {
      let message;

      message = poolManager.create(Hud.current, PopMessage);
      message.setPosition(x, y);
      message.background.x = 0;

      if (fontSettings.fontSize) {
        message.text.setFontSize(fontSettings.fontSize);
      }

      message.icon.x = 0;
      message.icon.setFrame(0);
      message.setScale(1);
      message.setDepth(1000);

      message.setVisible(false);
      message.text.setText(text);
      message.background.setDisplaySize(
        message.text.width,
        message.text.height
      );
      if (settings.iconRight) {
        message.setIconRight(settings.iconRight);
      }
      if (settings.iconLeft) {
        message.setIconLeft(settings.iconLeft);
      }
      message.setAlpha(1);
      message.setVisible(true);
      return message.__popUp(animationSettings);
    };
    if (priority) {
      fnCall();
    } else {
      addToArrayPopMessage(fnCall);
    }
  }
  setIconLeft(frame) {
    this.icon.x = -16;
    this.icon.setFrame(frame);
    this.background.x = -16;
    this.background.setDisplaySize(
      this.text.width + this.icon.displayWidth + 8,
      this.text.height
    );
  }
  setIconRight(frame) {
    this.icon.x = this.text.x + this.text.width + 2;
    this.icon.setFrame(frame);
    this.background.setDisplaySize(
      this.text.width + this.icon.displayWidth + 2,
      this.text.height
    );
  }
  __popUp(settings = {}) {
    const deferred = new Deffered();

    this.scene.add.tween({
      targets: this,
      y: { value: "-=100", ease: "quint.inOut" },
      alpha: { value: 0, ease: "Power1", delay: 500 },

      onComplete: () => {
        this.__alive = false;       
        deferred.resolve();
        
      },
      duration: 1000,
      ...settings,
    });
    return deferred.promise;
  }
}
