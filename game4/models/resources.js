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
    door: {
        close: "f8_11",
        open: "f8_10"
    },
    chest: {
        close: "f8_6",
        open: "f9_6"
    },
    maps: {
        door: {
            close: [8, 11],
            open: [8, 10]
        },
        level1: {

            floor: [1, 17],
            blocks: [[3, 18], [4, 18]],
            walls: {
                topleft: [0, 16],
                topright: [2, 16],
                bottomleft: [0, 18],
                bottomright: [2, 18],
                //
                top: [1, 16],
                bottom: [1, 18],
                left: [0, 17],
                right: [2, 17],
            }
        }
    }
}

export default Resources;