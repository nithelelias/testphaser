import { FONTS } from "../constants/values.js";
const BASE_SPEED = 60;
export default class Enemy extends Phaser.GameObjects.Container {
  sprite;
  upperText;
  myChars= "a";
  speed = 1;
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene.add.existing(this);
    this.setSize(32, 32);
    this.sprite = scene.add
      .image(0, 0, "__WHITE")
      .setDisplaySize(this.width, this.height);
    this.add(this.sprite);

    this.upperText = scene.add
      .text(0, -this.height / 2 - 4, this.myChars, {
        fontFamily: FONTS.font1,
        fontSize: 32,
        color: "#111111",
        backgroundColor: "#ffffff",
        padding: {
          x: 10,
          y: 10,
        },
        wordWrap: {
          width: 100,
        },
      })
      .setOrigin(0.5, 1);
    this.add(this.upperText);
    this.setMyChar(this.myChars);
    this.speed = BASE_SPEED;
  }
  setSpeedLevel(speedLevel) {
    this.speed = BASE_SPEED * (1 + speedLevel / 2);
  }
  setMyChar(char) {
    this.myChars = char.toLowerCase();
    this.upperText.setText(this.myChars);
  }
  respawn(x, y) {
    this.active = true;
    this.setVisible(true);
    this.setPosition(x, y);
  }
  checkChar(char) {
    if (this.myChars[0] !== char) return false;
    this.myChars = this.myChars.slice(1);
    return true;
  }
  takeDamage() {
    this.upperText.setText(this.upperText.text.slice(1));
    return true;
  }
  hasBeenKilled() {
    return this.myChars.length === 0;
  }
  kill() {
    this.active = false;
    this.setVisible(false);
  }
}
