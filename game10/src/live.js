import { getWorld, isBusy } from "../srvice.js";
import updateWorldLive from "./updateWorldLive.js";

var intervalId;

function requestWorld() {
  getWorld().then((response) => {
    try {
      let json = JSON.parse(response);
      if (json.data) {
        updateWorldLive(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  });
}

function loop() {
  if (isBusy()) {
    return;
  }

  requestWorld();
}

function start() {
  intervalId = setInterval(loop, 1000);
}

export default { start };
