import { syncNewFrames } from "../srvice.js";

var storedActions = {};
var syncing = false;
function getStoredActions() {
  return Object.values(storedActions);
}

function save(action) {
  let key = action.x + "_" + action.y;
  storedActions[key] = action;
}

async function sync() {
  let actions = getStoredActions();
  if (actions.length === 0 || syncing) {
    return true;
  }
  syncing = true;
  let temp_store = { ...storedActions };
  storedActions = {};
  return syncNewFrames(actions).then((response) => {
    try {
      syncing = false;
      let json = JSON.parse(response);
      if (!json.success) {
        storedActions = { ...temp_store, ...storedActions };
      }
      return json.success;
    } catch (e) {
      console.error(e);
    }
    return false;
  });
}
function isBusy() {
  return syncing;
}
export default { save, sync, isBusy };
