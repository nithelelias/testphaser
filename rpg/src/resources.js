const RESOURCES = {
  name: "maptile",
  trueSpriteSize: 16,
  empty: 0,
  human: 25,
  chest: 302,
  chest_open: 303,
  maps: {
    woods: {
      empty: [101, 102],
      floor: [0, 5, 1],
      walls: [
        [52, 52, 52],
        [52, 101, 52],
        [52, 52, 52],
      ],
    },
    crypt: {
      empty: [68],
      floor: [0, 1],
      walls: [
        [18, 19, 20],
        [67, 68, 69],
        [116, 117, 118],
      ],
    },
  },
};

export default RESOURCES;
