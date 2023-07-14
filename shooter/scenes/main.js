import { dungeon_minmaxrooms } from "../src/constants.js";
import { getKeys, removeKeys, updateRoomNumber } from "../src/context/data.js";
import { dungeonGenerator } from "../src/dungeonGenerator.js";
import dungeonOpenDoor, {
  dungeonGetDoorNearCoords,
} from "../src/dungeonOpenDoor.js";
import Item from "../src/item.js";
import MapLayer from "../src/mapLayer.js";
import Player from "../src/player.js";
import RESOURCES from "../src/resources.js";
import UserKeyControls from "../src/userKeyControls.js";
import whenPlayerChangeRoom from "../src/whenPlayerChangeRoom.js";

export default class Main extends Phaser.Scene {
  static current = null;
  constructor() {
    super("main");
    window.main = this;
    Main.current = this;
  }

  create() {
    this.bulletGroup = this.physics.add.group({
      runChildUpdate: true,
    });
    this.stage = this.physics.add.group({
      runChildUpdate: true,
    });
    this.staticGroup = this.physics.add.staticGroup();
    this.itemGroup = this.physics.add.group();
    this.userKeyControl = new UserKeyControls(this);
    this.mapLayer = new MapLayer(this, {
      frameSize: RESOURCES.tilesize,
    });
    const framesDataMap = RESOURCES.maps.crypt2;
    let dungeon = dungeonGenerator(dungeon_minmaxrooms, framesDataMap);
    this.dungeon = dungeon;
    this.mapLayer.renderData([dungeon.data], framesDataMap.floor);
    this.player = new Player(this);
    this.stage.add(this.player);
    this.putPlayerAtRoom(1);

    // WHEN
    whenPlayerChangeRoom.call(this);
    // FOLLOW PLAYER
    this.cameras.main.zoomTo(2, 1000);
    this.cameras.main.startFollow(this.player);

    // COLLIDERS
    this.physics.add.collider(
      this.stage,
      this.mapLayer.layers[0],
      (entity, layer, e) => {
        if (entity.isPlayer) {
          this.playerHitWall(layer);
          return;
        }
      },
      null,
      this
    );
    this.physics.add.collider(
      this.bulletGroup,
      this.mapLayer.layers[0],
      (entity, layer, e) => {
        entity.hit(null);
        return;
      },
      null,
      this
    );
    this.physics.add.collider(this.stage, this.stage);
    this.physics.add.overlap(
      this.stage,
      this.bulletGroup,
      (entity, bullet) => { 
        if (bullet.owner !== entity) {
          entity.hit(bullet);
          bullet.hit(entity);
        }
      },
      null,
      this
    );
    this.physics.add.collider(
      this.stage,
      this.staticGroup,
      (stageEntity, staticentity, e) => {
        if (staticentity.isChest) {
          staticentity.open();
        }
        if (stageEntity.isBullet) {
          stageEntity.hit(null);
          return;
        }
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.itemGroup,
      (player, item) => {
        item.pickUp();
      },
      null,
      this
    );
  }
  addToStage(_elements, is_static = false) {
    let elements = [].concat(_elements);
    if (is_static) {
      this.staticGroup.add(...elements);
      return;
    }
    elements.forEach((element) => {
      if (element.isBullet) {
        this.bulletGroup.add(element);
        return;
      }
      this.stage.add(element);
    });
  }
  addItem(x, y, dataItem) {
    const item = Item.create(this, x, y, dataItem);
    this.itemGroup.add(item);

    return item;
  }
  getDungeonRoomPosition(roomNumber) {
    const gridSize = MapLayer.getGridSize(),
      half_gridSize = parseInt(gridSize / 2);
    let room = this.dungeon.getRoom(roomNumber);
    return {
      x: room.initCol * gridSize + half_gridSize,
      y: room.initRow * gridSize + half_gridSize,
      center: {
        x: room.col * gridSize + half_gridSize,
        y: room.row * gridSize + half_gridSize,
      },
    };
  }
  getPlayerCurrenRoomNumber() {
    const gridSize = MapLayer.getGridSize();
    const roomSize = this.dungeon.roomSize;
    let maxWidth = roomSize.width * gridSize;
    let maxHeight = roomSize.height * gridSize;
    const colMap = parseInt(this.player.x / maxWidth);
    const rowMap = parseInt(this.player.y / maxHeight);
    const roomNumber = this.dungeon.map[rowMap][colMap];
    return roomNumber;
  }
  getPlayerCurrenRoom() {
    let room = this.dungeon.getRoom(this.getPlayerCurrenRoomNumber());
    return room;
  }

  putPlayerAtRoom(roomNumber) {
    let coords = this.getDungeonRoomPosition(roomNumber);
    this.player.setPosition(coords.center.x, coords.center.y);
  }
  openDoorAtRoom(
    roomNumber = 1,
    doorPositionName = "left" || "right" || "top" || "bottom"
  ) {
    let room = this.dungeon.getRoom(roomNumber);
    dungeonOpenDoor(this.dungeon, this.mapLayer, room, doorPositionName);
  }

  playerHitWall(hitTile) {
    if (hitTile.index === this.dungeon.dungeonFRAMES.door.close) {
      // IS DOOR

      if (getKeys() > 0) {
        let doorsAt = dungeonGetDoorNearCoords(
          this.player,
          this.dungeon,
          this.mapLayer,
          false
        );
        if (doorsAt.length == 0) {
          return;
        }

        let room = this.getPlayerCurrenRoom();
        let doorPositionName = doorsAt[0];
        dungeonOpenDoor(this.dungeon, this.mapLayer, room, doorPositionName);
        removeKeys(1);
      }
    }
  }

  update(time, delta) {
    this.userKeyControl.update(time, delta);
    this.player.move(this.userKeyControl.getMovingVelocity());
    updateRoomNumber(this.getPlayerCurrenRoomNumber());
  }
}
