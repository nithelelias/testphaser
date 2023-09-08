export default class Floor{
    constructor(scene){
        var polygon = new scene.add.Polygon([
            400, 100,
            200, 278,
            340, 430,
            650, 80
        ]);
        scene.add.existing(polygon)
    }
}