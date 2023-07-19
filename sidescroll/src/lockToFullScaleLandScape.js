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
export default function lockToFullScaleLandScape() {
  return new Promise((resolve, reject) => {
    document.documentElement.requestFullscreen();
    setTimeout(() => {
      lockToLandScape().then(resolve, reject);
    }, 100);
  });
}
