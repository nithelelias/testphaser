export const pallettes = {
  min: 1,
  total: 4,
  1: ["#004E64", "#00a5cf", "#25a18e", "#9fffcb"],
  2: ["#688e26", "#f44708", "#550527", "#faa613"],
  3: ["#06aed5", "#086788", "#f0c808", "#fff1d0"],
  4: ["#e07a5f", "#3d405b", "#f4f1de", "#fed766"],
};
export const COLORS = {
  red: 0xff0000,
  primary: pallettes[1][0],
  secundary: pallettes[1][1],
  accent: pallettes[1][2],
  text: pallettes[1][3],
};
export const switchRndPallette = (n) => {
  let rnd = parseInt(Math.random(0) * pallettes.total + pallettes.min);
  let pallettePicked = pallettes[rnd];
  console.log("rnd", rnd, pallettePicked);
  COLORS.primary = pallettePicked[0];
  COLORS.secundary = pallettePicked[1];
  COLORS.accent = pallettePicked[2];
  COLORS.text = pallettePicked[3];
};
export const animals = [
  "chick", //2
  "chicken", //4
  "duck", //8
  "parrot", //16
  "frog", //32
  "owl", //64
  "pig", //128
  "monkey", //256
  "gorilla", //512
  "bear", //1024
  "panda", //2048
  "dog",
  "crocodile",
  "elephant",
  "giraffe",
  "goat",

  "hippo",
  "rabbit",
  "rhino",
  "sloth",
  "horse",
  "moose",
  "snake",
  "walrus",
  "zebra",
  "narwhal",
];
export const shapes = {
  default: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 1,
    fixtures: [
      {
        label: "circle",
        circle: {
          x: 32,
          y: 32,
          radius: 32,
        },
      },
    ],
  },
  chick: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.3,
    fixtures: [
      {
        label: "circle",
        circle: {
          x: 0,
          y: 0,
          radius: 16,
        },
      },
    ],
  },
  chicken: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.3,
    fixtures: [
      {
        label: "crest",
        isSensor: false,
        vertices: [
          [
            { x: 16, y: 0 },
            { x: 32, y: 0 },

            { x: 32, y: 12 },
            { x: 16, y: 12 },
          ],
        ],
      },
      {
        label: "circle",
        circle: {
          x: 24,
          y: 30,
          radius: 24,
        },
      },
    ],
  },
  frog: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.3,
    fixtures: [
      {
        label: "eye-left",
        circle: {
          x: 28,
          y: 15,
          radius: 15,
        },
      },
      {
        label: "eye-right",
        circle: {
          x: 68,
          y: 15,
          radius: 15,
        },
      },
      {
        label: "circle",
        circle: {
          x: 48,
          y: 58,
          radius: 46,
        },
      },
    ],
  },
  monkey: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.1,
    friction: 0.5,
    fixtures: [
      {
        label: "ear-left",
        isSensor: false,
        circle: {
          x: 22,
          y: 42,
          radius: 24,
        },
      },
      {
        label: "circle",
        isSensor: false,
        circle: {
          x: 72,
          y: 54,
          radius: 52,
        },
      },

      {
        label: "ear-right",
        isSensor: false,
        circle: {
          x: 120,
          y: 42,
          radius: 24,
        },
      },
    ],
  },
  bear: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.3,
    fixtures: [
      {
        label: "ear-left",
        circle: {
          x: 20,
          y: 20,
          radius: 18,
        },
      },
      {
        label: "ear-right",
        circle: {
          x: 155,
          y: 22,
          radius: 18,
        },
      },
      {
        label: "circle",
        circle: {
          x: 88,
          y: 78,
          radius: 72,
        },
      },
    ],
  },
  panda: {
    type: "fromPhysicsEditor",
    isStatic: false,
    density: 1,
    restitution: 0.1,
    fixtures: [
      {
        label: "ear-left",
        isSensor: false,
        circle: {
          x: 32,
          y: 48,
          radius: 32,
        },
      },
      {
        label: "circle",
        isSensor: false,
        circle: {
          x: 96,
          y: 70,
          radius: 70,
        },
      },

      {
        label: "ear-right",
        isSensor: false,
        circle: {
          x: 158,
          y: 48,
          radius: 32,
        },
      },
    ],
  },
};
switchRndPallette();
