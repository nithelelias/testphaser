const random = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}
export default function generateDungeonGridRooms(limitX, limitY) {

    // GENERATE ROOMS
    console.log(limitX, limitY)
    const list = []
    const cursor = {
        x: 0,
        y: 0
    };
    const floors = [];
    let maxHeight = 0; 
    for (let i = 0; i < limitX; i++) {
        cursor.x = 0;
        maxHeight = 0;
        let floor = []
        for (let j = 0; j < limitY; j++) {
            // n items >= lastMaxWidth
            const room = {
                id: i + "_" + j,
                x: cursor.x + 0,
                y: cursor.y + 0,
                doors: [],
                width: random(10, 30),
                height: random(10, 40),
            };

            // MOVE CURSOR TO NEXT GAP

            cursor.x += room.width + 1;

            maxHeight = Math.max(maxHeight, room.height + 1);
            list.push(room);
            floor.push(room);

        };
        // CONECT LAST FLOOR
        if (i > 0) {
            const lastFloor = floors[i - 1];

            const connectToRoomUp = (room) => {
                let ytop = room.y - 1;
                let connectedUp = false;
                lastFloor.forEach((room2) => {
                    if (room2.id != room.id)
                        if (room2.y + room2.height == ytop) {
                            let minX = Math.max(room.x + 1, room2.x + 1);
                            let maxX = Math.min(room.x + room.width - 3, room2.x + room2.width - 3);
                            if (minX < maxX) {
                                connectedUp = true;
                                let xdoor = random(minX, maxX);
                                room2.doors.push({
                                    x: xdoor,
                                    y: ytop
                                })
                                room.doors.push({
                                    x: xdoor,
                                    y: ytop + 1
                                })
                            }
                        }
                });

                return connectedUp
            }

            let connectUp = false;
            floor.forEach((room) => {
                if (connectToRoomUp(room)) {
                    connectUp = true;
                }
            })
            if (!connectUp) {
                // get random room and move up 
                let rndIdx = random(0, limitY);
                let maxIterations = 50;
                while (maxIterations > 0) {
                    maxIterations--;
                    floor[rndIdx].y -= 1;
                    floor[rndIdx].height += 1;
                    if (connectToRoomUp(floor[rndIdx])) {
                        break;
                    }
                }
                if (maxIterations === 0) {
                    console.log("not found")
                }

            }
        }
        floors.push(floor);
        cursor.y += maxHeight + 0;
    }

    // ADD DOORS
    list.forEach((room, idx) => {
        // VALIDATE BOTTOM AND LEFT 

        let xLeft = room.x + room.width + 1;
        list.forEach((room2, idx2) => {
            if (idx !== idx2) {

                if (room2.x === xLeft) {
                    // CONNECTED LEFT
                    let minY = Math.max(room.y + 2, room2.y + 2);
                    let maxY = Math.min(room.y + room.height - 2, room2.y + room2.height - 2);
                    if (minY < maxY) {
                        let ydoor = random(minY, maxY);
                        room2.doors.push({
                            x: xLeft,
                            y: ydoor
                        })
                        room.doors.push({
                            x: xLeft - 1,
                            y: ydoor
                        })
                    }
                }
            }
        });

    })

    return list;
}

