export default function JsonPacked(
  frame_size = 16,
  resource_dimension = [128, 128],
  preName=""
) {
  const json = {
    frames: [],
  };
  const size = frame_size;
  const dim = resource_dimension;
  const maxX = dim[0] / size;
  const maxY = dim[1] / size;
  let n = 0;
  for (let i = 0; i < maxX; i++) {
    for (let j = 0; j < maxY; j++) {
      n++;
      json.frames.push({
        filename: preName + n,
        rotated: false,
        trimmed: false,
        frame: {
          x: j * size,
          y: i * size,
          w: size,
          h: size,
        },
      });
    }
  }

  return json;
}