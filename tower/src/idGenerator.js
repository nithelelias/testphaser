export default function IdGenerator(init = 1) {
  var active = true;
  function* _generator() {
    let i = init + 0;
    while (active) {
      yield i;
      i++;
    }
  }
  const iterator = _generator();

  return {
    next: () => {
      return iterator.next().value;
    },
    stop: () => {
      active = false;
      iterator.next();
    },
  };
}
