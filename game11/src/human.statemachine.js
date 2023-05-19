import getTileSize from "./getTileSize.js";
import random from "./random.js";

function idle() {
  // this=human
  // MOVE AROUND
  let vel = getTileSize();
  this.x += vel * random(-1, 1);
  this.y += vel * random(-1, 1);
}

export default function HumanStateMachine() {
  // this = human
  const STATES = {
    idle: "idle",
    attack: "attack",
    work: "work",
  };
  const statechanges = {
    idle: "*",
    attack: "idle",
    work: "*",
  };
  var currentState = "idle";

  const runState = () => {
    if (currentState === STATES.idle) {
      idle.call(this);
      return;
    }
    if (currentState === STATES.attack) {
      attack.call(this);
      return;
    }
    if (currentState === STATES.work) {
      work.call(this);
      return;
    }
  };
}
