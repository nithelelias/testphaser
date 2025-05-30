import scenes from "./scenes.js";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  parent: document.getElementById("canvasWrapper"),
  width: window.innerWidth,
  height: window.innerHeight,
  scene: scenes,
  /* transparent: true, */
});


document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});