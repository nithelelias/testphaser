import onResize from "./onResize.js";

export default function resizeCanvas(game) {
  const unbindEvent = onResize(() => {
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
  });
  return unbindEvent;
}
