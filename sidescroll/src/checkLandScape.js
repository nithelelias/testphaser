const div = document.createElement("div");
div.id = "block-game";
const styles = {
  position: "fixed",
  top: "0px",
  left: "0px",
  width: "100%",
  height: "100%",
  zIndex: 99999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(10px)",
  background: "#11111191",
  color: "white",
  fontSize: "2em",
  textAlign: "center",
};
for (let key in styles) {
  div.style[key] = styles[key];
}
div.innerHTML = `Rotar la pantalla para poder continuar`;
function isLandScapeOrientation() {
  //FOR COMPATIBILITY REASONS:
  var mql = window.matchMedia("(orientation: landscape)");
  return mql.matches;
  //return window.orientation || screen.orientation.angle;
}
function validate(game) {
  if (isLandScapeOrientation()) {
    game.resume();
    div.remove();
    return true;
  } else {
    game.pause();
    document.body.append(div);
    return false;
  }
}
export default function checkLandScape(game, onLandscape) {
  window.addEventListener(
    "resize",
    () => {
      setTimeout(() => {
        if (validate(game)) {
          onLandscape();
        }
      }, 1);
    },
    false
  );
  if (validate(game)) {
    onLandscape();
  }
}
