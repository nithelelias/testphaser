import Main from "../scenes/main.js";

export default function updateWorldLive(data) {
  Main.getWorld().putLiveData(data);
}
