//import { toggleFullScreen } from "./requestFullScreen.js";

const lockToLandScape = () => {
  return screen.orientation
    .lock("landscape")
    .then(() => {
      return { sucess: true, message: `Locked to landscape` };
    })
    .catch((error) => {
      return { sucess: false, message: error };
    });
};
export default function lockToFullScaleLandScape(scene) {
  return new Promise((resolve, reject) => {
    //document.documentElement.requestFullscreen();
    if (scene.scale.isFullscreen) {
      scene.scale.startFullScreen();
    }
    setTimeout(() => {
      lockToLandScape().then(resolve, reject);
    }, 100);
  });
}
