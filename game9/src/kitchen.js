import { buyCoffee, buyFoodIngredient, recoverHP } from "./context.js";
import FOODS from "./data/foods.js";
import SOUNDS from "./sounds.js";
import STATE from "./state.js";
import { Button, FullBar, ProgressBar } from "./ui/ui.js";
import { Deffered, shakeObject, tweenOnPromise } from "./utils.js";
const MAX_DISHES = 3;
class TakeAndBuyView extends Phaser.GameObjects.Container {
  constructor(scene, title, value, max, onTake, onBuy) {
    super(scene, 0, 0, []);
    scene.add.existing(this);
    const maxWidth = this.scene.scale.width - 40;
    const titleText = this.scene.add
      .bitmapText(20, 200, "font1", title + " " + value + "/" + max, 32)
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0, 0.5)
      .setMaxWidth(maxWidth);

    titleText.update = () => {
      titleText.setText(title + " " + fullBar.getValue() + "/" + max);
    };

    const fullBar = new FullBar(
      this.scene,
      20,
      200 + titleText.height,
      max,
      maxWidth,
      16
    );
    fullBar.addPart(value);
    this.fullBar = fullBar;
    const takeButton = new Button(this.scene, 24, 264, "Tomar", 32);
    const buyButton = new Button(this.scene, maxWidth, 264, "Comprar", 32);
    buyButton.x = scene.scale.width - buyButton.width / 2 - 10;
    this.takeButton = takeButton;
    this.buyButton = buyButton;
    takeButton.onClick(() => {
      if (fullBar.getValue() < 1) {
        return;
      }
      if (onTake()) {
        fullBar.removePart(1);
      }
      titleText.update();
    });
    buyButton.onClick(() => {
      if (fullBar.getValue() < max) {
        if (onBuy()) {
          fullBar.addPart(1);
        }
        titleText.update();
      }
    });
    this.add([titleText, buyButton, takeButton, fullBar]);
  }
  setValue(n) {
    this.fullBar.setValue(n);
  }
}

export default class Kitchen extends Phaser.GameObjects.Container {
  static current_instance = null;
  constructor(scene, x, y) {
    super(scene, x, y, [
      scene.add.image(0, 0, "kitchen", 4).setDisplaySize(64, 128),
      scene.add.image(0, 0, "kitchen", 3).setDisplaySize(64, 128),
      scene.add.image(0, 0, "kitchen", 2).setDisplaySize(64, 128),
      scene.add.image(0, 0, "kitchen", 1).setDisplaySize(64, 128),
      scene.add.image(0, 0, "kitchen", 0).setDisplaySize(64, 128),
    ]);
    Kitchen.current_instance = this;
    this.clean_dishes = MAX_DISHES;
    this.trashcan = this.list[0];
    this.stove = this.list[1];
    this.sink = this.list[2];
    this.fridge = this.list[3];
    this.coffeedesk = this.list[4];
    this.fridge_ingredients = 0;
    this.list.forEach((element, idx) => {
      element.x = -64 * idx;
      element.setInteractive();
    });
    this.currentActions = [];
  }
  setUnbindCurrentAction(callback) {
    this.currentActions.push(callback);
  }
  clearCurrentAction() {
    if (this.currentActions.length === 0) {
      return false;
    }
    let unbindFunction = this.currentActions.pop();
    unbindFunction();
    return true;
  }
  static start() {
    return Kitchen.current_instance.__start();
  }
  async __start() {
    const deferred = new Deffered();
    const unBindlisteners = [];
    const endButton = new Button(
      this.scene,
      this.scene.scale.width / 2,
      this.scene.scale.height - 64,
      " Terminar ",
      32
    );
    const ingredientText = this.scene.add.container(0, endButton.y - 64, [
      this.scene.add
        .bitmapText(20, 0, "font1", "Ingredientes: 0", 32)
        .setTint(0xffffff)
        .setDropShadow(1, 1)
        .setOrigin(0, 0.5)
        .setMaxWidth(this.scene.scale.width - 64),
      this.scene.add
        .bitmapText(20, -32, "font1", "platos Limpios: 3", 32)
        .setTint(0xffffff)
        .setDropShadow(1, 1)
        .setOrigin(0, 0.5)
        .setMaxWidth(this.scene.scale.width - 64),
      new Button(this.scene, this.scene.scale.width - 64, 0, " - ", 16),
    ]);

    //ingredientText.list[0].x -= ingredientText.list[0].width / 2;
    ingredientText.update = () => {
      ingredientText.list[0].setText(
        "Ingredientes: " + this.fridge_ingredients
      );
      ingredientText.list[1].setText("Platos Limpios: " + this.clean_dishes);
      ingredientText.setVisible(this.fridge_ingredients > 0);
    };
    ingredientText.onReduce = null;
    ingredientText.list[2].text.setFontSize(32);
    ingredientText.list[2].text.y += 4;
    ingredientText.list[2].onClick(() => {
      this.fridge_ingredients = Math.max(0, this.fridge_ingredients - 1);
      ingredientText.update();
      ingredientText.onReduce && ingredientText.onReduce();
    });
    ingredientText.update();
    this.ingredientText = ingredientText;
    this.endButton = endButton;

    // init listeners
    const onEnd = () => {
      endButton.destroy();
      ingredientText.destroy();
      deferred.resolve();
      this.fridge_ingredients = 0;
      unBindlisteners.forEach((unlistener) => unlistener());
    };

    const onclick = (element, callback) => {
      const onclickEvent = () => {
        element.once("pointerup", callback, false);
      };
      element.on("pointerdown", onclickEvent, false);
      unBindlisteners.push(() => {
        element.removeListener("pointerdown", onclickEvent);
      });
    };

    endButton.x -= endButton.width / 2;
    endButton.onClick(() => {
      if (this.clearCurrentAction()) {
        return;
      }
      onEnd();
    });

    onclick(this.coffeedesk, () => {
      this.useCoffeMachine(128 + this.coffeedesk.x);
    });
    onclick(this.fridge, () => {
      this.useFridge(128 + this.fridge.x);
    });
    onclick(this.stove, () => {
      this.useStove(128 + this.stove.x);
    });
    onclick(this.sink, () => {
      this.useSink(128 + this.sink.x);
    });
    return deferred.promise;
  }
  useCoffeMachine(x) {
    if (this.busy) {
      return;
    }
    this.clearCurrentAction();

    const player = this.scene.player;

    player.setPosition(x, player.y);
    const onBuy = () => {
      return buyCoffee(1);
    };
    const onTake = () => {
      this.ingredientText.setVisible(false);
      STATE.INVENTORY.coffee = Math.max(0, STATE.INVENTORY.coffee - 1);
      container.setVisible(false);
      SOUNDS.coffee_preparation.play();
      this.doAction("Preparando cafe", FOODS.coffee.preparation_time)
        .then(() => {
          SOUNDS.coffee_preparation.stop();
          SOUNDS.coffee_pour.play();
          return this.doAction("Tomando cafe", FOODS.coffee.consume_time);
        })
        .then(() => {
          SOUNDS.coffee_pour.stop();
          container.setVisible(true);
          this.ingredientText.update();
          recoverHP(FOODS.coffee.recover);
        });
      return true;
    };
    const container = new TakeAndBuyView(
      this.scene,
      "Coffee",
      STATE.INVENTORY.coffee,
      FOODS.coffee.max,
      onTake,
      onBuy
    );
    // create progress bar full,  create drink button,

    this.setUnbindCurrentAction(() => {
      container.destroy();
      player.setPosition(0, player.y);
    });
  }
  useFridge(x) {
    if (this.busy) {
      return;
    }
    this.clearCurrentAction();
    const player = this.scene.player;
    player.setPosition(x, player.y);

    const onTake = () => {
      // STORE INGREDIENT TO USE ON STOVE!
      this.fridge_ingredients++;
      this.ingredientText.update();
      return true;
    };
    const onBuy = () => {
      return buyFoodIngredient(1);
    };
    const container = new TakeAndBuyView(
      this.scene,
      "Ingredientes",
      STATE.INVENTORY.ingredients - this.fridge_ingredients,
      FOODS.ingredient.max,
      onTake,
      onBuy
    );
    this.ingredientText.onReduce = () => {
      container.setValue(STATE.INVENTORY.ingredients - this.fridge_ingredients);
    };
    this.setUnbindCurrentAction(() => {
      container.destroy();
      player.setPosition(0, player.y);
    });
  }
  useStove(x) {
    if (this.busy) {
      return;
    }
    this.clearCurrentAction();
    const container = this.scene.add.container(0, 0, []);
    const player = this.scene.player;
    player.setPosition(x, player.y);

    const shakeText = (text) => {
      text.setScale(1.2);
      text.setDepth(2);
      text.setTintFill(0xff0000);
      shakeObject(text, 300, 0.2).then(() => {
        text.setScale(1);
        text.setTintFill(0xffffff);
      });
    };
    const titleText = this.scene.add
      .bitmapText(20, 160, "font1", "Cocinar", 64)
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0, 0.5)
      .setMaxWidth(this.scene.scale.width / 2);
    titleText.x = this.scene.scale.width / 2 - titleText.width / 2;
    const helpText = this.scene.add
      .bitmapText(
        this.scene.scale.width / 2,
        titleText.y + titleText.height / 2 + 12,
        "font1",
        ["Se usaran todos los ingredientes","Que tomes del regrigerador"],
        16
      )
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0.5)
      .setMaxWidth(this.scene.scale.width * 0.8);
    const helpText2 = this.scene.add
      .bitmapText(
        this.scene.scale.width / 2,
        helpText.y + helpText.height / 2 + 12,
        "font1",
        "No debe haber platos sucios",
        16
      )
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0.5)
      .setMaxWidth(this.scene.scale.width * 0.8);
    const coockBtn = new Button(
      this.scene,
      this.scene.scale.width / 2,
      helpText2.y + helpText2.height + 32,
      "Cocinar",
      32
    );
    coockBtn.x -= coockBtn.width / 2;
    coockBtn.onClick(() => {
      if (this.fridge_ingredients < 1) {
        shakeText(helpText);
        return;
      }
      if (this.clean_dishes < 1) {
        shakeText(helpText2);
        return;
      }
      container.setVisible(false);
      var preparation_duration =
        this.fridge_ingredients * FOODS.ingredient.preparation_time;
      var consume_duration = FOODS.meal.consume_time;
      var recovery =
        FOODS.meal.recover + this.fridge_ingredients * FOODS.ingredient.recover;

      // UPDATE INGREDIENTS FROM INVENTORY
      STATE.INVENTORY.ingredients = Math.max(
        0,
        STATE.INVENTORY.ingredients - this.fridge_ingredients
      );
      // REDUCE
      this.fridge_ingredients = 0;
      this.clean_dishes -= 1;
      //
      this.ingredientText.update();
      this.doAction("Cocinando", preparation_duration)
        .then(() => {
          return this.doAction("Comiendo", consume_duration);
        })
        .then(() => {
          container.setVisible(true);
          recoverHP(recovery);
        });
    });
    container.add([helpText, helpText2, titleText, coockBtn]);
    this.setUnbindCurrentAction(() => {
      container.destroy();
      player.setPosition(0, player.y);
    });
  }
  useSink(x) {
    if (this.busy) {
      return;
    }
    this.clearCurrentAction();
    const container = this.scene.add.container(0, 0, []);
    const player = this.scene.player;
    player.setPosition(x, player.y);
    //////////
    const titleText = this.scene.add
      .bitmapText(this.scene.scale.width / 2, 200, "font1", "Lavado", 48)
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0.5)
      .setMaxWidth(this.scene.scale.width * 0.8);

    const drinkBtn = new Button(
      this.scene,
      32,
      titleText.y + titleText.height + 32,
      ["Tomar", "Agua"],
      32
    );
    drinkBtn.onClick(() => {
      this.ingredientText.setVisible(false);
      container.setVisible(false);
      SOUNDS.coffee_pour.play();
      this.doAction("Sirviendo agua", FOODS.water.preparation_time)
        .then(() => {
          SOUNDS.coffee_pour.stop();
          return this.doAction("Tomando Agua", FOODS.water.consume_time);
        })
        .then(() => {
          container.setVisible(true);
          this.ingredientText.update();
          recoverHP(FOODS.water.recover);
        });
      return true;
    });
    const washDishesBtn = new Button(
      this.scene,
      this.scene.scale.width / 2 - 16,
      titleText.y + titleText.height + 32,
      ["Lavar", "platos(00)"],
      32
    );
    washDishesBtn.update = () => {
      let dirty = MAX_DISHES - this.clean_dishes;
      washDishesBtn.text.setText(["Lavar", `platos(${dirty})`]);
    };
    washDishesBtn.update();
    washDishesBtn.onClick(() => {
      if (this.clean_dishes >= MAX_DISHES) {
        return;
      }
      this.ingredientText.setVisible(false);
      container.setVisible(false);
      this.doAction("Lavando platos", 5 - this.clean_dishes).then(() => {
        this.clean_dishes = MAX_DISHES;
        washDishesBtn.update();
        container.setVisible(true);
        this.ingredientText.update();
      });
    });
    container.add([titleText, drinkBtn, washDishesBtn]);
    ///////
    this.setUnbindCurrentAction(() => {
      container.destroy();
      player.setPosition(0, player.y);
    });
  }
  /**
   *  wait n seconds to do something....
   * @param {string} title
   * @param {number} realSeconds
   */
  async doAction(title, realSeconds = 1) {
    this.endButton.setVisible(false);
    this.busy = true;
    const titleText = this.scene.add
      .bitmapText(20, 200, "font1", title, 32)
      .setTint(0xffffff)
      .setDropShadow(1, 1)
      .setOrigin(0, 0.5);
    titleText.x = this.scene.scale.width / 2 - titleText.width / 2;
    const progress_width = this.scene.scale.width - 40;
    const progress = new ProgressBar(this.scene, 20, 300, progress_width, 16);
    await progress.setTimeout(realSeconds, null, 3);
    progress.destroy();
    titleText.destroy();
    this.endButton.setVisible(true);
    this.busy = false;
  }
}
