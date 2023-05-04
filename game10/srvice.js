const url = `https://script.google.com/macros/s/AKfycbxhX-GUjWl2uI8neMamn5Dcj2aKM_9SVWJc4e5UeqgzvPRZSqZqro5jRenUwYKafnUz/exec/`;
var busy = false;
var lastbusytimeout;
function unbusy() {
  clearTimeout(lastbusytimeout);
  lastbusytimeout = setTimeout(() => {
    busy = false;
  }, 10);
}
export function isBusy() {
  return busy;
}
export function test(DATA = {}) {
  return GApi_get(url + "test", DATA);
}
export function putFrameAtCell(x, y, frame) {
  return GApi_get(url + "put", { x, y, frame, owner: "anonimus" });
}
export function syncNewFrames(frames) {
  return GApi_get(url + "sync", {
    frames: JSON.stringify(frames),
    owner: "anonimus",
  });
}

export function getWorld() {
  return GApi_get(url + "world", {});
}

function GApi_get(url, params) {
  return new Promise((resolve) => {
    busy = true;
    const jsonpcallback = "_" + Date.now() + "_callback";
    const serialize = (obj) =>
      Object.keys(obj)
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
        .join("&");
    const _script = document.createElement("script");
    const newparams = { ...params };
    window[jsonpcallback] = (r) => {
      resolve(r);
    };
    _script.onload = () => {
      console.log("script load");
      _script.remove();
      unbusy();
    };
    _script.onabort = () => {
      console.log("script aborted");
      _script.remove();
      unbusy();
    };
    newparams["$jsonpCallback"] = jsonpcallback;
    _script.src = url + "?" + serialize(newparams);
    document.body.appendChild(_script);
  });
}
