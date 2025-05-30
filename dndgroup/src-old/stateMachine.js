export default class StateMachine {
  __state = "_idle_";

  setState(name) {
    this.__state = name;
  }

  run() {
    if (this.hasOwnProperty(this.__state)) {
      this[this.__state]();
    }
  }
  _idle() {}
}
