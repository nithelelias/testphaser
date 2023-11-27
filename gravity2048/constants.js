export const pallettes = {
  min: 1,
  total: 4,
  1: ["#004E64", "#00a5cf", "#25a18e", "#9fffcb"],
  2: ["#688e26", "#f44708", "#550527", "#faa613"],
  3: ["#06aed5", "#086788", "#f0c808", "#fff1d0"],
  4: ["#e07a5f", "#3d405b", "#f4f1de", "#fed766"],
};
export const COLORS = {
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
  "chick",
  "chicken",
  "duck",
  "frog",
  "dog",
  "parrot",
  "owl",
  "cow",
  "bear",
  "gorilla",
  "crocodile",
  "panda",
  "elephant",

  "giraffe",
  "goat",
  "hippo",
  "horse",
  "monkey",
  "moose",
  "narwhal",
];

switchRndPallette();
