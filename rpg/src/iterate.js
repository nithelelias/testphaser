export default function iterate(from, to, callback) {
  let i = 0 + from;
  while (i < to) {
    callback(i);
    i++;
  }
}
