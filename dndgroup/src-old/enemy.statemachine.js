import StateMachine from "./stateMachine.js";

export default function enemyStateMachine({
  getClosestTarget,
  getTarget,
  getMinTouchDistance,
  moveTowardsTarget,
  doAttack,
}) {
  // THIS= ENEMY
  var busy = false,
    setBusy = (_state = true) => {
      busy = _state;
    };
  const machine = new StateMachine();
  machine.setState("idle");

  const goIdleIfNOTarget = () => {
    if (!getTarget()) {
      machine.setState("idle");
      return true;
    }
    return false;
  };
  const isCloseToTarget = () => {
    let dist = Phaser.Math.Distance.BetweenPoints(this, getTarget());

    return dist <= getMinTouchDistance();
  };

  machine.idle = () => {
    getClosestTarget();
    if (this.getTarget()) {
      machine.setState("chase");
      machine.chase()
    } else {
      machine.setState("free");
      machine.free()
    }
  };
  machine.free = () => {
    setBusy();
    setTimeout(() => {
      machine.setState("idle");
      setBusy(false);
    }, 1000);
  };

  machine.chase = () => {
    if (goIdleIfNOTarget()) {
      return;
    }
    //
    if (isCloseToTarget()) {
      machine.setState("attack");
      return;
    }

    ///
    setBusy();
    moveTowardsTarget().then(() => {       
      setBusy(false);
    });
  };

  machine.attack = () => {
    if (goIdleIfNOTarget()) {
      return;
    }

    if (!isCloseToTarget()) {
      machine.setState("chase");
      return;
    }
    //
    setBusy();

    doAttack().then(() => {
      setBusy(false);
    });
  };

  return {
    idle: () => {
      machine.setState("idle");
    },
    reset: () => {
      machine.setState("idle");
    },
    run: () => {
      if (busy) {
        return;
      }

      machine.run();
    },
  };
}
