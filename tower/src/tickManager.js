import Deffered from "./deferred.js";

var tick = 0;
var currentEventTimer;
var onready = new Deffered();
export default class TickManager {
  static EVENT_TICK = "TICK-EVENT-CALL";
  static start(scene) {
    currentEventTimer = scene.time.addEvent({
      delay: 1000,
      repeat: true,
      loop: true,
      callback: () => {
        tick++;
        scene.game.events.emit(TickManager.EVENT_TICK, tick);
      },
    });
    onready.resolve(scene);
  }
  static onTick( fnCallback) {
    onready.promise.then((scene) => {
      scene.game.events.on(TickManager.EVENT_TICK, fnCallback);
    });

    return () => {
      onready.promise.then((scene) => {
        scene.game.events.off(TickManager.EVENT_TICK, fnCallback);
      });
    };
  }
  static getEventTimer() {
    return currentEventTimer;
  }
}
