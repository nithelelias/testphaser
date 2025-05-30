export default function iterate(max, callbackFn) {
  let i = 0;
  while (i < max) {
    if (callbackFn(i) === false) {
      break;
    }
    i++;
  }
}
