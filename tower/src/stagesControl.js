import { GRIDSIZE, RESOURCE_DELAY } from "./constants.js";
import getTileFromRowCol from "./getTileFromRowCol.js";
import MapResource from "./mapResource.js";
import random from "./random.js";

const STATES = ["preparation", "resources", "battle"];
const MAX_STATES = STATES.length;
export default class StageControl {
  constructor(mainScene, mobSpawnController) {
    this.scene = mainScene;
    this.mobSpawnController = mobSpawnController;
    this.state = "preparation";
    
  }

  addRandomResource() {
    // APPEAR SOME RESOURCES rock, woods , gold, metal.
    const maxCols = parseInt(this.scene.scale.width / GRIDSIZE);
    const maxRows = parseInt(this.scene.scale.height / GRIDSIZE);
    const { x, y } = getTileFromRowCol(random(1, maxCols), random(1, maxRows));
    const resourceName = "wood",
      total = 10;
    MapResource.create(this.scene, x, y, resourceName, total);
  }
  nextState() {
    let idx = STATES.indexOf(this.state) + 1;
    if (idx >= MAX_STATES) {
      idx = 0;
    }
    this.state=STATES[idx]
  }
  run() {
    this.nextState(); 
    // Lets do a timer
    if (this.state === "resources") {
      this.addRandomResource();
      return;
    }
    //
    if (this.state === "battle") {
      this.mobSpawnController.initSpawns(3);
      return;
    }
  }
}
