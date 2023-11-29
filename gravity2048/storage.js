import connect from "./connect.js";

export function getRanking() {
  return connect.get({ task: "ranking" });
}
export function storeScore(username, points, max) {
  return connect.get({ task: "add-score", username, points, max });
}
