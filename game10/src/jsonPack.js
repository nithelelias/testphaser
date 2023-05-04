export default function JsonPacked(size = 16, dim = [784, 352]) {
  const json = {
    frames: [],
  };
  const maxW = dim[0] / size;
  const maxH = dim[1] / size;
  let count = 1;

  for (let j = 0; j < maxH; j++) {
    for (let i = 0; i < maxW; i++) {
      json.frames.push({
        filename: count,
        rotated: false,
        trimmed: false,
        frame: {
          x: i * size,
          y: j * size,
          w: size,
          h: size,
        },
      });
      count++;
    }
  }

  return json;
}
