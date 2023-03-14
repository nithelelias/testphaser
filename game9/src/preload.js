export default function preload() {
  this.load.bitmapFont("font1", "assets/fonts/gem.png", "assets/fonts/gem.xml");
  this.load.spritesheet("computer", "assets/images/pc.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
  this.load.spritesheet("player", "assets/images/player.png", {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.audio("step", "./assets/audio/step.mp3");
  this.load.audio("typing", "./assets/audio/typing.mp3");

  this.load.bitmapFont("font1", "assets/fonts/gem.png", "assets/fonts/gem.xml");
  this.load.spritesheet("icons", "assets/images/icons.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.spritesheet("bed", "assets/images/bed.png", {
    frameWidth: 32,
    frameHeight: 48,
  });

  this.load.image("wood-panel", "assets/images/panel.png");
  this.load.image("calendar", "assets/images/calendar.png");
  this.load.image("sun", "assets/images/sun.png");
  this.load.image("moon", "assets/images/moon.png");
  this.load.audio("tap", "./assets/audio/tap-effect.mp3");
  this.load.audio("click", "./assets/audio/click.mp3");
}
