import Resources from "./resources.js";


const Weapons = {
    assetname: Resources.assetname,
    gun: {
        frame: Resources.weapons.gun,
        ang: 0,
        bullet: "bullet",
        delay: 150,
    },
    launcher: {
        frame: Resources.weapons.launcher,
        ang: 0,
        bullet: "rocket",
        delay: 1000
    }
};

export const Bullets = {
    bullet: {
        frame: Resources.bullets.bullet,
        ang: 2.4,
        speed:600,
    },
    rocket: { 
        frame: Resources.bullets.rocket,
         ang: 0.7,
        speed:150,scale:1.5,lifespan:2000 },
}

export default Weapons;