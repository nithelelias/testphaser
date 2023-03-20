import { waitTimeout } from "../utils.js";

export async function AnimFadeIn(
  scene,
  onComplete = () => {},
  duration = 3000
) {
  scene.cameras.main.fadeIn(duration);
  await waitTimeout(duration);
  onComplete && onComplete();
}

export async function AnimFadeOut(
  scene,
  onComplete = () => {},
  duration = 3000
) {
  scene.cameras.main.fade(duration);
  await waitTimeout(duration);
  onComplete && onComplete();
}
