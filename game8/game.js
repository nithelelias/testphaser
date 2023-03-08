import Room from "./room.js";

var config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  parent: document.querySelector(".game__wrapper"),
  pixelArt: true,
  transparent: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var tileSize = 32;
var light;
var offsets = [];
var player;
var layer;
var cursors;
var game = new Phaser.Game(config);
var mazeConfig = {
  initX: 2,
  initY: 2,
  tileWidth: tileSize, //tileSize
  tileHeight: tileSize, //tileSize
  width: 17, // cols
  height: 16, // rows
};
var FRAMES = {
  size: 100,
  roomFrames: {
    0: 0,
    wall_up: 2,
    wall_down: 18,
    wall_left: 9,
    wall_right: 11,
    corner_up_right: 1,
    corner_up_left: 2,
    corner_down_left: 17,
    corner_down_right: 19,
  },
  empty: 0,
};

function preload() {
  this.load.image("walls", ["assets/tiles/pinkmaze.png"]);
  this.load.atlas(
    "emojis",
    "assets/sprites/emojis.png",
    "assets/sprites/emojis.json"
  );
  // this.load.tilemapCSV("map", "assets/grid.csv");
  this.load.tilemapCSV("corner", "assets/rooms/corners.csv");
}

function scaleGame() {
  var width = (mazeConfig.initX * 2 + mazeConfig.width) * tileSize;
  var height = (mazeConfig.initY * 2 + mazeConfig.height) * tileSize;
  this.scale.resize(width, height);
  this.scale.refresh();
}

function createMaze() {
  var map = this.make.tilemap({ ...mazeConfig });

  var tileset = map.addTilesetImage("walls", null, FRAMES.size, FRAMES.size);
  layer = map.createBlankLayer("layer1", tileset).setPipeline("Light2D");
  //layer = map.createLayer(0, tileset, 0, 0).setPipeline("Light2D");
  layer.x = mazeConfig.initX * tileSize;
  layer.y = mazeConfig.initY * tileSize;

  let room = new Room(
    map,
    mazeConfig.width,
    mazeConfig.height,
    FRAMES.roomFrames
  );
}
function create() {
  window.$scene = this;
  scaleGame.call(this);
  createMaze.call(this);

  player = this.add.image(0, 0, "emojis", "smile1").setOrigin(0);
  player.setDisplaySize(32, 32);
  player.x = 8 * tileSize;
  player.y = 11 * tileSize;
  cursors = this.input.keyboard.createCursorKeys();

  light = this.lights.addLight(0, 0, 200).setScrollFactor(0.0);

  this.lights.enable().setAmbientColor(0x555555);
  this.container = this.add.container(
    mazeConfig.initX * tileSize,
    mazeConfig.initY * tileSize,
    this.children.list.splice(0)
  );
  console.log(this.children.list);
  // this.input.on('pointermove', function (pointer) {

  //     light.x = pointer.x;
  //     light.y = pointer.y;

  // });

  this.lights.addLight(0, 100, 100).setColor(0xff0000).setIntensity(3.0);
  this.lights.addLight(0, 200, 100).setColor(0x00ff00).setIntensity(3.0);
  this.lights.addLight(0, 300, 100).setColor(0x0000ff).setIntensity(3.0);
  this.lights.addLight(0, 400, 100).setColor(0xffff00).setIntensity(3.0);

  offsets = [0.1, 0.3, 0.5, 0.7];
}
function getPositionFroomCoords(x, y) {
  return {
    x: parseInt(x / tileSize),
    y: parseInt(y / tileSize),
  };
}
function mirrorMove(x, y) {
  if (x < 0) {
    player.x = (mazeConfig.width - 1) * tileSize;
    return true;
  }
  if (x > mazeConfig.width - 1) {
    player.x = 0;
    return true;
  }
  if (y < 0) {
    player.y = (mazeConfig.height - 1) * tileSize;
    return true;
  }
  if (y > mazeConfig.height - 1) {
    player.y = 0;
    return true;
  }
  return false;
}
function moveTo(vx, vy) {
  let p = getPositionFroomCoords(player.x, player.y);
  let newP = {
    x: p.x + vx,
    y: p.y + vy,
  };
  var tile = layer.getTileAt(newP.x, newP.y, true);
  if (mirrorMove(newP.x, newP.y)) {
    return;
  }

  if (tile && tile.index === FRAMES.empty) {
    player.x += tileSize * vx;
    player.y += tileSize * vy;
  }
}
function update() {
  if (this.input.keyboard.checkDown(cursors.left, 100)) {
    moveTo(-1, 0);
  } else if (this.input.keyboard.checkDown(cursors.right, 100)) {
    moveTo(1, 0);
  } else if (this.input.keyboard.checkDown(cursors.up, 100)) {
    moveTo(0, -1);
  } else if (this.input.keyboard.checkDown(cursors.down, 100)) {
    moveTo(0, 1);
  }

  light.x = this.container.x + player.x;
  light.y = this.container.y + player.y;

  var index = 0;

  this.lights.lights.forEach(function (currLight) {
    if (light !== currLight) {
      currLight.x = 400 + Math.sin(offsets[index]) * 1000;
      offsets[index] += 0.02;
      index += 1;
    }
  });
}
