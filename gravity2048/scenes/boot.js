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
    this.load.image("sound-muted", "./assets/sound-muted.png");
    this.load.image("sound-playing", "./assets/sound-playing.png");
    this.load.image("replay", "./assets/replay.png");
    this.load.image("crown", "./assets/crown.png");
    this.load.image("star", "./assets/star.png");
    this.load.image("empty-star", "./assets/empty-star.png");
    this.load.atlasXML("animals", "assets/round.png", "assets/round.xml");
  }
  create() {
    WebFont.load({
      custom: {
        families: ["main-font","alter-font"],
      },
      active: () => {
        this.scene.start("main");
      },
    });
  }
}
