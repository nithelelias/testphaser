import { dungeonGenerator } from "../src/dungeonGenerator.js";
import Human from "../src/human.js";
import MapLayer from "../src/mapLayer.js";
import { movementOnDungeon } from "../src/movementOnDungeon.js";

const trueSpriteSize = 16;
export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
  }
  preload() {
    this.load.spritesheet("tilemap", "./assets/maptile.png", {
      frameWidth: trueSpriteSize,
      frameHeight: trueSpriteSize,
    });
  }
  create() {
    /// MAP LAYER
    this.mapLayer = new MapLayer(this, {
      frameSize: trueSpriteSize,
    });
    let dungeon = dungeonGenerator();
    this.dungeon = dungeon;
    // -console.log(data);
    this.mapLayer.renderData([dungeon.data]);
    this.party = [new Human(this, 32)];

    this.putPartyAtRoom(1);
    movementOnDungeon.call(this, 1);
    // FOLLOW PLAYER
    this.cameras.main.startFollow(this.party[0]);
    this.cameras.main.setZoom(2);
    //
  }

  getDungeonRoomPosition(roomNumber) {
    const gridSize = MapLayer.getGridSize(),
      half_gridSize = parseInt(gridSize / 2);
    let room = this.dungeon.getRoom(roomNumber);
    return {
      x: room.col * gridSize + half_gridSize,
      y: room.row * gridSize + half_gridSize,
    };
  }
  putPartyAtRoom(roomNumber) {
    const coords = this.getDungeonRoomPosition(roomNumber);
    this.party[0].setPosition(coords.x, coords.y);
  }
}
