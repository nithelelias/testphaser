import generateDungeonGridRooms from "../../common-utils/dungeongrid.js";
import Resources from "../models/resources.js";

export default class Map {
    constructor(context) {
        this.scale = 1;
        this.tileSize = 16;
        this.tileMapConfigs = {
            tileWidth: this.tileSize,//tileSize
            tileHeight: this.tileSize,//tileSize
            width: 30,// cols
            height: 30// rows
        };


        this.width = this.tileMapConfigs.width * this.tileSize;
        this.height = this.tileMapConfigs.height * this.tileSize;


        this.map = context.make.tilemap(this.tileMapConfigs);

        const tileset = this.map.addTilesetImage(Resources.assetname, Resources.assetname, this.tileSize, this.tileSize);
        this.layer = this.map.createBlankLayer("layer1", tileset);
        this.layer.setCollisionByProperty({ collides: true });


        this.layer.setScale(this.scale);
        // lets fill the layer with custom frame
        this.layer.fill(0);


        const getFrame = (arrowPos) => {
            return (arrowPos[0]) + (arrowPos[1] * Resources.cols);
        }
        const toArray = (frame) => {
            return [{ index: frame, weight: 1 }]
        }
        const WALLS = {
            topleft: 0,
            topright: 0,
            bottomleft: 0,
            bottom: 0,
            bottomright: 0,
            //
            top: 0,
            left: 0,
            right: 0,
        };
        const wallFrames = Resources.maps.level1.walls;
        const floorFrames = [].concat(Resources.maps.level1.floor);
        const FLOOR = floorFrames.map((arrayFrame) => ({ index: getFrame(arrayFrame), weight: 1 })).concat([
            { index: 0, weight: 10 },
            { index: 1, weight: 2 },
            { index: 2, weight: 3 },
            { index: 3, weight: 2 },
            { index: 4, weight: 2 },
        ]);

        for (let key in wallFrames) {
            WALLS[key] = getFrame(wallFrames[key]);
        }
        const createRoom = (room, haveFloor = true) => {
            // FLOOR
            if (haveFloor)
                this.map.weightedRandomize(FLOOR, room.x, room.y, room.width, room.height);
            // // corners
            this.map.putTileAt(WALLS.topleft, room.x, room.y);
            this.map.putTileAt(WALLS.bottomleft, room.x, room.y + room.height);
            this.map.putTileAt(WALLS.topright, room.x + room.width, room.y);
            this.map.putTileAt(WALLS.bottomright, room.x + room.width, room.y + room.height);
            // //walls
            this.map.weightedRandomize(toArray(WALLS.top), room.x + 1, room.y, room.width - 1, 1);
            this.map.weightedRandomize(toArray(WALLS.left), room.x, room.y + 1, 1, room.height - 1);
            this.map.weightedRandomize(toArray(WALLS.right), room.x + room.width, room.y + 1, 1, room.height - 1);
            this.map.weightedRandomize(toArray(WALLS.top), room.x + 1, room.y + room.height, room.width - 1, 1);
            // 
            room.doors.forEach((door) => {
                this.map.putTileAt(FLOOR[0].index, door.x, door.y);
            })
        }

        createRoom({
            x: 0, y: 0, width: this.tileMapConfigs.width - 1, height: this.tileMapConfigs.height - 1, doors: []
        }, false)


        this.layer.setCollision(Object.values(WALLS), true);


    }
    setScale(_scale) {
        this.scale = _scale;
        this.layer.setScale(_scale);
    }
    getWidth() {
        return this.width * this.scale;
    }
    getHeight() {
        return this.height * this.scale;
    }
}