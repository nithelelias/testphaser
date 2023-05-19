import Main from "../scenes/main.js";

export function addHouse(x, y) {
  let world = Main.current().world; 
  world.getLayer().putTileAt(932, 10, 10);
}
