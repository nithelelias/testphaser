import { dungeonGenerator } from "../src/dungeonGenerator.js";
import generateRect from "../src/generateRect.js";
import Human from "../src/human.js";
import MapLayer from "../src/mapLayer.js";
import { movementOnDungeon } from "../src/movementOnDungeon.js";
import random from "../src/random.js";
import RESOURCES from "../src/resources.js";

export default class Main extends Phaser.Scene {
  constructor() {
    super("main");
    window.main = this;
  }
  preload() {
    this.load.spritesheet(RESOURCES.name, "./assets/maptile.png", {
      frameWidth: RESOURCES.trueSpriteSize,
      frameHeight: RESOURCES.trueSpriteSize,
    });
    generateRect(this);
  }
  create() {
    /// MAP LAYER
    this.mapLayer = new MapLayer(this, {
      frameSize: RESOURCES.trueSpriteSize,
    });
    const framesDataMap = RESOURCES.maps.crypt;
    let dungeon = dungeonGenerator([8, 12], framesDataMap);
    this.dungeon = dungeon;
    // -console.log(data);
    this.mapLayer.renderData([dungeon.data], framesDataMap.floor);
    this.addStuffsToDungeonMap();

    this.party = [new Human(this, this.mapLayer.getGridSize())];
    this.putPartyAtRoom(1);
    movementOnDungeon.call(this, 1);
    // FOLLOW PLAYER
    this.cameras.main.startFollow(this.party[0]);
    this.cameras.main.setZoom(2);
    //
  }
  addStuffsToDungeonMap() {
    // STUFFS
    const gridSize = MapLayer.getGridSize();
    this.dungeon.stuffs = {
      chests: [],
    };
    const getRandomRoomNumberToStuff = (max = 3, stuffKey, fnCallback) => {
      let total = random(1, max);
      let iterations = 0;
      while (total > 0 && iterations < this.dungeon.totalRooms) {
        let roomNumber = random(2, this.dungeon.totalRooms - 2);
        if (!this.dungeon.stuffs[stuffKey].includes(roomNumber)) {
          this.dungeon.stuffs[stuffKey].push(roomNumber);
          // PUT THE CHEST AT SOMEWHERE IN ROOM
          fnCallback(roomNumber);
          total--;
        }
      }
    };
    const getRandomPosiblePositionAtRoom = (roomNumber) => {
      let roomCoordenates = this.getDungeonRoomPosition(roomNumber);
      // PUT CHEST SOMEWHERE min+1, max-1
      let maxX = parseInt(this.dungeon.roomSize.width / 2) - 1;
      let maxY = parseInt(this.dungeon.roomSize.height / 2) - 1;
      let dx = [-1, 1][random(0, 1)],
        dy = [-1, 1][random(0, 1)];
      let ix = random(0, maxX);
      let iy = random(0, maxY);
      if (ix === 0) {
        iy = Math.max(2, Math.min(maxY - 2, iy));
      }
      if (iy === 0) {
        ix = Math.max(2, Math.min(maxX - 2, ix));
      }
      let coords = {
        x: roomCoordenates.x + ix * (gridSize * dx),
        y: roomCoordenates.y + iy * (gridSize * dy),
      };
      return coords;
    };
    
    //   chests -> items, cloth armor, weapon etc
    getRandomRoomNumberToStuff(3, "chests", (roomNumber) => {
      const coords = getRandomPosiblePositionAtRoom(roomNumber);
      // lets create for now just an sprite.
      const chest = this.add
        .sprite(coords.x, coords.y, RESOURCES.name, RESOURCES.chest)
        .setDisplaySize(gridSize / 2, gridSize / 2);

      console.log(chest);
    });
    /*
     *  mobs -> fight win exp loot
     *  npc -> for story purpose? tips etc.
     *  gates -> require key to open.
     *  finalroom -> boss or stairs next map.
     */
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
