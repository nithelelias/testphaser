import { Deffered } from "./utils.js";
export function ProgressBar(
  scene,
  x,
  y,
  width = 100,
  height = 30,
  settings = { color: 0xffffff, backgroundColor: 0x111111 }
) {
  settings = Object.assign(
    { color: 0xffffff, backgroundColor: 0x111111 },
    settings
  );
  if (!scene.textures.list.hasOwnProperty("bar")) {
    let g = scene.make.graphics({ add: false });
    g.fillStyle(0xff0000);
    g.fillRect(0, 0, 10, 10);
    g.generateTexture("bar", 8, 8);
    g.clear();
  }

  let backgroundBar = scene.add
    .image(x, y, "bar")
    .setOrigin(0, 0.5)
    .setDisplaySize(width, height)
    .setTintFill(settings.backgroundColor);
  let bar = scene.add
    .image(x, y, "bar")
    .setOrigin(0, 0.5)
    .setTintFill(settings.color);
  const setValue = (p) => {
    bar.setDisplaySize(width * (p / 100), height);
  };
  setValue(0);
  return {
    bar,
    backgroundBar,
    destroy() {
      bar.destroy();
      backgroundBar.destroy();
    },
    setValue,
    setTimeout(duration = 1000) {
      let deferred = new Deffered();
      let holder = { value: 0 };
      scene.add.tween({
        targets: holder,
        value: 1,
        onUpdate: () => {
          setValue(holder.value * 100);
        },
        onComplete: () => {
          deferred.resolve();
        },
        duration,
      });

      return deferred.promise;
    },
  };
}

export function addMessages(scene, messages) {
  let deferred = new Deffered();
  let text = scene.add
    .text(config.width / 2, config.height / 2, messages[0])
    .setOrigin(0.5);
  let pointerDownListener = (p) => {
    if (messages.length > 0) {
      text.setText(messages.shift());
      return;
    }
    if (text) {
      text.destroy();
      scene.input.removeListener("pointerdown", pointerDownListener);
      deferred.resolve();
    }
  };
  scene.input.on("pointerdown", pointerDownListener, scene);
  return deferred.promise;
}
export function addTextAnimations(
  scene,
  messages,
  yoyo = false,
  duration = 500
) {
  let deferred = new Deffered();
  let text = scene.add
    .text(config.width / 2, config.height / 2, messages[0])
    .setOrigin(0.5);

  let nextMessage = () => {
    text.setText(messages.shift());
    text.setAlpha(1);
    text.setScale(1);
    scene.add.tween({
      targets: text,
      alpha: 0,
      scale: 3,
      yoyo,
      onComplete: () => {
        if (messages.length < 1) {
          text.destroy();
          deferred.resolve();
        } else {
          nextMessage();
        }
      },
      duration,
    });
  };
  nextMessage();

  return deferred.promise;
}

export function HurryText(
  x,
  y,
  font = "font1",
  text = ["Click to Hurry"],
  fontSize = 32
) {
  var hurryText = this.add
    .bitmapText(x, y, font, text, fontSize)
    .setOrigin(0.5)
    .setAlpha(0);
  var visible = true;
  var hurryTextAnim = this.tweens.add({
    targets: hurryText,
    loop: -1,
    alpha: 1,
    yoyo: true,
    duration: 300,
    onUpdate: () => {
      if (!visible) {
        hurryText.alpha = 0;
      }
    },
  });

  return {
    text: hurryText,
    tween: hurryTextAnim,
    show: () => {
      visible = true;
    },
    hide: () => {
      visible = false;
    },
    remove: () => {
      hurryTextAnim.remove();
      hurryText.destroy();
    },
  };
}
