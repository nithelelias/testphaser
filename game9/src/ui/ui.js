import { TICK_HOUR } from "../constants.js";
import { Deffered, definePropertyToChild, iterate } from "../utils.js";
export function generateRectTexture(scene) {
  if (!scene.textures.list.hasOwnProperty("bar")) {
    let g = scene.make.graphics({ add: false });
    g.fillStyle(0xff0000);
    g.fillRect(0, 0, 10, 10);
    g.generateTexture("bar", 8, 8);
    g.generateTexture("rect", 8, 8);
    g.clear();
  }
}

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

  let backgroundBar = scene.add
    .image(0, 0, "bar")
    .setOrigin(0, 0.5)
    .setDisplaySize(width, height)
    .setTintFill(settings.backgroundColor);

  let barBorder = scene.add
    .image(-2, 0, "bar")
    .setOrigin(0, 0.5)
    .setTintFill(0x111111)
    .setDisplaySize(width + 4, height + 4);

  let bar = scene.add
    .image(0, 0, "bar")
    .setOrigin(0, 0.5)
    .setTintFill(settings.color);

  const container = scene.add.container(x, y, [backgroundBar, barBorder, bar]);

  definePropertyToChild(this, "x", container);
  definePropertyToChild(this, "y", container);
  this.width = width;
  this.height = height;

  this.setValue = (p) => {
    bar.setDisplaySize(width * (p / 100), height);
  };

  this.getContainer = () => container;
  this.destroy = () => {
    bar.destroy();
    backgroundBar.destroy();
    barBorder.destroy();
    container.destroy();
  };
  this.setTimeout = (timeLoops, callback, type) => {
    var deffered = new Deffered();
    /// 3 real seconds, 2 game minutes., 1 GAME HOURS
    const delay = type === 3 ? 1000 : type === 2 ? TICK_HOUR / 60 : TICK_HOUR;
    let cicles = 0;
    let clock = scene.time.addEvent({
      delay,
      repeat: timeLoops,
      callback: () => {
        cicles++;
        let progress = (cicles / timeLoops) * 100;
        this.setValue(progress);
        callback && callback(progress);
        if (progress >= 100) {
          clock.destroy();
          deffered.resolve();
        }
      },
    });

    return deffered.promise;
  };
  this.setValue(0);
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

export function UI_textAndBar(
  scene,
  x,
  y,
  width,
  label,
  onUpdate,
  barSettings
) {
  let labelsize = width * 0.3;
  this.title = scene.add
    .bitmapText(5, 0, "font1", label, 16)
    .setMaxWidth(labelsize)
    .setTint(0x111011)
    .setDropShadow(1, 1)
    .setOrigin(0, 0.5);

  this.bar = new ProgressBar(
    scene,
    this.title.x + labelsize * 0.9,
    this.title.y,
    width * 0.7,
    12,
    barSettings
  );

  let backgroundBorder = scene.add
    .image(0, 0, "bar")
    .setOrigin(0, 0.5)
    .setTintFill(0xf1f1f1)
    .setDisplaySize(width, 25);
  let backgroundBorderShadow = scene.add
    .image(2, 15, "bar")
    .setOrigin(0, 0.5)
    .setTintFill(0x808080)
    .setDisplaySize(width - 4, 1);
  const container = scene.add.container(x, y, [
    backgroundBorder,
    backgroundBorderShadow,
    this.bar.getContainer(),
    this.title,
  ]);

  definePropertyToChild(this, "x", container);
  definePropertyToChild(this, "y", container);

  this.setValue = (v) => {
    this.bar.setValue(v);
    if (onUpdate) {
      onUpdate(v);
    }
  };
  this.getContainer = () => container;
  this.remove = this.destroy = () => {
    this.bar.destroy();
    this.title.destroy();
    container.destroy();
  };
}

export function CircularProgress(
  scene,
  x,
  y,
  radius = 30,
  innerRadius = 0,
  color = 0xffffff
) {
  var onUpdate_callback;
  var progress = 100;

  // Creación de la forma circular
  const radialProgressBar = scene.add.graphics(0, 0);
  const container = scene.add.container(x, y, [radialProgressBar]);
  container.setAngle(-90);
  const update = () => {
    var angle = {
      min: 0,
      max: (360 * progress) / 100,
    };

    var lineWidth = radius - innerRadius;
    //while circle not full (not done loading/not reached spawn time/not repaired fully)
    radialProgressBar.clear();
    radialProgressBar.lineStyle(lineWidth, color, 1);
    radialProgressBar.beginPath();
    radialProgressBar.arc(
      0,
      0,
      radius / 2,
      angle.min,
      Phaser.Math.DegToRad(-angle.max),
      true
    );
    radialProgressBar.strokePath();
    radialProgressBar.closePath();
  };

  this.onUpdate = (_onUpdate_callback) => {
    onUpdate_callback = _onUpdate_callback;
  };
  this.setValue = (v) => {
    progress = v;
    update();
    if (onUpdate_callback) {
      onUpdate_callback(v);
    }
  };
  this.remove = this.destroy = () => {
    radialProgressBar.destroy();
    container.destroy();
  };

  definePropertyToChild(this, "x", container);
  definePropertyToChild(this, "y", container);

  update();
}

export class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, labelText, fontSize = 16, color = 0xf1f1f1) {
    super(scene, x, y, []);
    scene.add.existing(this);
    this.isButton = true;
    var padding = 10;
    var callback_onCLick = null;
    this.text = scene.add
      .bitmapText(0, -2, "font1", labelText, fontSize)
      .setTint(0x111011)
      .setDropShadow(1, 1)
      .setOrigin(0.5);
    const background = scene.add
      .image(0, 0, "rect")
      .setOrigin(0.5)
      .setTintFill(color);

    const backgroundShadow = scene.add
      .image(0, background.displayHeight * 0.4, "rect")
      .setOrigin(0.5)
      .setTintFill(0x808080);

    // FIT
    this.add([backgroundShadow, background, this.text]);

    const renderInteracive = () => {
      background.setDisplaySize(
        this.text.width + padding,
        this.text.height + padding
      );
      backgroundShadow.setDisplaySize(
        background.displayWidth,
        background.displayHeight * 0.3
      );
      this.x = this.text.width / 2 + x;
      this.setSize(background.displayWidth, background.displayHeight + 5);
      this.setInteractive();
      return this;
    };

    this.getContent = () => {
      return this;
    };
    this.onClick = (callback) => {
      callback_onCLick = callback;
      return this;
    };
    this.addIcon = (icon) => {
      icon.x = this.width / -2 + icon.displayWidth / 2;
      this.add(icon);
      return this;
    };
    this.setMaxWidth = (width) => {
      this.text.setMaxWidth(width);
      renderInteracive();
      return this;
    };
    let onPointerDown = () => {
      // SPEED UP
      this.y += 3;
      backgroundShadow.y -= 3;
      scene.input.once(
        "pointerup",
        (p, g) => {
          // SPEED DOWN
          this.y -= 3;
          backgroundShadow.y += 3;
          if (g.length > 0 && g[0] === this) {
            scene.sounds.click.play();
            if (callback_onCLick) {
              callback_onCLick();
            }
          }
        },
        true
      );
    };

    renderInteracive();
    this.on("pointerdown", onPointerDown, true);
    //scene.input.enableDebug(container, 0xff00ff);
  }
}

export function PanelInfo(
  scene,
  x,
  y,
  text,
  width = 100,
  height = 32,
  labelColor = 0x111111,
  panelColor = 0xffffff
) {
  this.panelBG = scene.add
    .image(0, 0, "rect")
    .setOrigin(0)
    .setTintFill(panelColor)
    .setDisplaySize(width, height);

  this.text = scene.add
    .bitmapText(0, 1, "font1", text, 32)
    .setTint(labelColor)
    .setDropShadow(0, 1, 0x000000)
    .setOrigin(0);
  const container = scene.add.container(x, y, [this.panelBG, this.text]);
  this.alignCenter = () => {
    this.text.setOrigin(0.5, 0);
    this.text.x = this.panelBG.displayWidth / 2;
    return this;
  };
  this.getContainer = () => {
    return container;
  };
  this.destroy = () => {
    this.panelBG.destroy();
    this.text.destroy();
    container.destroy();
  };
}

export class FullPanelWrapper extends Phaser.GameObjects.Container {
  constructor(scene, bodychilds = []) {
    super(scene, 0, 0, []);
    var on_show_callback = null;
    scene.add.existing(this);

    this.panelBG = scene.add
      .image(0, 0, "rect")
      .setOrigin(0)
      .setTintFill(0x1e1c1c)
      .setAlpha(0.9)
      .setDisplaySize(scene.scale.width, scene.scale.height)
      .setInteractive();
    const btnIcon = scene.add
      .sprite(0, 0, "icons", 28)
      .setDisplaySize(22, 22)
      .setTint(0x111);
    const btn = new Button(scene, scene.scale.width - 32, 16, "  ").addIcon(
      btnIcon
    );

    btn.onClick(() => {
      this.hide();
    });
    this.bodycontent = new VerticalScrollLayout(
      scene,
      10,
      40,
      scene.scale.width - 20,
      scene.scale.height - 80,
      bodychilds
    );

    this.add([this.panelBG, btn.getContent(), this.bodycontent]);

    this.show = () => {
      this.bodycontent.scrollTop();
      this.setVisible(true);
      on_show_callback && on_show_callback();
    };
    this.hide = () => {
      this.setVisible(false);
    };
    this.onShow = (_callback) => {
      on_show_callback = _callback;
    };
  }
}

export class VerticalScrollLayout extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, elements = []) {
    super(scene, x + width / 2, y + height / 2, [
      scene.add.container(15, 0, []),
    ]);
    this.start = {
      x: 0,
      y: 0,
    };
    this.setSize(width, height);
    this.setInteractive();
    this.contentlist = this.list[0];
    this.contentlist.add(elements);
    this.fit();

    const hideElementsOutBounds = () => {
      // NO
      return;
      // let topY = this.start.y - this.contentlist.y;
      // let bottomY = topY + this.height;
      // this.contentlist.list.forEach((element, idx) => {
      //   element.setVisible(element.y > topY && element.y < bottomY);
      // });
    };
    //  scene.input.enableDebug(this, 0xff0000);
    // drag and drop
    let press = false;
    let fromP = null;
    const onmove = (p) => {
      if (!press) {
        return;
      }
      if (!scene.input.activePointer.isDown) {
        return;
      }
      let vy = p.y - fromP.y;
      this.contentlist.y = Math.max(
        this.maxScrollY,
        Math.min(0, this.contentlist.y + vy)
      );
      fromP = { x: p.x, y: p.y };
      hideElementsOutBounds();
      // HIDE ELEMENTS
    };
    this.on(
      "pointerdown",
      (p) => {
        press = true;
        fromP = { x: p.x, y: p.y };

        scene.input.on("pointermove", onmove, true);
      },
      true
    );
    scene.input.on(
      "pointerup",
      (fromP) => {
        press = false;

        scene.input.removeListener("pointermove", onmove, true);
      },
      true
    );
    hideElementsOutBounds();
  }
  fit() {
    this.start = {
      x: -this.width / 2,
      y: -this.height / 2,
    };
    let pointerX = 0;
    let pointerY = 0;
    let margin = 10;
    this.maxScrollY = 0;
    this.contentlist.list.forEach((element, idx) => {
      let w = element.displayWidth || element.width;
      let h = element.displayHeight || element.height;
      element.x = this.start.x + pointerX + w / 2;
      element.y = this.start.y + pointerY + h / 2;
      pointerY += h + margin;
    });
    this.maxScrollY = Math.min(0, this.height - pointerY);
  }
  setContent(_elements) {
    // remove elements
    this.contentlist.remove(this.contentlist.list);
    this.contentlist.add(_elements);
    this.fit();
  }
  scrollTop() {
    this.contentlist.y = 0;
  }
}
export function typedMessage(scene, text, x, y, fontSize = 16) {
  var deferred = new Deffered();
  let parsedText = [].concat(text).map((t) => [...t]);

  let message_text = new Array(parsedText.length).fill("");
  //  [ "...","...."]
  var bitmapText = scene.add.dynamicBitmapText(
    x,
    y,
    "font1",
    message_text,
    fontSize
  );
  let maxIdx = parsedText.length - 1;
  let idx = 0;
  let count = 0;
  var clock = scene.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      if (idx > maxIdx) {
        deferred.resolve();
        return;
      }
      count++;

      let char = parsedText[idx].shift();
      message_text[idx] += char;
      bitmapText.setText(message_text);
      if (parsedText[idx].length === 0) {
        idx++;
      }
    },
  });

  return {
    clock,
    bitmapText,
    promise: deferred.promise,
    destroy: () => {
      bitmapText.destroy();
      clock.destroy();
    },
    onComplete: (callback) => deferred.promise.then(callback),
  };
}

export class FullBar extends Phaser.GameObjects.Container {
  constructor(
    scene,
    x,
    y,
    parts,
    maxWidth,
    height,
    color = 0xffffff,
    backgroundColor = 0x111111
  ) {
    super(scene, x, y, []);
    this.parts = parts;
    this.color = color;
    this.offset = 5;
    this.partSize = maxWidth / parts - this.offset;
    this.backgroundColor = backgroundColor;
    this.setSize(maxWidth, height);
    this.background = this.scene.add
      .image(0, 0, "bar")
      .setDisplaySize(this.width, this.height)
      .setOrigin(0, 0.5)
      .setTintFill(this.backgroundColor);

    this.pieceContainer = scene.add.container(0, 0, []);
    this.add([this.background, this.pieceContainer]);
  }
  getValue() {
    return this.pieceContainer.list.length;
  }
  setValue(n) {
    let dif = n - this.getValue();
    if (dif < 1) {
      this.pieceContainer.list.forEach((bar, idx) => {
        if (n > idx + 1) {
          bar.destroy();
        }
      });
    } else {
      this.addPart(dif);
    }
  }
  addPart(n = 1) {
    iterate(n, () => {
      let bar = this.scene.add
        .image(0, 0, "bar")
        .setDisplaySize(this.partSize, this.height)
        .setOrigin(0, 0.5)
        .setTintFill(this.color);
      bar.isPiece = true;
      this.pieceContainer.add(bar);
    });
    this.fit();
  }
  removePart(n = 1) {
    iterate(n, (_i) => {
      if (this.pieceContainer.list.length > 0) {
        this.pieceContainer.list.pop().destroy();
      }
    });
  }
  fit() {
    this.pieceContainer.list.forEach((bar, idx) => {
      if (bar.isPiece) {
        bar.x = this.partSize * idx + this.offset * idx;
      }
    });
  }
}
