const Resources = {
    assetname: "pack",
    cols: 49,
    rows: 22,
    guy: "f25_0",
    weapons: {
        sword: "f32_9",
        gun: "f37_9",
        launcher: "f43_9"

    },
    mobs: {
        "scorpion": "f24_5"
    },
    bullets: {
        bullet: "f29_11",
        rocket: "f32_21",
    },
    blow: ["f29_12", "f30_12", "f31_12"],
    maps: {
        level1: {
            floor: [1, 17],
            blocks:[[3,18],[4,18]],
            walls: {
                topleft: [0, 16], 
                topright: [2, 16],
                top: [1, 16],
                left: [0, 17],
               
                right: [2, 17],
                bottomleft: [0, 18],
                bottom: [1, 18],
                bottomright: [2, 18],
            }
        }
    }
}

export default Resources;