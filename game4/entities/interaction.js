import Resources from "../models/resources.js";

export default class Interaction extends Phaser.GameObjects.Sprite {
    constructor(context, x, y) {
        super(context, x, y, Resources.assetname, 0);
        this.setOrigin(0)

    }
}