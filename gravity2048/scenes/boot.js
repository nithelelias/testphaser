export default class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.audio("pop", "./assets/audios/pop.mp3");
    this.load.audio("drop", "./assets/audios/drop.mp3");
    this.load.audio("music", "./assets/audios/music.mp3");
    this.load.script("webfont", "./assets/webfont.js");
    this.load.atlas(
      "bubbles",
      "./assets/particles/bubbles.png",
      "./assets/particles/bubbles.json"
    );
    this.load.image("star", "./assets/star3.png");
    this.load.image("sound-muted","./assets/sound-muted.png")
    this.load.image("sound-playing","./assets/sound-playing.png")
    this.load.atlasXML("animals", "assets/round.png", "assets/round.xml");
    let element = document.createElement("style");
    document.head.appendChild(element);
    element.sheet.insertRule(
      '@font-face { font-family: "main-font"; src: url("assets/fonts/troika.otf") format("truetype"); }',
      0
    );
  }
  create() {
    WebFont.load({
      custom: {
        families: ["main-font"],
      },
      active: () => {
        this.scene.start("main");
      },
    });
  }
}
