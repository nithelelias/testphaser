export default class TextFromSprite extends Phaser.GameObjects.Container {
  constructor(
    scene,
    x,
    y,
    text = [] || "",
    resourceMap = { name: "", chars: {} },
    configs = { fontSize: 12, color: 0x000 }
  ) {
    super(scene, x, y, []);
    scene.add.existing(this);
    this.text = text;
    this.configs = configs;
    this.resourceMap = resourceMap;
    this.__renderText();
  }
  setText(_text) {
    this.text = _text;
    this.__renderText();
  }
  setColor(_color) {
    this.list.forEach((entity) => {
      entity.setTintFill(_color);
      this.configs.color = _color;
    });
  }
  __clear() {
    //or. use a group...nah
    while (this.list.length > 0) {
      let element = this.list.shift();
      if (element) {
        element.destroy && element.destroy();
      }
    }
  }

  __renderText() {
    this.__clear();
    const scene = this.scene;
    var _text = [].concat(this.text);
    const fontSize = this.configs.fontSize;
    const color = this.configs.color;
    const spacing = this.configs.spacing || fontSize * 0.65;
    const lineHeight = this.configs.lineHeight || fontSize * 0.8;
    var x = 0,
      y = 0,
      maxW = fontSize,
      maxH = fontSize;

    while (_text.length > 0) {
      let line = _text.shift();
      if (maxH < y + lineHeight) {
        maxH = y + lineHeight;
      }
      let charList = line.split("").map((character) => {
        if (maxW < x + spacing) {
          maxW = x + spacing;
        }
        let char = scene.add.image(
          x,
          y,
          this.resourceMap.name,
          this.resourceMap.chars[character]
        );
        char.setOrigin(0);
        char.setTintFill(color);
        char.setDisplaySize(fontSize, fontSize);
        x += spacing;

        return char;
      });
      x = 0;
      y += lineHeight;

      this.add(charList);
    }

    this.setSize(maxW, maxH);
  }
}
