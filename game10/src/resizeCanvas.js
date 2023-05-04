export default function resizeCanvas(game) {
  console.log(game);

  addEventListener("resize", (event) => {
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
  });
}
